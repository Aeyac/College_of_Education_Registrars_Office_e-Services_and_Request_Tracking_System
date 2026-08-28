<?php

namespace App\Http\Controllers\User;
use App\Models\CertificateRequest;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Response;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestController extends Controller
{
    public function requests(): Response
    {
        return Inertia::render('User/Requests', [
            'userRole' => $this->userDisplaySubtitle(),
            'isAlumniVerified' => $this->isAlumniVerified(),
            'requests' => $this->mapRequests($this->userRequests()->latest()->get()),
        ]);
    }

   


    private function userRequests()
    {
        return CertificateRequest::with(['service', 'status'])
            ->where('user_id', auth()->id());
    }


    private function userDisplaySubtitle(): string
    {
        $user = auth()->user()->load('course');

        if ($user->user_type === 'alumni') {
            return 'Alumni   Batch ' . ($user->batch_year ?? 'N/A');
        }

        $courseName = $user->course?->label ?? 'College of Education';
        $yearLevel = $user->year_level;

        $suffix = match ($yearLevel) {
            1 => 'st',
            2 => 'nd',
            3 => 'rd',
            default => 'th',
        };

        return $courseName . '   ' . ($yearLevel ? $yearLevel . $suffix . ' Year' : 'N/A');
    }

    private function isAlumniVerified(): bool
    {
        $user = auth()->user();
        if ($user->user_type !== 'alumni') {
            return false;
        }

        return AlumniVerification::where('user_id', $user->id)
            ->where('status', 'verified')
            ->exists();
    }

    private function mapRequests(Collection $requests): Collection
    {
        return $requests->map(fn(CertificateRequest $req) => [
            'id' => $req->id,
            'document_type' => $req->service?->label ?? 'Document',
            'format' => $req->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
            'status' => $req->status?->label ?? 'Pending',
            'created_at' => $req->created_at->format('M d, Y'),
        ]);
    }
}
