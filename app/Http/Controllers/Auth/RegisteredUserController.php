<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\Course;
use App\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\Rule;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        
        $courses = Course::with('majors')->orderBy('sort_order')->get(); 

        return Inertia::render('Auth/Register', [
            'courses' => $courses
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $emailRules = ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class];
        if ($request->input('user_type') === 'student') {
            $emailRules[] = 'regex:/@clsu2?\.edu\.ph$/';
        }

        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => $emailRules,
            'user_type' => ['required', Rule::in(['student', 'alumni'])],
            'student_number' => ['nullable', 'string', 'max:50'],
            'course_id' => ['required', 'exists:courses,id'],
            'major_id' => ['nullable', 'exists:majors,id'],
            'year_level' => [Rule::requiredIf(fn() => $request->input('user_type') === 'student'), 'nullable', 'integer', 'between:1,6'],
            'batch_year' => [Rule::requiredIf(fn() => $request->input('user_type') === 'alumni'), 'nullable', 'integer', 'min:1900'],
            'contact_number' => ['required', 'string', 'max:50'],
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
            'proof' => [
                Rule::requiredIf(fn() => $request->input('user_type') === 'alumni'),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:10240', // 10MB
            ],
        ]);

        $user = User::create([
            'first_name' => $validated['first_name'],
            'last_name' => $validated['last_name'],
            'email' => $validated['email'],
            'user_type' => $validated['user_type'],
            'student_number' => $validated['student_number'] ?? null,
            'course_id' => $validated['course_id'] ?? null,
            'major_id' => $validated['major_id'] ?? null,
            'year_level' => $validated['year_level'] ?? null,
            'batch_year' => $validated['batch_year'] ?? null,
            'contact_number' => $validated['contact_number'],
            'password' => Hash::make($validated['password']),
        ]);
        
        $otp = rand(100000, 999999);
        
        $user->update([
            'otp' => $otp,
            'otp_expires_at' => now()->addMinutes(10)
        ]);
        
        
        \Illuminate\Support\Facades\Mail::to($user->email)->send(new \App\Mail\OtpMail($otp));
        

        $user->assignRole($validated['user_type']);

        if ($validated['user_type'] === 'alumni') {
            $proofPath = $request->file('proof')->store('alumni-proofs', 'private');

            AlumniVerification::create([
                'user_id' => $user->id,
                'path' => $proofPath,
                'status' => 'pending',
            ]);
        }

        event(new Registered($user));

        Auth::login($user);

        // Palitan ito mula user.dashboard patungong verification.notice
        return redirect()->route('verification.notice');
    }
}