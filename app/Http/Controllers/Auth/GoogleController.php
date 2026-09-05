<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class GoogleController extends Controller
{
    public function redirect()
    {
        return Socialite::driver('google')->stateless()->redirect();
    }

    public function callback()
    {
        $googleUser = Socialite::driver('google')->stateless()->user();

        // Check if the user already exists
        $user = User::where('email', $googleUser->email)->first();

        if ($user) {
            // Update existing user, bypassing $fillable restrictions
            $user->forceFill([
                'google_id' => $googleUser->id,
                'first_name' => $googleUser->user['given_name'],
                'last_name' => $googleUser->user['family_name'],
                'email_verified_at' => $user->email_verified_at ?? now(),
            ])->save();
        } else {
            // Create new user with a random secure password to satisfy the database
            $user = new User();
            $user->forceFill([
                'email' => $googleUser->email,
                'first_name' => $googleUser->user['given_name'],
                'last_name' => $googleUser->user['family_name'],
                'google_id' => $googleUser->id,
                'password' => Hash::make(Str::random(24)), // Solves the "no default value" error
                'email_verified_at' => now(),
            ])->save();
        }

        Auth::login($user);

        // Redirect to profile completion if they haven't set an academic role
        if (is_null($user->user_type)) {
            return redirect()->route('profile.complete');
        }

        return redirect()->route('user.dashboard');
    }
}