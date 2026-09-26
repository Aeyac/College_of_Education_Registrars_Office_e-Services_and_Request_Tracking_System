<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCertificateRequestRequest;
use App\Http\Requests\UpdateCertificateRequestStatusRequest;
use App\Models\CertificateRequest;
use App\Models\RequestService;
use App\Models\RequestStatus;
use App\Notifications\RequestStatusChanged;
use Inertia\Inertia;
use Inertia\Response;

class CertificateRequestController extends Controller
{
    private const LOCKED_STATUSES = ['cancelled', 'released', 'ready_for_release', 'rejected'];

    public function markReceived(CertificateRequest $certificateRequest)
    {
        abort_unless($certificateRequest->user_id === auth()->id(), 403);

        if (!$certificateRequest->received_at) {
            $certificateRequest->update(['received_at' => now()]);

            if ($certificateRequest->status?->code === 'ready_for_release') {
                $releasedStatus = RequestStatus::where('code', 'released')->firstOrFail();

                $certificateRequest->transitionTo(
                    $releasedStatus,
                    auth()->user(),
                    'Receipt confirmed by student.'
                );
            } else {
                $certificateRequest->statusHistory()->create([
                    'from_status_id' => $certificateRequest->status_id,
                    'to_status_id' => $certificateRequest->status_id,
                    'changed_by' => auth()->id(),
                    'note' => 'Receipt confirmed by student.',
                ]);
            }
        }

        return back()->with('success', 'Receipt confirmed.');
    }


    public function archive(CertificateRequest $certificateRequest)
    {
        abort_unless($certificateRequest->user_id === auth()->id(), 403);
        abort_unless(
            in_array($certificateRequest->status?->code, self::LOCKED_STATUSES),
            422,
            'Only resolved requests (released, ready for release, or cancelled/returned) can be archived.'
        );

        $certificateRequest->update(['archived_at_user' => now()]);

        return back()->with('success', 'Request archived.');
    }

    public function unarchive(CertificateRequest $certificateRequest)
    {
        abort_unless($certificateRequest->user_id === auth()->id(), 403);

        $certificateRequest->update(['archived_at_user' => null]);

        return back()->with('success', 'Request restored.');
    }

    public function cancel(CertificateRequest $certificateRequest)
    {
        abort_unless($certificateRequest->user_id === auth()->id(), 403);

        if (!$certificateRequest->isCancellable()) {
            return back()->with('error', 'This request can no longer be cancelled.');
        }

        $certificateRequest->update([
            'status_id' => RequestStatus::idFor('cancelled'),
        ]);

        return back()->with('success', 'Request cancelled.');
    }

    public function comply(CertificateRequest $certificateRequest, \Illuminate\Http\Request $request)
    {
        abort_unless($certificateRequest->user_id === auth()->id(), 403);
        
        if ($certificateRequest->status?->code !== 'for_compliance') {
            return back()->with('error', 'This request does not require compliance.');
        }

        $request->validate([
            'compliance_files' => ['nullable', 'array', 'max:5'],
            'compliance_files.*' => ['file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],
        ]);

        if ($request->hasFile('compliance_files')) {
            foreach ($request->file('compliance_files') as $file) {
                $path = $file->store('requirements', 'private');
                $certificateRequest->documents()->create([
                    'type' => 'requirement',
                    'path' => $path,
                    'uploaded_by' => $request->user()->id,
                ]);
            }
        }

        $forReviewStatus = RequestStatus::where('code', 'for_review')->firstOrFail();

        $certificateRequest->transitionTo(
            $forReviewStatus,
            auth()->user(),
            'Requester submitted compliance.'
        );

        $certificateRequest->load(['service', 'status']);
        $certificateRequest->user->notify(new \App\Notifications\RequestStatusChanged($certificateRequest, 'Requester submitted compliance.'));

        return back()->with('success', 'Compliance submitted. Your request is now under review.');
    }

    // public function index(): Response
    // {
    //     $user = auth()->user();

    //     $query = CertificateRequest::with(['service', 'status', 'user'])
    //         ->latest();

    //     if (!$user->isAdmin()) {
    //         $query->where('user_id', $user->id);
    //     }

    //     return Inertia::render('Requests/Index', [
    //         'requests' => $query->paginate(20),
    //         'isAdmin' => $user->isAdmin(),
    //     ]);
    // }

    // /** The "New Request" form. */
    // public function create(): Response
    // {
    //     $this->authorize('create', CertificateRequest::class);

    //     return Inertia::render('Requests/Create', [
    //         'services' => RequestService::where('is_active', true)
    //             ->orderBy('sort_order')
    //             ->get(['id', 'code', 'label']),
    //     ]);
    // }

    // public function store(StoreCertificateRequestRequest $request)
    // {
    //     $submitted = RequestStatus::where('code', 'submitted')->firstOrFail();

    //     $certRequest = CertificateRequest::create([
    //         'user_id' => auth()->id(),
    //         'service_id' => $request->validated('service_id'),
    //         'status_id' => $submitted->id,
    //         'delivery_mode' => $request->validated('delivery_mode'),
    //         'purpose' => $request->validated('purpose'),
    //         'preferred_claiming_date' => $request->validated('preferred_claiming_date'),
    //     ]);

    //     // Record the initial "Submitted" state in the history too, so the
    //     // timeline always has a starting point, not just a status_id with
    //     // no history row explaining how it got there.
    //     $certRequest->statusHistory()->create([
    //         'from_status_id' => null,
    //         'to_status_id' => $submitted->id,
    //         'changed_by' => auth()->id(),
    //         'note' => 'Request submitted.',
    //     ]);

    //     if ($request->input('service_id') && RequestService::find($request->input('service_id'))?->code === 'internship_certificate') {
    //         $certRequest->internshipDetails()->create([
    //             'internship_school_or_agency' => $request->validated('internship_school_or_agency'),
    //             'grade_level_handled' => $request->validated('grade_level_handled'),
    //             'semester' => $request->validated('semester'),
    //             'school_year' => $request->validated('school_year'),
    //         ]);
    //     }

    //     $certRequest->load(['service', 'status']); // needed by the notification's message/mail content
    //     $certRequest->user->notify(new RequestStatusChanged($certRequest));

    //     return redirect()
    //         ->route('requests.show', $certRequest)
    //         ->with('success', 'Request submitted successfully.');
    // }

    // public function show(CertificateRequest $certRequest): Response
    // {
    //     $this->authorize('view', $certRequest);

    //     $certRequest->load([
    //         'service',
    //         'status',
    //         'user',
    //         'internshipDetails',
    //         'documents.uploadedBy',
    //         'documents.verifiedBy',
    //         'statusHistory.fromStatus',
    //         'statusHistory.toStatus',
    //         'statusHistory.changedBy',
    //     ]);

    //     return Inertia::render('Requests/Show', [
    //         'request' => $certRequest,
    //         'allStatuses' => auth()->user()->isAdmin()
    //             ? RequestStatus::orderBy('sort_order')->get()
    //             : null,
    //     ]);
    // }

    // public function updateStatus(UpdateCertificateRequestStatusRequest $request, CertificateRequest $certRequest)
    // {
    //     $this->authorize('transitionStatus', $certRequest);

    //     $newStatus = RequestStatus::where('code', $request->validated('status_code'))->firstOrFail();

    //     $certRequest->transitionTo($newStatus, auth()->user(), $request->validated('note'));

    //     $certRequest->user->notify(new RequestStatusChanged($certRequest));

    //     return back()->with('success', 'Status updated to ' . $newStatus->label . '.');
    // }
}