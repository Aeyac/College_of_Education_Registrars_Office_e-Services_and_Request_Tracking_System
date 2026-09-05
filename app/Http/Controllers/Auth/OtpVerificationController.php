<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Mail\OtpMail;
use Illuminate\Support\Facades\Mail;

class OtpVerificationController extends Controller
{
    public function notice(Request $request)
    {
        return $request->user()->hasVerifiedEmail()
                    ? redirect()->intended(route('user.dashboard', absolute: false))
                    : Inertia::render('Auth/VerifyOtp', ['status' => session('status')]);
    }

    public function verify(Request $request)
    {
        $request->validate(['otp' => 'required|numeric|digits:6']);

        $user = $request->user();
        
        // Track failed attempts in session
        $attempts = session('otp_attempts', 0);

        if ($attempts >= 3) {
            return back()->withErrors(['otp' => 'You have reached the maximum of 3 attempts. Please request a new security code.']);
        }

        if ($user->otp == $request->otp && now()->lessThanOrEqualTo($user->otp_expires_at)) {
            // Reset attempts on success
            session()->forget('otp_attempts');
            
            $user->markEmailAsVerified();
            $user->update(['otp' => null, 'otp_expires_at' => null]);

            return redirect()->intended(route('user.dashboard', absolute: false));
        }

        // Increment attempt count on failure
        $attempts++;
        session(['otp_attempts' => $attempts]);
        $remaining = 3 - $attempts;

        if ($remaining <= 0) {
            return back()->withErrors(['otp' => 'Invalid code. You have exhausted your 3 attempts. Please request a new code.']);
        }

        return back()->withErrors(['otp' => "Invalid security code. You have {$remaining} attempt(s) remaining."]);
    }

    public function resend(Request $request)
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return redirect()->intended(route('user.dashboard', absolute: false));
        }

        // Reset attempt counter when resending
        session()->forget('otp_attempts');

        $otp = rand(100000, 999999);
        $user->update([
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10)
        ]);

        Mail::to($user->email)->send(new OtpMail($otp));

        return back()->with('status', 'A new 6-digit security code has been sent to your email address.');
    }
}