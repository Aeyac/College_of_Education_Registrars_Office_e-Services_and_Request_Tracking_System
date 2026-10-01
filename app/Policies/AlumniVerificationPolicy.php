<?php

namespace App\Policies;

use App\Models\AlumniVerification;
use App\Models\User;

class AlumniVerificationPolicy
{
    public function view(User $user, AlumniVerification $verification): bool
    {
        return $user->isAdmin() || $user->id === $verification->user_id;
    }

    public function create(User $user): bool
    {
        return $user->user_type === 'alumni';
    }

    /** Marking a verification as verified/rejected. */
    public function review(User $user, AlumniVerification $verification): bool
    {
        return $user->isAdmin();
    }
}