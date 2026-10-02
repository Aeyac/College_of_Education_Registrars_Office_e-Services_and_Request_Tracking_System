<?php

namespace App\Rules;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;

/**
 * One source of truth for the rules that govern creating a user account.
 *
 * Shared by public registration (App\Http\Controllers\Auth\RegisteredUserController)
 * and admin-created accounts (App\Http\Controllers\Admin\UserController) so both
 * paths enforce the same formats, ranges and role-specific requirements.
 */
trait ValidatesUserAccount
{
    // irreg students max
    protected const MAX_YEAR_LEVEL = 6;

    // Month when a new academic year starts, and everyone's year level goes up by one.
    protected const ACADEMIC_YEAR_START_MONTH = 6; // June

    protected const MIN_BATCH_YEAR = 1900;

    /**
     * Emails are matched case-insensitively, so normalise before validating.
     */
    protected function normalizeEmail(Request $request): void
    {
        $request->merge(['email' => Str::lower(trim((string) $request->input('email')))]);
    }

    /**
     * The validation rules that govern creating or updating a user account.
     *
     * @param  array<int, string>  $extraTypes  additional account types to accept, e.g. ['admin']
     * @param  bool  $requireProof  false when no proof upload is part of the form
     * @param  int|null  $ignoreUserId  the account being updated, so it does not clash with its own unique values
     * @param  bool  $requirePassword  false when the password is optional, e.g. an edit form
     * @return array<string, mixed>
     */
    protected function accountRules(
        Request $request,
        array $extraTypes = [],
        bool $requireProof = true,
        ?int $ignoreUserId = null,
        bool $requirePassword = true
    ): array {
        $userType = $request->input('user_type');
        $isStudent = $userType === 'student';
        $isAlumni = $userType === 'alumni';
        $isStaff = $userType === 'faculty' || in_array($userType, $extraTypes, true);
        $currentYear = now()->year;

        $uniqueEmail = Rule::unique(User::class, 'email');
        $uniqueStudentNumber = Rule::unique(User::class, 'student_number');

        if ($ignoreUserId !== null) {
            $uniqueEmail->ignore($ignoreUserId);
            $uniqueStudentNumber->ignore($ignoreUserId);
        }

        $emailRules = ['required', 'string', 'lowercase', 'email', 'max:255', $uniqueEmail];
        if ($isStudent) {
            $emailRules[] = 'regex:/@clsu2?\.edu\.ph$/';
        }

        $rules = [
            'first_name' => ['required', 'string', 'max:255'],
            'last_name' => ['required', 'string', 'max:255'],
            'email' => $emailRules,
            'user_type' => ['required', Rule::in(['student', 'alumni', 'faculty', ...$extraTypes])],
            'student_number' => [
                Rule::requiredIf($isStudent),
                'nullable',
                'string',
                'regex:/^\d{2}-\d{4}$/',
                $uniqueStudentNumber,
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
            'course_id' => [$isStaff ? 'nullable' : 'required', 'exists:courses,id'],
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
                'min:'.self::MIN_BATCH_YEAR,
                'max:'.$currentYear,
            ],
            'contact_number' => ['required', 'string', 'regex:/^\+[1-9]\d{7,14}$/'],
            'password' => [
                $requirePassword ? 'required' : 'nullable',
                'confirmed',
                Password::defaults(),
            ],
        ];

        if ($requireProof) {
            $rules['proof'] = [
                Rule::requiredIf($isAlumni),
                'nullable',
                'file',
                'mimes:jpg,jpeg,png,pdf',
                'max:10240', // 10MB
            ];
        }

        return $rules;
    }

    /**
     * @return array<string, string>
     */
    protected function accountMessages(): array
    {
        $currentYear = now()->year;

        return [
            'batch_year.max' => "The batch year cannot be in the future (latest: {$currentYear}).",
            'batch_year.min' => 'The batch year cannot be earlier than '.self::MIN_BATCH_YEAR.'.',
            'batch_year.digits' => 'The batch year must be a 4-digit year.',
        ];
    }

    protected function academicYear(): int
    {
        $now = now();

        return $now->month >= self::ACADEMIC_YEAR_START_MONTH ? $now->year : $now->year - 1;
    }

    protected function yearLevelFromStudentNumber(string $studentNumber): ?int
    {
        $enrollmentYear = 2000 + (int) substr($studentNumber, 0, 2);
        $yearLevel = $this->academicYear() - $enrollmentYear + 1;

        return $yearLevel >= 1 && $yearLevel <= self::MAX_YEAR_LEVEL ? $yearLevel : null;
    }
}
