<?php

use App\Models\User;
use Illuminate\Testing\TestResponse;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::firstOrCreate(['name' => 'admin']);
    Role::firstOrCreate(['name' => 'student']);
});

function auditAdmin(): User
{
    return tap(User::factory()->admin()->create())->assignRole('admin');
}

function auditStudent(array $attributes = []): User
{
    return tap(User::factory()->create($attributes))->assignRole('student');
}

function trailRow(TestResponse $response, int $activityId): ?array
{
    $logs = $response->viewData('page')['props']['logs']['data'] ?? [];

    foreach ($logs as $log) {
        if ($log['id'] === $activityId) {
            return $log;
        }
    }

    return null;
}

test('a deactivated account is still named as the subject of its activity', function () {
    $admin = auditAdmin();
    $student = auditStudent(['first_name' => 'Juan', 'last_name' => 'Dela Cruz']);

    $this->actingAs($admin)
        ->from('/admin/users')
        ->delete("/admin/users/{$student->id}")
        ->assertSessionHasNoErrors();

    $activityId = Activity::where('event', 'deactivated')->value('id');

    $row = trailRow(
        $this->actingAs($admin)->get('/admin/audit-trail'),
        $activityId
    );

    expect($row)->not->toBeNull()
        ->and($row['subject_name'])->toBe('Juan Dela Cruz')
        ->and($row['subject_type'])->toBe('User')
        ->and($row['event'])->toBe('deactivated');
});

test('a deactivated admin keeps their name and history on the trail', function () {
    $leaver = auditAdmin();
    $remaining = auditAdmin();
    $student = auditStudent();

    // Two admins, so the last-active-admin guard does not stand in the way
    $this->actingAs($leaver)
        ->from('/admin/users')
        ->delete("/admin/users/{$student->id}")
        ->assertSessionHasNoErrors();

    $activityId = Activity::where('event', 'deactivated')->value('id');

    $this->actingAs($remaining)
        ->from('/admin/users')
        ->delete("/admin/users/{$leaver->id}")
        ->assertSessionHasNoErrors();

    $row = trailRow(
        $this->actingAs($remaining)->get('/admin/audit-trail'),
        $activityId
    );

    expect($row)->not->toBeNull()
        ->and($row['causer_name'])->toBe($leaver->fullName())
        ->and($row['subject_name'])->toBe($student->fullName());
});

test('searching for a deactivated account still finds its activity', function () {
    $admin = auditAdmin();
    $student = auditStudent(['first_name' => 'Juan', 'last_name' => 'Dela Cruz']);

    $this->actingAs($admin)
        ->from('/admin/users')
        ->delete("/admin/users/{$student->id}")
        ->assertSessionHasNoErrors();

    $activityId = Activity::where('event', 'deactivated')->value('id');

    $row = trailRow(
        $this->actingAs($admin)->get('/admin/audit-trail?search=Juan'),
        $activityId
    );

    expect($row)->not->toBeNull()
        ->and($row['subject_name'])->toBe('Juan Dela Cruz');
});
