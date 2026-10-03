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

    /**
     * A schedule row is shared, so editing it is allowed for the registrar and
     * for the faculty account it is linked to. Anyone else has no business
     * writing to it.
     */
    public function update(User $user, Faculty $faculty): bool
    {
        return $user->isAdmin() || $faculty->user_id === $user->id;
    }

    public function delete(User $user, Faculty $faculty): bool
    {
        return $user->isAdmin();
    }
}
