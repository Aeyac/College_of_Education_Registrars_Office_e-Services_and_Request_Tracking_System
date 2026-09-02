<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\RequestStatus;
use App\Models\User;
use App\Notifications\RequestStatusChanged;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RequestController extends Controller
{

    private const NOT_ALLOWED_TO_UPDATE = ['cancelled_returned', 'released', 'ready_for_release'];

    public function loadRequest(Request $request)
    {
        $showArchived = $request->boolean('archived');

        $requests = CertificateRequest::with([
            'user',
            'status',
            'service',
            'statusHistory.changedBy',
            'statusHistory.toStatus'
        ])
            ->when($showArchived, fn($q) => $q->archived(), fn($q) => $q->notArchived())
            ->latest()
            ->get()
            ->map(fn($r) => [
                'id' => $r->id,
                'student_name' => $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown',
                'document_type' => $r->service ? $r->service->label : 'Document',
                'delivery_mode' => $r->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
                'status' => $r->status ? $r->status->label : 'Pending',
                'status_code' => $r->status ? $r->status->code : 'submitted',
                'created_at' => $r->created_at->timezone('Asia/Manila')->format('M d, Y h:i A'),
                'is_archived' => $r->isArchived(),
                'archived_at' => $r->archived_at?->timezone('Asia/Manila')->format('M d, Y h:i A'),
                'status_history' => $r->statusHistory->map(fn($h) => [
                    'status' => $h->toStatus?->label,
                    'changed_by' => $h->changedBy ? $h->changedBy->first_name . ' ' . $h->changedBy->last_name : 'System',
                    'note' => $h->note,
                    'date' => $h->created_at->timezone('Asia/Manila')->format('M d, Y h:i A')
                ])
            ]);

        return Inertia::render('Admin/Requests', [
            'requests' => $requests,
            'showingArchived' => $showArchived,
        ]);
    }

    public function updateRequest(Request $request, $id)
    {
        $certRequest = CertificateRequest::findOrFail($id);

        $currentStatus = RequestStatus::findOrFail($certRequest->status_id);
        abort_if(in_array($currentStatus->code, self::NOT_ALLOWED_TO_UPDATE), 403);
        abort_if($certRequest->isArchived(), 403, 'Cannot update an archived request.');

        $statusCode = $request->input('status_code');

        $newStatus = RequestStatus::firstOrCreate(
            ['code' => $statusCode],
            ['label' => ucwords(str_replace('_', ' ', $statusCode))]
        );

        $certRequest->transitionTo($newStatus, auth()->user(), $request->input('note'));
        $certRequest->load(['service', 'status']);

        if ($certRequest->user) {
            $certRequest->user->notify(new RequestStatusChanged($certRequest));
        }

        return back()->with('success', 'Status updated.');
    }

    public function archiveRequest($id)
    {
        $certRequest = CertificateRequest::findOrFail($id);

        $currentStatus = RequestStatus::findOrFail($certRequest->status_id);
        abort_unless(in_array($currentStatus->code, self::NOT_ALLOWED_TO_UPDATE), 422, 'Only resolved requests (released, ready for release, or cancelled/returned) can be archived.');

        $certRequest->update(['archived_at' => now()]);

        return back()->with('success', 'Request archived.');
    }

    public function unarchiveRequest($id)
    {
        $certRequest = CertificateRequest::findOrFail($id);

        $certRequest->update(['archived_at' => null]);

        return back()->with('success', 'Request restored.');
    }
}