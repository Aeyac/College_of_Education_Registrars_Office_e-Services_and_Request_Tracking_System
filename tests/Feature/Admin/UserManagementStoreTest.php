<?php

use App\Models\AlumniVerification;
use App\Models\Course;
use App\Models\Major;
use App\Models\User;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

// The registration rules are date dependent (student number year prefix and
// batch year range), so pin the clock instead of letting the suite drift.
beforeEach(function () {
    Carbon::setTestNow('2026-10-15 09:00:00');
});

afterEach(function () {
    Carbon::setTestNow();
});

function managerAccount(): User
{
    $role = Role::firstOrCreate(['name' => 'admin']);

    return tap(User::factory()->admin()->create())->assignRole($role);
}

function aCourse(string $code = 'test_course'): Course
{
    return Course::firstOrCreate(['code' => $code], ['label' => 'Test Course']);
}

function aMajor(Course $course, string $code = 'mathematics'): Major
{
    return Major::firstOrCreate(
        ['course_id' => $course->id, 'code' => $code],
        ['label' => 'Mathematics']
    );
}

// A payload that satisfies every shared rule, so each test can break one field.
function validStudentPayload(array $overrides = []): array
{
    return array_merge([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan.dc@clsu.edu.ph',
        'user_type' => 'student',
        'student_number' => '25-1234',
        'course_id' => aCourse()->id,
        'contact_number' => '+639171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ], $overrides);
}

function validAlumniPayload(array $overrides = []): array
{
    return array_merge([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
        'email' => 'maria.santos@gmail.com',
        'user_type' => 'alumni',
        'batch_year' => '2024',
        'course_id' => aCourse('alumni_course')->id,
        'contact_number' => '+639171234567',
        'password' => 'password',
        'password_confirmation' => 'password',
    ], $overrides);
}

test('an admin can add a student using the registration rules', function () {
    $admin = managerAccount();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload())
        ->assertSessionHasNoErrors();

    $user = User::where('email', 'juan.dc@clsu.edu.ph')->firstOrFail();

    expect($user->user_type)->toBe('student')
        ->and($user->student_number)->toBe('25-1234')
        // Derived from the "25" prefix: 2026 - 2025 + 1
        ->and($user->year_level)->toBe(2)
        ->and($user->batch_year)->toBeNull()
        ->and($user->hasRole('student'))->toBeTrue();
});

test('a student email must use a CLSU domain, as on the registration page', function () {
    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload(['email' => 'juan@gmail.com']))
        ->assertSessionHasErrors('email');

    $this->assertDatabaseMissing('users', ['email' => 'juan@gmail.com']);
});

test('the email is normalised to lowercase before the unique check', function () {
    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload(['email' => '  Juan.DC@CLSU.edu.ph ']))
        ->assertSessionHasNoErrors();

    $this->assertDatabaseHas('users', ['email' => 'juan.dc@clsu.edu.ph']);
});

test('student numbers must use the YY-NNNN format and an accepted year prefix', function () {
    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload(['student_number' => '251234']))
        ->assertSessionHasErrors('student_number');

    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload(['student_number' => '10-1234']))
        ->assertSessionHasErrors('student_number');

    $this->assertDatabaseMissing('users', ['email' => 'juan.dc@clsu.edu.ph']);
});

test('student numbers must be unique', function () {
    User::factory()->create(['student_number' => '25-1234']);

    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload())
        ->assertSessionHasErrors('student_number');
});

test('a missing student number is rejected for students', function () {
    $payload = validStudentPayload();
    unset($payload['student_number']);

    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', $payload)
        ->assertSessionHasErrors('student_number');
});

test('the contact number must be in international format', function () {
    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload(['contact_number' => '09171234567']))
        ->assertSessionHasErrors('contact_number');

    $this->assertDatabaseMissing('users', ['email' => 'juan.dc@clsu.edu.ph']);
});

test('the password must be confirmed', function () {
    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload(['password_confirmation' => 'something-else']))
        ->assertSessionHasErrors('password');

    $this->assertDatabaseMissing('users', ['email' => 'juan.dc@clsu.edu.ph']);
});

