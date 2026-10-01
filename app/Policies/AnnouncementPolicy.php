<?php

namespace App\Policies;

use App\Models\Announcement;
use App\Models\User;

/**
 * Covers Announcement management. Faculty, Faq, and AcademicCalendarFile
 * follow the identical flat-admin-manages / everyone-reads shape — copy
 * this policy's structure for those rather than repeating it three more
 * times here.
 */
class AnnouncementPolicy
{
    /** Everyone (students, alumni, admins) can view the announcement list. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, Announcement $announcement): bool
    {
        return true;
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Announcement $announcement): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, Announcement $announcement): bool
    {
        return $user->isAdmin();
    }
}