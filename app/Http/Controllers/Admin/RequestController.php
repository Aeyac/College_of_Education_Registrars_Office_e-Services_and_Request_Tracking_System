<?php

namespace App\Http\Controllers\Admin;
use Illuminate\Support\Facades\Log;
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

    private const NOT_ALLOWED_TO_UPDATE = ['cancelled_returned', 'released', 'rejected'];

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
                ]),
                'is_soft_copy' => $r->isSoftCopy(),
                'output_document' => $r->outputDocument ? [
                    'name' => $r->outputDocument->original_name,
                    'size' => $r->outputDocument->size,
                    'uploaded_at' => $r->outputDocument->created_at->timezone('Asia/Manila')->format('M d, Y h:i A'),
                ] : null,
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

        $statusCode = (string) $request->input('status_code');

        $validated = $request->validate([
            'status_code' => ['required', 'string', 'max:100'],
            'note' => ['nullable', 'string', 'max:1000'],
            'soft_copy' => [
                // required only for soft copy + ready_for_release/released + no file uploaded yet
                $certRequest->needsOutputDocumentFor($statusCode) ? 'required' : 'nullable',
                'file',
                'mimes:pdf',
                'max:5120', // 5 MB
            ],
        ], [
            'soft_copy.required' => 'Upload the soft copy (PDF) before marking this request as ready for release or released.',
        ]);

        $newStatus = RequestStatus::firstOrCreate(
            ['code' => $validated['status_code']],
            ['label' => ucwords(str_replace('_', ' ', $validated['status_code']))]
        );

        $statusChanged = $certRequest->status_id !== $newStatus->id;

        // Attach first: if the upload fails, the status never moves without its file.
        if ($certRequest->acceptsOutputDocumentFor($validated['status_code']) && $request->hasFile('soft_copy')) {
            $certRequest->attachOutputDocument($request->file('soft_copy'), $request->user());
        }

        $certRequest->transitionTo($newStatus, auth()->user(), $validated['note'] ?? null);
        $certRequest->load(['service', 'status']);

        if ($statusChanged && $certRequest->user) {
            try {
                $certRequest->user->notify(
                    new RequestStatusChanged($certRequest, $request->input('note'))
                );
            } catch (\Throwable $e) {
                report($e); // the status update still succeeds if the email fails
            }
        }

        return back()->with('success', 'Status updated.');
    }

    public function archiveRequest($id)
    {
        $certRequest = CertificateRequest::findOrFail($id);

        $currentStatus = RequestStatus::findOrFail($certRequest->status_id);
        abort_unless(in_array($currentStatus->code, self::NOT_ALLOWED_TO_UPDATE), 422, 'Only resolved requests (released, rejected, or cancelled/returned) can be archived.');

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