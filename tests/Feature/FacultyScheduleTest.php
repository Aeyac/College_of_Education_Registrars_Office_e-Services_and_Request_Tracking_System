<?php

use App\Models\Faculty;
use App\Models\User;
use App\Services\FacultyProfileLinker;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Spatie\Permission\Models\Role;

function facultyUser(array $attributes = []): User
{
    Role::firstOrCreate(['name' => 'faculty']);

    $user = User::factory()->create(array_merge([
        'user_type' => 'faculty',
        'email_verified_at' => now(),
    ], $attributes));
    $user->assignRole('faculty');

    return $user;
}

function facultyTestAdmin(): User
{
    Role::firstOrCreate(['name' => 'admin']);

    $admin = User::factory()->create([
        'user_type' => 'admin',
        'email_verified_at' => now(),
    ]);
    $admin->assignRole('admin');

    return $admin;
}

function facultyUserWithProfile(array $attributes = []): array
{
    $user = facultyUser($attributes);

    $faculty = Faculty::create([
        'user_id' => $user->id,
        'name' => $user->fullName(),
        'role' => 'Instructor I',
        'department_or_program' => 'DTLLSED',
        'room_or_location' => 'CED 101',
        'weekly_schedule' => [],
    ]);

    return [$user, $faculty];
}

/** A schedule the registrar uploaded before the professor had an account. */
function unlinkedUpload(string $name, array $attributes = []): Faculty
{
    return Faculty::create(array_merge([
        'user_id' => null,
        'name' => $name,
        'role' => 'Instructor I',
        'department_or_program' => 'DTLLSED',
        'room_or_location' => 'CED 101',
        'weekly_schedule' => [
            ['day' => 'Monday', 'start_time' => '08:00', 'end_time' => '09:00', 'type' => 'class', 'room' => 'CED 105', 'course_code' => 'TLEIA 2102', 'section_code' => 'BTLED-IA_2-1'],
        ],
    ], $attributes));
}

/**
 * Undo everything the link-guard migration adds, so a test can seed the duplicate
 * links that the unique index exists to forbid and then replay the migration.
 *
 * The user_id foreign key has to come off before the unique index, because MariaDB
 * binds the key to whichever index suits it and will not let the index be dropped
 * out from under a live constraint. SQLite has no such rule, but doing the same
 * thing keeps one code path for both drivers.
 */
function rewindLinkGuard(): void
{
    Schema::table('faculty', function (Blueprint $table) {
        $table->dropForeign(['last_edited_by']);
        $table->dropColumn(['last_edited_by', 'edited_by_role']);
    });

    Schema::table('faculty', function (Blueprint $table) {
        $table->dropForeign(['user_id']);
        $table->dropUnique(['user_id']);
    });

    Schema::table('faculty', function (Blueprint $table) {
        $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');
    });
}

