<?php

use App\Models\Course;
use Spatie\Permission\Models\Role;

test('registration screen can be rendered', function () {
    $response = $this->get('/register');

    $response->assertStatus(200);
});

test('new users can register', function () {
    Role::findOrCreate('student', 'web');

    $course = Course::create([
        'code' => 'test_course',
        'label' => 'Test Course',
    ]);

    $response = $this->post('/register', [
        'first_name' => 'Test',
        'last_name' => 'User',
        'email' => 'test.user@clsu.edu.ph',
        'user_type' => 'student',
        'student_number' => '21-1234',
        'course_id' => $course->id,
        'contact_number' => '+639171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertSessionHasNoErrors();

    $this->assertAuthenticated();
    $response->assertRedirect(route('verification.notice'));

    $this->assertDatabaseHas('users', [
        'email' => 'test.user@clsu.edu.ph',
        'user_type' => 'student',
    ]);
});
