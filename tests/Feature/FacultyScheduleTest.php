<?php

use App\Models\Faculty;
use App\Models\User;
use Spatie\Permission\Models\Role;

function facultyUserWithProfile(array $attributes = []): array
{
    Role::firstOrCreate(['name' => 'faculty']);

    $user = User::factory()->create(array_merge(['user_type' => 'faculty'], $attributes));
    $user->assignRole('faculty');

    $faculty = Faculty::create([
        'user_id' => $user->id,
        'name' => 'Test Faculty',
        'role' => 'Instructor I',
        'department_or_program' => 'DTLLSED',
        'room_or_location' => 'CED 101',
        'weekly_schedule' => [],
    ]);

    return [$user, $faculty];
}

test('faculty can save a manually added weekly schedule', function () {
    [$user, $faculty] = facultyUserWithProfile();

    $response = $this
        ->actingAs($user)
        ->put('/faculty/schedule', [
            'role' => 'Instructor I',
            'department_or_program' => 'DTLLSED',
            'room_or_location' => 'CED 101',
            'weekly_schedule' => [
                [
                    'day' => 'Monday',
                    'start_time' => '08:00',
                    'end_time' => '09:00',
                    'type' => 'class',
                    'room' => 'CED 105',
                    'course_code' => 'TLEIA 2102',
                    'section_code' => 'BTLED-IA_2-1',
                ],
                [
                    'day' => 'Wednesday',
                    'start_time' => '13:00',
                    'end_time' => '15:00',
                    'type' => 'consultation',
                    'room' => 'CED 101',
                    'course_code' => null,
                    'section_code' => null,
                ],
            ],
        ]);

    $response->assertSessionHasNoErrors();

    $faculty->refresh();

    expect($faculty->weekly_schedule)->toHaveCount(2)
        ->and($faculty->weekly_schedule[0]['day'])->toBe('Monday')
        ->and($faculty->weekly_schedule[0]['start_time'])->toBe('08:00')
        ->and($faculty->weekly_schedule[0]['course_code'])->toBe('TLEIA 2102')
        ->and($faculty->weekly_schedule[1]['type'])->toBe('consultation');
});

test('faculty can overwrite a previous schedule', function () {
    [$user, $faculty] = facultyUserWithProfile([
        'id' => 1,
        'first_name' => 'Ana',
        'last_name' => 'Reyes',
    ]);

    $faculty->update([
        'weekly_schedule' => [
            ['day' => 'Friday', 'start_time' => '07:00', 'end_time' => '08:00', 'type' => 'class', 'room' => 'CED 201'],
        ],
    ]);

    $this
        ->actingAs($user)
        ->put('/faculty/schedule', [
            'role' => 'Instructor I',
            'department_or_program' => 'DTLLSED',
            'room_or_location' => 'CED 101',
            'weekly_schedule' => [
                ['day' => 'Tuesday', 'start_time' => '10:00', 'end_time' => '11:30', 'type' => 'class', 'room' => 'CED 105'],
            ],
        ])
        ->assertSessionHasNoErrors();

    $faculty->refresh();

    expect($faculty->weekly_schedule)->toHaveCount(1)
        ->and($faculty->weekly_schedule[0]['day'])->toBe('Tuesday');
});

test('saving a schedule rejects an end time before the start time', function () {
    [$user, $faculty] = facultyUserWithProfile();

    $response = $this
        ->actingAs($user)
        ->put('/faculty/schedule', [
            'role' => 'Instructor I',
            'department_or_program' => 'DTLLSED',
            'room_or_location' => 'CED 101',
            'weekly_schedule' => [
                ['day' => 'Monday', 'start_time' => '09:00', 'end_time' => '08:00', 'type' => 'class', 'room' => 'CED 105'],
            ],
        ]);

    $response->assertSessionHasErrors('weekly_schedule.0.end_time');

    expect($faculty->refresh()->weekly_schedule)->toBe([]);
});

test('saving a schedule creates the faculty profile when the user has none', function () {
    $user = User::factory()->create([
        'user_type' => 'faculty',
        'first_name' => 'Ronn',
        'last_name' => 'Roque',
    ]);
    Role::firstOrCreate(['name' => 'faculty']);
    $user->assignRole('faculty');

    // A faculty row created by an admin has no user_id, so this login has no profile.
    expect($user->facultyProfile)->toBeNull()
        ->and(Faculty::where('user_id', $user->id)->exists())->toBeFalse();

    $this
        ->actingAs($user)
        ->put('/faculty/schedule', [
            'role' => 'Instructor I',
            'department_or_program' => 'DTLLSED',
            'room_or_location' => 'CED 101',
            'weekly_schedule' => [
                ['day' => 'Monday', 'start_time' => '08:00', 'end_time' => '09:00', 'type' => 'class', 'room' => 'CED 105'],
            ],
        ])
        ->assertSessionHasNoErrors();

    $faculty = $user->refresh()->facultyProfile;

    expect($faculty)->not->toBeNull()
        ->and($faculty->user_id)->toBe($user->id)
        ->and($faculty->name)->toBe('Ronn Roque')
        ->and($faculty->weekly_schedule)->toHaveCount(1)
        ->and($faculty->weekly_schedule[0]['day'])->toBe('Monday');
});

test('saving a schedule never reclaims an unlinked admin faculty row', function () {
    $user = User::factory()->create(['user_type' => 'faculty', 'first_name' => 'Ronn', 'last_name' => 'Roque']);
    Role::firstOrCreate(['name' => 'faculty']);
    $user->assignRole('faculty');

    $other = Faculty::create([
        'user_id' => null,
        'name' => 'Someone Else',
        'role' => 'Instructor I',
        'department_or_program' => 'DTLLSED',
        'room_or_location' => 'CED 999',
        'weekly_schedule' => [['day' => 'Friday', 'start_time' => '07:00', 'end_time' => '08:00', 'type' => 'class', 'room' => 'CED 999']],
    ]);

    $this
        ->actingAs($user)
        ->put('/faculty/schedule', [
            'role' => 'Instructor I',
            'department_or_program' => 'DTLLSED',
            'room_or_location' => 'CED 101',
            'weekly_schedule' => [
                ['day' => 'Monday', 'start_time' => '08:00', 'end_time' => '09:00', 'type' => 'class', 'room' => 'CED 105'],
            ],
        ])
        ->assertSessionHasNoErrors();

    expect($other->refresh()->user_id)->toBeNull()
        ->and($other->weekly_schedule)->toHaveCount(1)
        ->and($other->weekly_schedule[0]['day'])->toBe('Friday');
});