function schedulePayload(array $attributes = []): array
{
    return array_merge([
        'role' => 'Instructor II',
        'department_or_program' => 'DTLLSED',
        'room_or_location' => 'CED 202',
        'weekly_schedule' => [
            ['day' => 'Tuesday', 'start_time' => '10:00', 'end_time' => '11:30', 'type' => 'class', 'room' => 'CED 105', 'course_code' => null, 'section_code' => null],
        ],
    ], $attributes);
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

test('saving a schedule never reclaims an admin faculty row with a different name', function () {
    $user = facultyUser(['first_name' => 'Ronn', 'last_name' => 'Roque']);

    $other = unlinkedUpload('Someone Else', ['room_or_location' => 'CED 999']);

    $this
        ->actingAs($user)
        ->put('/faculty/schedule', schedulePayload())
        ->assertSessionHasNoErrors();

    expect($other->refresh()->user_id)->toBeNull()
        ->and($other->weekly_schedule[0]['day'])->toBe('Monday')
        ->and(Faculty::where('user_id', $user->id)->count())->toBe(1);
});

// === The registrar's upload must become the professor's schedule ===

test('a faculty save adopts the matching schedule the registrar uploaded earlier', function () {
    $upload = unlinkedUpload('Maria Santos');
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $this
        ->actingAs($user)
        ->put('/faculty/schedule', schedulePayload())
        ->assertSessionHasNoErrors();

    $upload->refresh();

    expect($upload->user_id)->toBe($user->id)
        ->and(Faculty::count())->toBe(1)
        // The registrar's class survives; the professor's save lands on top of it.
        ->and($upload->weekly_schedule[0]['day'])->toBe('Tuesday')
        ->and($user->refresh()->facultyProfile->id)->toBe($upload->id);
});

test('an uploaded schedule is adopted despite titles, case and punctuation differences', function () {
    $upload = unlinkedUpload('Dr. MARIA L. SANTOS, Jr.');
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $this->actingAs($user)->get('/faculty/schedule')->assertOk();

    expect($upload->refresh()->user_id)->toBe($user->id)
        ->and(Faculty::count())->toBe(1);
});

test('an uploaded schedule is adopted when it carries middle names the account lacks', function () {
    $upload = unlinkedUpload('Prof. Maria Lopez Santos');
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $this->actingAs($user)->get('/faculty/schedule')->assertOk();

    expect($upload->refresh()->user_id)->toBe($user->id)
        ->and(Faculty::count())->toBe(1);
});

test('an uploaded schedule is not adopted when only the surname matches', function () {
    $upload = unlinkedUpload('Maria Cruz');
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $this->actingAs($user)->get('/faculty/schedule')->assertOk();

    expect($upload->refresh()->user_id)->toBeNull()
        // A read must not invent a row either.
        ->and(Faculty::count())->toBe(1);
});

test('two unlinked schedules with the same name are left for the admin to sort out', function () {
    $first = unlinkedUpload('Maria Santos');
    $second = unlinkedUpload('Maria Santos', ['room_or_location' => 'CED 303']);
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $this->actingAs($user)->get('/faculty/schedule')->assertOk();

    expect($first->refresh()->user_id)->toBeNull()
        ->and($second->refresh()->user_id)->toBeNull()
        ->and(Faculty::count())->toBe(2);
});

test('an account that already owns a schedule does not take over an unlinked one', function () {
    [$user, $own] = facultyUserWithProfile(['first_name' => 'Maria', 'last_name' => 'Santos']);
    $upload = unlinkedUpload('Maria Santos', ['room_or_location' => 'CED 999']);

    $this->actingAs($user)->get('/faculty/schedule')->assertOk();

    expect($upload->refresh()->user_id)->toBeNull()
        ->and($user->refresh()->facultyProfile->id)->toBe($own->id)
        ->and(Faculty::count())->toBe(2);
});

// === Registrar side ===

test('re-uploading a schedule updates the existing row instead of adding another', function () {
    $admin = facultyTestAdmin();
    $upload = unlinkedUpload('Maria Santos');

    $this->actingAs($admin)->post('/admin/faculty', schedulePayload([
        'name' => 'Dr. Maria Santos',
        'role' => 'Instructor III',
    ]))->assertSessionHasNoErrors();

    expect(Faculty::count())->toBe(1)
        ->and($upload->refresh()->role)->toBe('Instructor III');
});

test('an upload is linked to an account that exists but has no schedule yet', function () {
    $admin = facultyTestAdmin();
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $this->actingAs($admin)->post('/admin/faculty', schedulePayload(['name' => 'Maria Santos']))
        ->assertSessionHasNoErrors();

    expect(Faculty::count())->toBe(1)
        ->and(Faculty::first()->user_id)->toBe($user->id)
        ->and($user->refresh()->facultyProfile->weekly_schedule)->toHaveCount(1);
});

test('an upload lands on the schedule its account already owns', function () {
    $admin = facultyTestAdmin();
    [$user, $own] = facultyUserWithProfile(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $this->actingAs($admin)->post('/admin/faculty', schedulePayload(['name' => 'Maria Santos']))
        ->assertSessionHasNoErrors();

    // The account keeps its own row and gains the uploaded schedule on it, rather
    // than a rival card appearing beside it for the admin to reconcile.
    expect(Faculty::count())->toBe(1)
        ->and($own->refresh()->user_id)->toBe($user->id)
        ->and($own->weekly_schedule)->toHaveCount(1)
        ->and(Faculty::whereNull('user_id')->count())->toBe(0);
});

test('the admin listing flags an unlinked upload that collides with a linked schedule', function () {
    $admin = facultyTestAdmin();
    facultyUserWithProfile(['first_name' => 'Maria', 'last_name' => 'Santos']);
    unlinkedUpload('Maria L. Santos');

    $this->actingAs($admin)->get('/admin/faculty')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('faculty.data.0.name', 'Maria L. Santos')
            ->where('faculty.data.0.collision', 'Maria Santos')
            ->etc()
        );
});

test('the admin can link a schedule to a specific account by hand', function () {
    $admin = facultyTestAdmin();
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);
    $upload = unlinkedUpload('Ma. S.', ['room_or_location' => 'CED 404']);

    // Too short to match on its own, so only the admin can place it.
    expect($upload->user_id)->toBeNull();

    $this->actingAs($admin)->put('/admin/faculty/link', [
        'faculty_id' => $upload->id,
        'user_id' => $user->id,
    ])->assertSessionHasNoErrors();

    expect($upload->refresh()->user_id)->toBe($user->id)
        ->and(Faculty::where('user_id', $user->id)->count())->toBe(1);
});

