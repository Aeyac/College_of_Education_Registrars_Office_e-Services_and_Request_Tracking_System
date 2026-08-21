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
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {

        return Inertia::render('Auth/Register', [
            'courses' => Cache::remember(
                'registration.courses',
                app()->environment('local') ? now()->addSeconds(1) : now()->addHours(6),
                function () {
                    return Course::with(['majors' => fn($q) => $q->select('id', 'course_id', 'code', 'label')])
                        ->where('is_active', true)
                        ->orderBy('sort_order')
                        ->get(['id', 'code', 'label']);
                }
            ),
        ]);
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',

            'email' => [
                Rule::requiredIf(fn() => $request->input('user_type') === 'student'),
                'string',
                'lowercase',
                'email',
                'max:255',
                // Apply the clsu2 regex only if the user is a student
                $request->input('user_type') === 'student' ? 'regex:/@clsu2\.edu\.ph$/' : 'nullable',
                'unique:' . User::class
            ],


            'user_type' => ['required', Rule::in(['student', 'alumni'])], // wil put back admin if we decided that admin registration is created/added by another admin
            'student_number' => ['nullable', 'string', 'regex:/^\d{2}-\d{4}$/'],
            'course_id' => [
                Rule::requiredIf(fn() => in_array($request->input('user_type'), ['student', 'alumni'])),
                'nullable',
                'exists:courses,id',
            ],
            'major_id' => [
                'nullable',
                'exists:majors,id',
                Rule::requiredIf(function () use ($request) {
                    $course = Course::find($request->input('course_id'));
                    return $course && $course->majors()->exists();
                }),
                function ($attribute, $value, $fail) use ($request) {
                    if ($value && !Course::find($request->input('course_id'))?->majors()->where('id', $value)->exists()) {
                        $fail('The selected major does not belong to the selected course.');
                    }
                },
            ],
            'year_level' => [
                Rule::requiredIf(fn() => $request->input('user_type') === 'student'),
                'nullable',
                'integer',
                'between:1,6',
            ],
            'batch_year' => [
                Rule::requiredIf(fn() => $request->input('user_type') === 'alumni'),
                'nullable',
                'integer',
                'digits:4',
                'min:1900',
            ],
            'contact_number' => [
                'required',
                'string',
                'regex:/^(09|\+639)\d{9}$|^(02|\+632)?\d{8}$/'
            ],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
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

        event(new Registered($user));

        Auth::login($user);

        return redirect(route('dashboard', absolute: false));
    }
}
