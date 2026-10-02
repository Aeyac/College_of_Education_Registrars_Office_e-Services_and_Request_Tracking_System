<?php

use App\Mail\OtpMail;
use App\Models\User;
use Illuminate\Support\Facades\Mail;

test('email verification screen can be rendered', function () {
    $user = User::factory()->unverified()->create();

    $response = $this->actingAs($user)->get('/verify-email');

    $response->assertStatus(200);
});

test('email can be verified with a valid code', function () {
    $user = User::factory()->unverified()->create([
        'otp' => 123456,
        'otp_expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->actingAs($user)->post('/verify-email', ['otp' => '123456']);

    $response->assertRedirect(route('user.dashboard', absolute: false));
    expect($user->fresh()->hasVerifiedEmail())->toBeTrue();
    expect($user->fresh()->otp)->toBeNull();
    expect($user->fresh()->otp_expires_at)->toBeNull();
});

test('email is not verified with an invalid code', function () {
    $user = User::factory()->unverified()->create([
        'otp' => 123456,
        'otp_expires_at' => now()->addMinutes(10),
    ]);

    $response = $this->actingAs($user)->post('/verify-email', ['otp' => '654321']);

    $response->assertSessionHasErrors('otp');
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('email is not verified with an expired code', function () {
    $user = User::factory()->unverified()->create([
        'otp' => 123456,
        'otp_expires_at' => now()->subMinute(),
    ]);

    $response = $this->actingAs($user)->post('/verify-email', ['otp' => '123456']);

    $response->assertSessionHasErrors('otp');
    expect($user->fresh()->hasVerifiedEmail())->toBeFalse();
});

test('a new code is emailed while verification is still pending', function () {
    Mail::fake();

    $user = User::factory()->unverified()->create([
        'otp' => null,
        'otp_expires_at' => null,
    ]);

    $response = $this->actingAs($user)->post('/email/verification-notification');

    $response->assertRedirect();
    Mail::assertSent(OtpMail::class);
    expect($user->fresh()->otp)->not->toBeNull();
    expect($user->fresh()->otp_expires_at)->not->toBeNull();
});

test('no new code is emailed once the address is verified', function () {
    Mail::fake();

    $user = User::factory()->create();

    $response = $this->actingAs($user)->post('/email/verification-notification');

    $response->assertRedirect(route('user.dashboard', absolute: false));
    Mail::assertNothingSent();
});