test('the major must belong to the selected course', function () {
    $course = aCourse('chosen_course');
    $otherMajor = aMajor(aCourse('other_course'), 'filipino');

    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload([
            'course_id' => $course->id,
            'major_id' => $otherMajor->id,
        ]))
        ->assertSessionHasErrors('major_id');
});

test('alumni accounts require a batch year within range', function (int $batchYear) {
    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', validAlumniPayload(['batch_year' => $batchYear]))
        ->assertSessionHasErrors('batch_year');

    $this->assertDatabaseMissing('users', ['email' => 'maria.santos@gmail.com']);
})->with([
    'future year' => [2027],
    'too old' => [1899],
    'not four digits' => [24],
]);

test('alumni accounts require a batch year', function () {
    $payload = validAlumniPayload();
    unset($payload['batch_year']);

    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', $payload)
        ->assertSessionHasErrors('batch_year');
});

test('registration still requires alumni to upload a proof', function () {
    // Guards the requireProof flag: only the admin path skips the upload.
    $this->post('/register', validAlumniPayload())
        ->assertSessionHasErrors('proof');

    $this->assertDatabaseMissing('users', ['email' => 'maria.santos@gmail.com']);
});

test('an admin created alumni account is verified without a proof document', function () {
    $admin = managerAccount();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->post('/admin/users', validAlumniPayload())
        ->assertSessionHasNoErrors();

    $user = User::where('email', 'maria.santos@gmail.com')->firstOrFail();

    expect($user->student_number)->toBeNull()
        ->and($user->year_level)->toBeNull()
        ->and($user->batch_year)->toBe(2024)
        ->and($user->hasRole('alumni'))->toBeTrue()
        ->and($user->isVerifiedAlumni())->toBeTrue();

    $verification = AlumniVerification::where('user_id', $user->id)->firstOrFail();

    expect($verification->status)->toBe('verified')
        ->and($verification->verified_by)->toBe($admin->id)
        ->and($verification->verified_at)->not->toBeNull()
        ->and($verification->path)->toBeNull()
        ->and($verification->document_type)->toBeNull();
});

test('an admin can create an admin account without a course', function () {
    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', [
            'first_name' => 'Ana',
            'last_name' => 'Reyes',
            'email' => 'ana.reyes@example.com',
            'user_type' => 'admin',
            'contact_number' => '+639171234567',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertSessionHasNoErrors();

    $user = User::where('email', 'ana.reyes@example.com')->firstOrFail();

    expect($user->user_type)->toBe('admin')
        ->and($user->course_id)->toBeNull()
        ->and($user->student_number)->toBeNull()
        ->and($user->hasRole('admin'))->toBeTrue();
});

test('a faculty account still gets a faculty profile', function () {
    $this->actingAs(managerAccount())
        ->from('/admin/users')
        ->post('/admin/users', [
            'first_name' => 'Ben',
            'last_name' => 'Cruz',
            'email' => 'ben.cruz@example.com',
            'user_type' => 'faculty',
            'contact_number' => '+639171234567',
            'password' => 'password',
            'password_confirmation' => 'password',
        ])
        ->assertSessionHasNoErrors();

    $user = User::where('email', 'ben.cruz@example.com')->firstOrFail();

    expect($user->facultyProfile)->not->toBeNull();
});

test('non admins cannot add accounts', function () {
    Role::firstOrCreate(['name' => 'student']);
    $student = tap(User::factory()->create())->assignRole('student');

    $this->actingAs($student)
        ->post('/admin/users', validStudentPayload())
        ->assertForbidden();

    $this->assertDatabaseMissing('users', ['email' => 'juan.dc@clsu.edu.ph']);
});

