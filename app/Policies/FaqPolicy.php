<?php

namespace App\Policies;

use App\Models\Faq;
use App\Models\User;

class FaqPolicy
{
    /** Everyone can browse/search the FAQ page. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Faq $faq): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Faq $faq): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Faq $faq): bool
    {
        return $user->isAdmin();
    }
}