test('the admin can unlink a schedule without deleting it', function () {
    $admin = facultyTestAdmin();
    [$user, $faculty] = facultyUserWithProfile();

    $this->actingAs($admin)->put('/admin/faculty/link', [
        'faculty_id' => $faculty->id,
        'user_id' => null,
    ])->assertSessionHasNoErrors();

    expect($faculty->refresh()->user_id)->toBeNull()
        ->and(Faculty::count())->toBe(1)
        ->and(Faculty::first()->room_or_location)->toBe('CED 101');
});

test('the admin cannot hand one account a second schedule', function () {
    $admin = facultyTestAdmin();
    [$user] = facultyUserWithProfile();
    $spare = unlinkedUpload('Someone Else');

    $this->actingAs($admin)->put('/admin/faculty/link', [
        'faculty_id' => $spare->id,
        'user_id' => $user->id,
    ])->assertSessionHasErrors('user_id');

    expect($spare->refresh()->user_id)->toBeNull();
});

test('the admin cannot link a schedule to a non-faculty account', function () {
    $admin = facultyTestAdmin();
    $student = User::factory()->create(['user_type' => 'student', 'email_verified_at' => now()]);
    $upload = unlinkedUpload('Maria Santos');

    $this->actingAs($admin)->put('/admin/faculty/link', [
        'faculty_id' => $upload->id,
        'user_id' => $student->id,
    ])->assertSessionHasErrors('user_id');

    expect($upload->refresh()->user_id)->toBeNull();
});

test('the unlinked account picker only offers faculty accounts without a schedule', function () {
    $admin = facultyTestAdmin();
    [$linked] = facultyUserWithProfile();
    $available = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $response = $this->actingAs($admin)->get('/admin/faculty/accounts')->assertOk();

    $ids = collect($response->json('accounts'))->pluck('id');

    expect($ids)->toContain($available->id)
        ->and($ids)->not->toContain($linked->id);
});

// === Both sides write the same row ===

test('an admin edit shows up on the faculty schedule page', function () {
    $admin = facultyTestAdmin();
    [$user, $faculty] = facultyUserWithProfile();

    $this->actingAs($admin)->put("/admin/faculty/{$faculty->id}", schedulePayload([
        'name' => $faculty->name,
        'role' => 'Associate Professor I',
    ]))->assertSessionHasNoErrors();

    $this->actingAs($user)->get('/faculty/schedule')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('faculty.id', $faculty->id)
            ->where('faculty.role', 'Associate Professor I')
            ->where('faculty.edited_by_role', 'admin')
            ->where('faculty.weekly_schedule.0.day', 'Tuesday')
        );
});

test('a faculty edit shows up in the admin listing', function () {
    $admin = facultyTestAdmin();
    [$user, $faculty] = facultyUserWithProfile();

    $this->actingAs($user)->put('/faculty/schedule', schedulePayload([
        'role' => 'Instructor I',
    ]))->assertSessionHasNoErrors();

    $this->actingAs($admin)->get('/admin/faculty')
        ->assertOk()
        ->assertInertia(fn ($page) => $page
            ->where('faculty.data.0.id', $faculty->id)
            ->where('faculty.data.0.weekly_schedule.0.day', 'Tuesday')
            ->where('faculty.data.0.edited_by_role', 'faculty')
        );
});

test('the faculty schedule page is null when no upload is waiting for it', function () {
    $user = facultyUser(['first_name' => 'Ronn', 'last_name' => 'Roque']);

    $this->actingAs($user)->get('/faculty/schedule')
        ->assertOk()
        ->assertInertia(fn ($page) => $page->where('faculty', null));

    // Opening the page twice must not litter the table with empty rows.
    expect(Faculty::count())->toBe(0);
});