test('registration and admin account creation reject the same payloads', function (array $overrides, string $field) {
    $admin = managerAccount();

    // Admin path
    $this->actingAs($admin)
        ->from('/admin/users')
        ->post('/admin/users', validStudentPayload($overrides))
        ->assertSessionHasErrors($field);

    // Registration path, as a guest
    $this->app['auth']->forgetGuards();
    $this->from('/register')
        ->post('/register', validStudentPayload($overrides))
        ->assertSessionHasErrors($field);

    $this->assertDatabaseMissing('users', ['email' => 'juan.dc@clsu.edu.ph']);
})->with([
    'student email domain' => [['email' => 'juan@gmail.com'], 'email'],
    'student number format' => [['student_number' => '251234'], 'student_number'],
    'student number year range' => [['student_number' => '10-1234'], 'student_number'],
    'contact number format' => [['contact_number' => '09171234567'], 'contact_number'],
    'unconfirmed password' => [['password_confirmation' => 'nope'], 'password'],
    'major from another course' => [['major_id' => 99999], 'major_id'],
]);

// ---------- Editing an account ----------

// An existing, already valid student to edit.
function anEditableStudent(array $attributes = []): User
{
    return User::factory()->create(array_merge([
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan.dc@clsu.edu.ph',
        'user_type' => 'student',
        'student_number' => '25-1234',
        'year_level' => 2,
        'course_id' => aCourse()->id,
        'contact_number' => '+639171234567',
    ], $attributes));
}

test('editing a student applies the same rules and re-derives the year level', function () {
    $admin = managerAccount();
    $student = anEditableStudent(['student_number' => '24-4321', 'year_level' => 1]);

    // The stored level disagrees with the student number before the edit
    expect($student->year_level)->toBe(1);

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$student->id}", [
            'first_name' => 'Juan Jr',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.dc@clsu.edu.ph',
            'user_type' => 'student',
            'student_number' => '25-1234',
            'course_id' => $student->course_id,
            'contact_number' => '+639171234567',
        ])
        ->assertSessionHasNoErrors();

    $student->refresh();

    expect($student->first_name)->toBe('Juan Jr')
        ->and($student->student_number)->toBe('25-1234')
        // 2026 - 2025 + 1
        ->and($student->year_level)->toBe(2);
});

test('editing an account keeps its own email and student number', function () {
    $admin = managerAccount();
    $student = anEditableStudent();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$student->id}", [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.dc@clsu.edu.ph',
            'user_type' => 'student',
            'student_number' => '25-1234',
            'course_id' => $student->course_id,
            'contact_number' => '+639171234567',
        ])
        ->assertSessionHasNoErrors();
});

test('editing an account rejects another account email', function () {
    $admin = managerAccount();
    $student = anEditableStudent();
    $other = anEditableStudent(['email' => 'other@clsu.edu.ph', 'student_number' => '25-9999']);

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$other->id}", [
            'first_name' => 'Other',
            'last_name' => 'Person',
            'email' => 'juan.dc@clsu.edu.ph',
            'user_type' => 'student',
            'student_number' => '25-9999',
            'course_id' => $other->course_id,
            'contact_number' => '+639171234567',
        ])
        ->assertSessionHasErrors('email');

    $this->assertDatabaseHas('users', ['id' => $student->id, 'email' => 'juan.dc@clsu.edu.ph']);
});

test('editing an account rejects the same invalid values as adding one', function (array $overrides, string $field) {
    $admin = managerAccount();
    $student = anEditableStudent();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$student->id}", array_merge([
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.dc@clsu.edu.ph',
            'user_type' => 'student',
            'student_number' => '25-1234',
            'course_id' => $student->course_id,
            'contact_number' => '+639171234567',
        ], $overrides))
        ->assertSessionHasErrors($field);
})->with([
    'student email domain' => [['email' => 'juan@gmail.com'], 'email'],
    'student number format' => [['student_number' => '251234'], 'student_number'],
    'student number year range' => [['student_number' => '10-1234'], 'student_number'],
    'missing contact number' => [['contact_number' => ''], 'contact_number'],
    'contact number format' => [['contact_number' => '09171234567'], 'contact_number'],
    'missing student number' => [['student_number' => ''], 'student_number'],
    'major from another course' => [['major_id' => 99999], 'major_id'],
]);

