<?php

namespace App\Policies;

use App\Models\Feedback;
use App\Models\User;

class FeedbackPolicy
{
    /** Only admins browse the feedback list on the dashboard. */
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return !$user->isAdmin();
    }

    // Deliberately no update()/delete() — feedback is one-way and immutable
    // once submitted, per the client's requirement (no reply workflow).
}