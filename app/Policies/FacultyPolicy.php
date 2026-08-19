<?php

namespace App\Policies;

use App\Models\Faculty;
use App\Models\User;

class FacultyPolicy
{
    /** Everyone (students, alumni, admins) can view/search the faculty consultation-hours list. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Faculty $faculty): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Faculty $faculty): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Faculty $faculty): bool
    {
        return $user->isAdmin();
    }
}