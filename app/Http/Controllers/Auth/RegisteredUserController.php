<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
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
        return Inertia::render('Auth/Register', [
            'courses' => Cache::remember('registration.courses', now()->addHours(6), function () {
                return Course::with(['majors' => fn($q) => $q->select('id', 'course_id', 'code', 'label')])
                    ->where('is_active', true)->orderBy('sort_order')->get(['id', 'code', 'label']);
            }),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        // Build the email rules dynamically to avoid nullable conflicts
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
            'profile_picture' => ['nullable', 'image', 'mimes:jpeg,png,jpg', 'max:2048'],
        ]);

        $profilePath = null;
        if ($request->hasFile('profile_picture')) {
            $profilePath = $request->file('profile_picture')->store('profiles', 'public');
        }

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
            'password' => \Illuminate\Support\Facades\Hash::make($validated['password']),
            'profile_picture' => $profilePath,
        ]);

        $user->assignRole($validated['user_type']);

        event(new \Illuminate\Auth\Events\Registered($user));

        \Illuminate\Support\Facades\Auth::login($user);

        return redirect(route('user.dashboard', absolute: false));
    }
}