test('editing an account leaves the password alone when it is left blank', function () {
    $admin = managerAccount();
    $student = anEditableStudent();
    $originalHash = $student->password;

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$student->id}", [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.dc@clsu.edu.ph',
            'user_type' => 'student',
            'student_number' => '25-1234',
            'course_id' => $student->course_id,
            'contact_number' => '+639171234567',
            'password' => '',
            'password_confirmation' => '',
        ])
        ->assertSessionHasNoErrors();

    expect($student->refresh()->password)->toBe($originalHash);
});

test('editing an account changes the password when it is confirmed', function () {
    $admin = managerAccount();
    $student = anEditableStudent();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$student->id}", [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.dc@clsu.edu.ph',
            'user_type' => 'student',
            'student_number' => '25-1234',
            'course_id' => $student->course_id,
            'contact_number' => '+639171234567',
            'password' => 'new-password',
            'password_confirmation' => 'new-password',
        ])
        ->assertSessionHasNoErrors();

    expect(Hash::check('new-password', $student->refresh()->password))->toBeTrue();
});

test('editing an account rejects an unconfirmed new password', function () {
    $admin = managerAccount();
    $student = anEditableStudent();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$student->id}", [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.dc@clsu.edu.ph',
            'user_type' => 'student',
            'student_number' => '25-1234',
            'course_id' => $student->course_id,
            'contact_number' => '+639171234567',
            'password' => 'new-password',
            'password_confirmation' => 'mismatch',
        ])
        ->assertSessionHasErrors('password');
});

test('promoting an account to alumni creates the verification record it needs', function () {
    $admin = managerAccount();
    $student = anEditableStudent();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$student->id}", [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan.dc@clsu.edu.ph',
            'user_type' => 'alumni',
            'batch_year' => '2024',
            'course_id' => $student->course_id,
            'contact_number' => '+639171234567',
        ])
        ->assertSessionHasNoErrors();

    $student->refresh();

    expect($student->student_number)->toBeNull()
        ->and($student->year_level)->toBeNull()
        ->and($student->batch_year)->toBe(2024)
        ->and($student->hasRole('alumni'))->toBeTrue()
        ->and($student->isVerifiedAlumni())->toBeTrue();

    $verification = $student->alumniVerification;

    expect($verification->status)->toBe('verified')
        ->and($verification->verified_by)->toBe($admin->id)
        ->and($verification->path)->toBeNull();
});

test('an alumni account keeps its existing verification record', function () {
    $admin = managerAccount();

    $this->actingAs($admin)
        ->from('/admin/users')
        ->post('/admin/users', validAlumniPayload())
        ->assertSessionHasNoErrors();

    $alumni = User::where('email', 'maria.santos@gmail.com')->firstOrFail();
    $verificationId = $alumni->alumniVerification->id;

    $this->actingAs($admin)
        ->from('/admin/users')
        ->put("/admin/users/{$alumni->id}", [
            'first_name' => 'Maria Jr',
            'last_name' => 'Santos',
            'email' => 'maria.santos@gmail.com',
            'user_type' => 'alumni',
            'batch_year' => '2024',
            'course_id' => $alumni->course_id,
            'contact_number' => '+639171234567',
        ])
        ->assertSessionHasNoErrors();

    expect($alumni->refresh()->first_name)->toBe('Maria Jr')
        ->and(AlumniVerification::where('user_id', $alumni->id)->count())->toBe(1)
        ->and($alumni->alumniVerification->id)->toBe($verificationId);
});

test('non admins cannot edit accounts', function () {
    Role::firstOrCreate(['name' => 'student']);
    $student = tap(User::factory()->create())->assignRole('student');
    $target = User::factory()->create(['first_name' => 'Target']);

    $this->actingAs($student)
        ->put("/admin/users/{$target->id}", [
            'first_name' => 'Hacked',
            'last_name' => 'Account',
            'email' => $target->email,
            'user_type' => 'student',
            'student_number' => '25-1234',
            'contact_number' => '+639171234567',
        ])
        ->assertForbidden();

    $this->assertDatabaseHas('users', ['id' => $target->id, 'first_name' => 'Target']);
});
