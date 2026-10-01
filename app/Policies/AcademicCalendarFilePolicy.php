<?php

namespace App\Policies;

use App\Models\AcademicCalendarFile;
use App\Models\User;

class AcademicCalendarFilePolicy
{
    /** Everyone can see/download the current Academic Calendar. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, AcademicCalendarFile $calendarFile): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, AcademicCalendarFile $calendarFile): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, AcademicCalendarFile $calendarFile): bool
    {
        return $user->isAdmin();
    }
}