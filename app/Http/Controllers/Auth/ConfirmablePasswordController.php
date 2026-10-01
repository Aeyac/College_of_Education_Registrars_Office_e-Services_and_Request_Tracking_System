<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ConfirmablePasswordController extends Controller
{
    /**
     * Show the confirm password view.
     */
    public function show(): Response
    {
        return Inertia::render('Auth/ConfirmPassword');
    }

    /**
     * Confirm the user's password.
     */
    public function store(Request $request): RedirectResponse
    {
        if (! Auth::guard('web')->validate([
            'email' => $request->user()->email,
            'password' => $request->password,
        ])) {
            throw ValidationException::withMessages([
                'password' => __('auth.password'),
            ]);
        }

        $request->session()->put('auth.password_confirmed_at', time());

        return redirect()->intended($this->dashboardFor($request->user()));
    }

    /**
     * There is no single dashboard route: each role has its own, so naming one
     * here used to throw a RouteNotFoundException whenever a user confirmed
     * their password without an intended url in the session.
     */
    private function dashboardFor(User $user): string
    {
        return match ($user->user_type) {
            'admin' => route('admin.dashboard'),
            'faculty' => route('faculty.dashboard'),
            default => route('user.dashboard'),
        };
    }
}
