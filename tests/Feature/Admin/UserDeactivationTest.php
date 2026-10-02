<?php

use App\Models\User;
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
});

test('non admins cannot deactivate or reactivate users', function () {
    $student = studentUser();
    $other = studentUser();

    $this->actingAs($student)->delete("/admin/users/{$other->id}")->assertForbidden();
    $this->actingAs($student)->patch("/admin/users/{$other->id}/restore")->assertForbidden();

    $this->assertNotSoftDeleted('users', ['id' => $other->id]);
});
