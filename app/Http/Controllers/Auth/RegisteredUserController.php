<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\AlumniVerification;
use App\Models\Course;
use App\Models\User;
use Closure;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    // irreg students max
    private const MAX_YEAR_LEVEL = 6;

    // Month when a new academic year starts, and everyone's year level goes up by one.
    private const ACADEMIC_YEAR_START_MONTH = 6; // June

    private const MIN_BATCH_YEAR = 1900;

    private const OTP_TTL_MINUTES = 10;

    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'courses' => Course::with('majors')->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);

        $isStudent = $request->input('user_type') === 'student';
        $isAlumni = $request->input('user_type') === 'alumni';
        $currentYear = now()->year;

        $emailRules = ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:' . User::class];
        if ($isStudent) {
            $emailRules[] = 'regex:/@clsu2?\.edu\.ph$/';
        }

        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => $emailRules,
            'user_type' => ['required', Rule::in(['student', 'alumni'])],
            'student_number' => [
                Rule::requiredIf($isStudent),
                'nullable',
                'string',
                'regex:/^\d{2}-\d{4}$/',
                Rule::unique(User::class, 'student_number'),
                function (string $attribute, mixed $value, Closure $fail) {
                    if ($this->yearLevelFromStudentNumber($value) === null) {
                        $academicYear = $this->academicYear();

                        $fail(sprintf(
                            'The student number must start with %02d to %02d.',
                            ($academicYear - (self::MAX_YEAR_LEVEL - 1)) % 100,
                            $academicYear % 100
                        ));
                    }
                },
            ],
            'course_id' => ['required', 'exists:courses,id'],
            // The major must belong to the selected course.
            'major_id' => [
                'nullable',
                Rule::exists('majors', 'id')->where('course_id', $request->input('course_id')),
            ],
            'batch_year' => [
                Rule::requiredIf($isAlumni),
                'nullable',
                'integer',
                'digits:4',
                'min:' . self::MIN_BATCH_YEAR,
                'max:' . $currentYear,
            ],
            'contact_number' => ['required', 'string', 'regex:/^\+[1-9]\d{7,14}$/'],
            'password' => ['required', 'confirmed', Password::defaults()],
            'proof' => [
                Rule::requiredIf($isAlumni),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:10240', // 10MB
            ],
        ], [
            'batch_year.max' => "The batch year cannot be in the future (latest: {$currentYear}).",
            'batch_year.min' => 'The batch year cannot be earlier than ' . self::MIN_BATCH_YEAR . '.',
            'batch_year.digits' => 'The batch year must be a 4-digit year.',
        ]);

        $isStudent = $validated['user_type'] === 'student';
        $otp = random_int(100000, 999999);

        // Everything is saved together, or nothing is (no half-created accounts).
        $user = DB::transaction(function () use ($validated, $request, $isStudent, $otp) {
            $user = User::create([
                'first_name' => $validated['first_name'],
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'user_type' => $validated['user_type'],
                'student_number' => $isStudent ? $validated['student_number'] : null,
                'year_level' => $isStudent
                    ? $this->yearLevelFromStudentNumber($validated['student_number'])
                    : null,
                'batch_year' => $isStudent ? null : $validated['batch_year'],
                'course_id' => $validated['course_id'],
                'major_id' => $validated['major_id'] ?? null,
                'contact_number' => $validated['contact_number'],
                'password' => Hash::make($validated['password']),
                'otp' => $otp,
                'otp_expires_at' => now()->addMinutes(self::OTP_TTL_MINUTES),
            ]);

            $user->assignRole($validated['user_type']);

            if (!$isStudent) {
                AlumniVerification::create([
                    'user_id' => $user->id,
                    'path' => $request->file('proof')->store('alumni-proofs', 'private'),
                    'status' => 'pending',
                ]);
            }

            return $user;
        });

        Mail::to($user->email)->send(new OtpMail($otp));

        event(new Registered($user));

        Auth::login($user);

        return redirect()->route('verification.notice');
    }

    private function academicYear(): int
    {
        $now = now();

        return $now->month >= self::ACADEMIC_YEAR_START_MONTH ? $now->year : $now->year - 1;
    }

    private function yearLevelFromStudentNumber(string $studentNumber): ?int
    {
        $enrollmentYear = 2000 + (int) substr($studentNumber, 0, 2);
        $yearLevel = $this->academicYear() - $enrollmentYear + 1;

        return $yearLevel >= 1 && $yearLevel <= self::MAX_YEAR_LEVEL ? $yearLevel : null;
    }
}