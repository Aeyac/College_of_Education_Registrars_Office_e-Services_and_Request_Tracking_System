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
    public function loadRequest()
    {
        $requests = CertificateRequest::with([
            'user', 'status', 'service', 
            'statusHistory.changedBy', 'statusHistory.toStatus'
        ])->latest()->get()->map(fn($r) => [
            'id' => $r->id,
            'student_name' => $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown',
            'document_type' => $r->service ? $r->service->label : 'Document',
            'format' => $r->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
            'status' => $r->status ? $r->status->label : 'Pending',
            'status_code' => $r->status ? $r->status->code : 'submitted',
            'created_at' => $r->created_at->timezone('Asia/Manila')->format('M d, Y h:i A'),
            'status_history' => $r->statusHistory->map(fn($h) => [
                'status' => $h->toStatus?->label,
                'changed_by' => $h->changedBy ? $h->changedBy->first_name . ' ' . $h->changedBy->last_name : 'System',
                'note' => $h->note,
                'date' => $h->created_at->timezone('Asia/Manila')->format('M d, Y h:i A')
            ])
        ]);

        return Inertia::render('Admin/Requests', ['requests' => $requests]);
    }

    public function updateRequest(Request $request, $id)
    {
        $certRequest = CertificateRequest::findOrFail($id);

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
}