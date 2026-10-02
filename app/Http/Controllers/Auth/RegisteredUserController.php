<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Mail\OtpMail;
use App\Models\AlumniVerification;
use App\Models\Course;
use App\Models\User;
use App\Notifications\AlumniVerificationSubmitted;
use App\Rules\ValidatesUserAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    // Same rules the admin User Management screen applies when adding an account.
    use ValidatesUserAccount;

    private const OTP_TTL_MINUTES = 10;

    public function create(): Response
    {
        return Inertia::render('Auth/Register', [
            'courses' => Course::with('majors')->orderBy('sort_order')->get(),
        ]);
    }

    public function store(Request $request): \Symfony\Component\HttpFoundation\Response
    {
        $this->normalizeEmail($request);

        $validated = $request->validate($this->accountRules($request), $this->accountMessages());

        $isStudent = $validated['user_type'] === 'student';
        $isAlumni = $validated['user_type'] === 'alumni';
        $otp = random_int(100000, 999999);

        // Everything is saved together, or nothing is (no half-created accounts).
        [$user, $verification] = DB::transaction(function () use ($validated, $request, $isStudent, $isAlumni, $otp) {
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

            $verification = null;
            if ($isAlumni) {
                $verification = AlumniVerification::create([
                    'user_id' => $user->id,
                    'path' => $request->file('proof')->store('alumni-proofs', 'private'),
                    'status' => 'pending',
                ]);
            } elseif ($validated['user_type'] === 'faculty') {
                $user->facultyProfile()->create([
                    'name' => $validated['first_name'].' '.$validated['last_name'],
                    'role' => 'Not specified',
                    'department_or_program' => 'Not specified',
                    'room_or_location' => 'Not specified',
                    'weekly_schedule' => [],
                ]);
            }

            return [$user, $verification];
        });

        Mail::to($user->email)->send(new OtpMail($otp));

        // Alert admins about the new alumni proof. Registration still succeeds if this fails.
        if ($verification) {
            try {
                Notification::send(
                    User::role('admin')->get(),
                    new AlumniVerificationSubmitted($verification->load('user'))
                );
            } catch (\Throwable $e) {
                report($e);
            }
        }

        // No Registered event: its only listener builds a signed `verification.verify`
        // URL, and verification here is OTP-based (OtpVerificationController).
        Auth::login($user);

        return Inertia::location(route('verification.notice'));
    }
}