// === Guards ===

test('the database refuses to point two schedules at one account', function () {
    $userIdIndex = collect(Schema::getIndexes('faculty'))->firstWhere('columns', ['user_id']);

    expect($userIdIndex)->not->toBeNull()
        ->and($userIdIndex['unique'])->toBeTrue();

    [$user] = facultyUserWithProfile();

    expect(fn () => Faculty::create([
        'user_id' => $user->id,
        'name' => 'A Second Copy',
        'role' => 'Instructor I',
        'department_or_program' => 'DTLLSED',
        'room_or_location' => 'CED 101',
        'weekly_schedule' => [],
    ]))->toThrow(UniqueConstraintViolationException::class);
});

test('name matching ignores titles, case and punctuation but not a different surname', function () {
    expect(FacultyProfileLinker::tokensFor('Dr. MARIA L. SANTOS, Jr.'))->toBe(['maria', 'l', 'santos'])
        ->and(FacultyProfileLinker::nameMatches('Prof. Maria Lopez Santos', ['maria', 'santos']))->toBeTrue()
        ->and(FacultyProfileLinker::nameMatches('Maria Cruz', ['maria', 'santos']))->toBeFalse()
        ->and(FacultyProfileLinker::nameMatches('Maria Santos', []))->toBeFalse();
});

test('an upload adopts the account even when the registrar typed a middle name', function () {
    // The registrar writes the full name off the official list; the account only
    // has first and last name columns, so the upload carries an extra token.
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);
    $upload = unlinkedUpload('Prof. Maria Lopez Santos');

    $linker = app(FacultyProfileLinker::class);

    expect($linker->adoptMatchingAccount($upload))->not->toBeNull()
        ->and($upload->refresh()->user_id)->toBe($user->id);
});

test('the backfill command links an upload whose name carries extra tokens', function () {
    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);
    $upload = unlinkedUpload('Maria Lopez Santos Jr.');

    $this->artisan('faculty:link-schedules')->assertSuccessful();

    expect($upload->refresh()->user_id)->toBe($user->id);
});

test('re-uploading a schedule already linked to an account updates that row', function () {
    [$user, $faculty] = facultyUserWithProfile([
        'first_name' => 'Maria',
        'last_name' => 'Santos',
    ]);

    $this->actingAs(facultyTestAdmin())
        ->post('/admin/faculty', schedulePayload(['name' => 'Maria Santos']))
        ->assertRedirect();

    // The account keeps exactly one row, and the re-upload landed on it instead
    // of leaving a second card behind for the admin to reconcile.
    expect(Faculty::count())->toBe(1)
        ->and(Faculty::sole()->id)->toBe($faculty->id)
        ->and(Faculty::sole()->user_id)->toBe($user->id)
        ->and(Faculty::sole()->room_or_location)->toBe('CED 202');
});

test('the link guard migration replays without error', function () {
    // The guard has already run as part of RefreshDatabase, so up() is replayed
    // against a schema it already owns. This is the same replay a rollback and
    // re-run performs on MariaDB, where the unique index and the foreign key are
    // bound together and cannot be dropped independently.
    rewindLinkGuard();

    $migration = require database_path('migrations/2026_10_03_090000_add_link_guard_to_faculty_table.php');
    $migration->up();

    expect(Schema::hasColumn('faculty', 'last_edited_by'))->toBeTrue()
        ->and(Schema::hasColumn('faculty', 'edited_by_role'))->toBeTrue();

    // A unique index still allows any number of NULLs, so the guard is only
    // exercised by pointing two rows at one real account.
    [$user, $faculty] = facultyUserWithProfile();

    expect(fn () => Faculty::create([
        'user_id' => $user->id,
        'name' => 'A Second Copy',
        'role' => 'Instructor I',
        'department_or_program' => 'DTLLSED',
        'room_or_location' => 'CED 101',
        'weekly_schedule' => [],
    ]))->toThrow(UniqueConstraintViolationException::class)
        ->and(Faculty::count())->toBe(1);
});

