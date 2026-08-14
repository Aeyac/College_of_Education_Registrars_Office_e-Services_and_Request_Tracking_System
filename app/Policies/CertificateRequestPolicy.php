<?php

namespace App\Policies;

use App\Models\CertificateRequest;
use App\Models\User;

class CertificateRequestPolicy
{
    /** Admins see everything; students/alumni only reach their own list via the query scope in the controller, not here. */
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, CertificateRequest $certRequest): bool
    {
        return $user->isAdmin() || $user->id === $certRequest->user_id;
    }

    public function create(User $user): bool
    {
        // Only students/alumni submit requests, not admins.
        return !$user->isAdmin();
    }

    /**
     * Covers general field edits (e.g. delivery_mode, preferred_claiming_date)
     * made by an admin. Status transitions specifically go through
     * `transitionStatus()` below, not this method.
     */
    public function update(User $user, CertificateRequest $certRequest): bool
    {
        return $user->isAdmin();
    }

    public function delete(User $user, CertificateRequest $certRequest): bool
    {
        // Soft-delete only, and admin-only — registrar records must persist.
        return $user->isAdmin();
    }

    /** Moving a request through the status pipeline — flat admin, any admin can do this. */
    public function transitionStatus(User $user, CertificateRequest $certRequest): bool
    {
        return $user->isAdmin();
    }

    /** Uploading a requirement document onto this request. */
    public function uploadRequirement(User $user, CertificateRequest $certRequest): bool
    {
        return $user->id === $certRequest->user_id;
    }

    /** Uploading/verifying a verification or output document onto this request. */
    public function manageDocuments(User $user, CertificateRequest $certRequest): bool
    {
        return $user->isAdmin();
    }
}