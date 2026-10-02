<?php

use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Spatie\Activitylog\Models\Activity;
use Spatie\Permission\Models\Role;

function adminUser(): User
{
    $role = Role::firstOrCreate(['name' => 'admin']);

    return tap(User::factory()->admin()->create())->assignRole($role);
}

function studentUser(array $attributes = []): User
{
    Role::firstOrCreate(['name' => 'student']);

    return tap(User::factory()->create($attributes))->assignRole('student');
}

test('deactivating a user keeps the record and hides it from the active list', function () {
    $admin = adminUser();
    $student = studentUser();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->delete("/admin/users/{$student->id}")
        ->assertSessionHasNoErrors();

    $this->assertSoftDeleted('users', ['id' => $student->id]);

    $log = Activity::where('event', 'deactivated')->sole();

    expect($log->causer_id)->toBe($admin->id)
        ->and($log->subject_type)->toBe(User::class)
        ->and($log->subject_id)->toBe($student->id)
        ->and($log->description)->toBe('Deactivated user account: '.$student->fullName());

    // The row is kept on the table but scoped out of every normal query
    expect(User::withTrashed()->count())->toBe(2)
        ->and(User::count())->toBe(1);

    $this->actingAs($admin)
        ->get('/admin/users')
        ->assertInertia(fn ($page) => $page
            ->component('Admin/UserManagement')
            ->where('filters.deactivated', false)
            ->where('users.data', fn ($users) => collect($users)->pluck('id')->all() === [$admin->id])
        );
});

test('deactivated users are only listed in the deactivated view', function () {
    $admin = adminUser();
    $student = studentUser();
    $student->delete();

    $this->actingAs($admin)
        ->get('/admin/users?deactivated=1')
        ->assertInertia(fn ($page) => $page
            ->where('filters.deactivated', true)
            ->where('users.data', function ($users) use ($student) {
                $row = collect($users)->firstWhere('id', $student->id);

                return $row !== null
                    && $row['email'] === $student->email
                    && $row['deactivated_at'] !== null;
            })
            ->where('users.total', 1)
        );
});

test('an admin cannot deactivate their own account', function () {
    $admin = adminUser();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->delete("/admin/users/{$admin->id}")
        ->assertSessionHasErrors('delete');

    $this->assertNotSoftDeleted('users', ['id' => $admin->id]);
});

test('the last active admin account cannot be deactivated', function () {
    // The acting account holds the admin role but is not flagged as an admin account,
    // so the target really is the last active admin.
    Role::firstOrCreate(['name' => 'admin']);
    $acting = tap(User::factory()->create(['user_type' => 'faculty']))->assignRole('admin');
    $lastAdmin = adminUser();

    $this->actingAs($acting)
        ->from('/admin/users')
        ->delete("/admin/users/{$lastAdmin->id}")
        ->assertSessionHasErrors('delete');

    $this->assertNotSoftDeleted('users', ['id' => $lastAdmin->id]);
});

test('a deactivated account can be reactivated with its data and roles intact', function () {
    $admin = adminUser();
    $student = studentUser(['first_name' => 'Juan', 'last_name' => 'Dela Cruz']);
    $student->delete();

    $this->actingAs($admin)
        ->from('/admin/users?deactivated=1')
        ->patch("/admin/users/{$student->id}/restore")
        ->assertSessionHasNoErrors();

    $student->refresh();

    $this->assertNotSoftDeleted('users', ['id' => $student->id]);
    expect($student->first_name)->toBe('Juan')
        ->and($student->last_name)->toBe('Dela Cruz')
        ->and($student->hasRole('student'))->toBeTrue();

    $log = Activity::where('event', 'reactivated')->sole();

    expect($log->causer_id)->toBe($admin->id)
        ->and($log->subject_id)->toBe($student->id)
        ->and($log->description)->toBe('Reactivated user account: Juan Dela Cruz');
});

test('editing a user is recorded in the activity log without leaking credentials', function () {
    $admin = adminUser();
    $course = Course::create(['code' => 'test_course', 'label' => 'Test Course']);

    // The enrollment year has to sit inside the allowed year levels
    $academicYear = now()->month >= 6 ? now()->year : now()->year - 1;
    $studentNumber = sprintf('%02d-0001', $academicYear % 100);

    $student = studentUser([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan.dc@clsu.edu.ph',
        'user_type' => 'student',
        'student_number' => $studentNumber,
        'course_id' => $course->id,
    ]);

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$student->id}", [
            'first_name' => 'Juan Miguel',
            'last_name' => 'Dela Cruz',
            'email' => $student->email,
            'user_type' => 'student',
            'student_number' => $studentNumber,
            'course_id' => $course->id,
            'contact_number' => '+639171234567',
            'password' => 'a-new-secret',
            'password_confirmation' => 'a-new-secret',
        ])
        ->assertSessionHasNoErrors();

    $log = Activity::where('event', 'updated')->sole();

    expect($log->causer_id)->toBe($admin->id)
        ->and($log->subject_type)->toBe(User::class)
        ->and($log->subject_id)->toBe($student->id)
        ->and($log->description)->toBe('Updated user profile: Juan Miguel Dela Cruz')
        ->and($log->attribute_changes['attributes']['first_name'])->toBe('Juan Miguel')
        ->and($log->attribute_changes['old']['first_name'])->toBe('Juan')
        ->and($log->attribute_changes['attributes'])->not->toHaveKey('password');

    // The password really changed, it just never reaches the audit trail
    expect(Hash::check('a-new-secret', $student->refresh()->password))->toBeTrue();
});

test('non admins cannot deactivate or reactivate users', function () {
    $student = studentUser();
    $other = studentUser();

    $this->actingAs($student)->delete("/admin/users/{$other->id}")->assertForbidden();
    $this->actingAs($student)->patch("/admin/users/{$other->id}/restore")->assertForbidden();

    $this->assertNotSoftDeleted('users', ['id' => $other->id]);
});