test('replaying the link guard keeps the row that holds a schedule', function () {
    // Seeded by hand because nothing in the app can produce a duplicate: the
    // whole point of the unique index is that it cannot.
    rewindLinkGuard();

    $user = facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);

    $empty = unlinkedUpload('Maria Santos', ['weekly_schedule' => []]);
    $nullSchedule = unlinkedUpload('Maria Santos', ['weekly_schedule' => null]);
    $real = unlinkedUpload('Maria Santos');

    // Both rows claim the same account, which the unique index now forbids.
    foreach ([$empty, $nullSchedule, $real] as $faculty) {
        DB::table('faculty')->where('id', $faculty->id)->update(['user_id' => $user->id]);
    }

    (require database_path('migrations/2026_10_03_090000_add_link_guard_to_faculty_table.php'))->up();

    // The row that actually carries the schedule is the one that keeps the link;
    // the empty ones are released back to unlinked admin schedules. Nothing is
    // deleted, and the account is left with exactly one row.
    expect($real->refresh()->user_id)->toBe($user->id)
        ->and($empty->refresh()->user_id)->toBeNull()
        ->and($nullSchedule->refresh()->user_id)->toBeNull()
        ->and(Faculty::count())->toBe(3)
        ->and(Faculty::where('user_id', $user->id)->count())->toBe(1);
});

test('replaying the link guard keeps the earliest row when both carry a schedule', function () {
    rewindLinkGuard();

    $user = facultyUser(['first_name' => 'Pedro', 'last_name' => 'Lim']);

    $first = unlinkedUpload('Pedro Lim');
    $second = unlinkedUpload('Pedro Lim');

    foreach ([$first, $second] as $faculty) {
        DB::table('faculty')->where('id', $faculty->id)->update(['user_id' => $user->id]);
    }

    (require database_path('migrations/2026_10_03_090000_add_link_guard_to_faculty_table.php'))->up();

    expect($first->refresh()->user_id)->toBe($user->id)
        ->and($second->refresh()->user_id)->toBeNull()
        ->and(Faculty::where('user_id', $user->id)->count())->toBe(1);
});

test('re-uploading prefers the unlinked row over the linked one', function () {
    facultyUserWithProfile(['first_name' => 'Maria', 'last_name' => 'Santos']);
    $upload = unlinkedUpload('Maria Santos');

    $this->actingAs(facultyTestAdmin())
        ->post('/admin/faculty', schedulePayload(['name' => 'Maria Santos']))
        ->assertRedirect();

    // The account already has a row, so it keeps it; the loose upload is the one
    // that gets updated, and it stays unlinked for a human to resolve.
    expect(Faculty::count())->toBe(2)
        ->and($upload->refresh()->room_or_location)->toBe('CED 202')
        ->and($upload->user_id)->toBeNull();
});

// === Backfill command ===

test('the backfill command reports without writing in dry run', function () {
    facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);
    $upload = unlinkedUpload('Maria Santos');

    $this->artisan('faculty:link-schedules', ['--dry-run' => true])->assertSuccessful();

    expect($upload->refresh()->user_id)->toBeNull();
});

test('the backfill command links unlinked uploads and skips ambiguous names', function () {
    facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);
    facultyUser(['first_name' => 'Pedro', 'last_name' => 'Lim']);
    // A second account of the same name is what makes the pair ambiguous.
    facultyUser(['first_name' => 'Pedro', 'last_name' => 'Lim']);

    $clear = unlinkedUpload('Maria Santos');
    $ambiguousA = unlinkedUpload('Pedro Lim');
    $ambiguousB = unlinkedUpload('Pedro Lim', ['room_or_location' => 'CED 909']);

    $this->artisan('faculty:link-schedules')->assertSuccessful();

    expect($clear->refresh()->user_id)->not->toBeNull()
        ->and($ambiguousA->refresh()->user_id)->toBeNull()
        ->and($ambiguousB->refresh()->user_id)->toBeNull()
        ->and(Faculty::whereNotNull('user_id')->count())->toBe(1);
});

test('the backfill command is safe to run twice', function () {
    facultyUser(['first_name' => 'Maria', 'last_name' => 'Santos']);
    $upload = unlinkedUpload('Maria Santos');

    $this->artisan('faculty:link-schedules')->assertSuccessful();
    $this->artisan('faculty:link-schedules')->assertSuccessful();

    expect($upload->refresh()->user_id)->not->toBeNull()
        ->and(DB::table('faculty')->whereNotNull('user_id')->count())->toBe(1);
});

test('the backfill command says so when there is nothing to do', function () {
    facultyUserWithProfile();

    $this->artisan('faculty:link-schedules')
        ->expectsOutputToContain('Every faculty schedule is already linked.')
        ->assertSuccessful();
});
