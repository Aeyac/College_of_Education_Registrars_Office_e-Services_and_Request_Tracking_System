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
    /**
     * Students/alumni see only their own requests. Admins see everything,
     * with optional filtering — this is the data behind both the student
     * "My Requests" dashboard and the admin request-management dashboard.
     */
    public function index(): Response
    {
        $user = auth()->user();

        $query = CertificateRequest::with(['service', 'status', 'user'])
            ->latest();

        if (!$user->isAdmin()) {
            $query->where('user_id', $user->id);
        }

        return Inertia::render('Requests/Index', [
            'requests' => $query->paginate(20),
            'isAdmin' => $user->isAdmin(),
        ]);
    }

    /** The "New Request" form. */
    public function create(): Response
    {
        $this->authorize('create', CertificateRequest::class);

        return Inertia::render('Requests/Create', [
            'services' => RequestService::where('is_active', true)
                ->orderBy('sort_order')
                ->get(['id', 'code', 'label']),
        ]);
    }

    public function store(StoreCertificateRequestRequest $request)
    {
        $submitted = RequestStatus::where('code', 'submitted')->firstOrFail();

        $certRequest = CertificateRequest::create([
            'user_id' => auth()->id(),
            'service_id' => $request->validated('service_id'),
            'status_id' => $submitted->id,
            'delivery_mode' => $request->validated('delivery_mode'),
            'purpose' => $request->validated('purpose'),
            'preferred_claiming_date' => $request->validated('preferred_claiming_date'),
        ]);

        // Record the initial "Submitted" state in the history too, so the
        // timeline always has a starting point, not just a status_id with
        // no history row explaining how it got there.
        $certRequest->statusHistory()->create([
            'from_status_id' => null,
            'to_status_id' => $submitted->id,
            'changed_by' => auth()->id(),
            'note' => 'Request submitted.',
        ]);

        if ($request->input('service_id') && RequestService::find($request->input('service_id'))?->code === 'internship_certificate') {
            $certRequest->internshipDetails()->create([
                'internship_school_or_agency' => $request->validated('internship_school_or_agency'),
                'grade_level_handled' => $request->validated('grade_level_handled'),
                'semester' => $request->validated('semester'),
                'school_year' => $request->validated('school_year'),
            ]);
        }

        $certRequest->load(['service', 'status']); // needed by the notification's message/mail content
        $certRequest->user->notify(new RequestStatusChanged($certRequest));

        return redirect()
            ->route('requests.show', $certRequest)
            ->with('success', 'Request submitted successfully.');
    }

    public function show(CertificateRequest $certRequest): Response
    {
        $this->authorize('view', $certRequest);

        $certRequest->load([
            'service',
            'status',
            'user',
            'internshipDetails',
            'documents.uploadedBy',
            'documents.verifiedBy',
            'statusHistory.fromStatus',
            'statusHistory.toStatus',
            'statusHistory.changedBy',
        ]);

        return Inertia::render('Requests/Show', [
            'request' => $certRequest,
            'allStatuses' => auth()->user()->isAdmin()
                ? RequestStatus::orderBy('sort_order')->get()
                : null,
        ]);
    }

    public function updateStatus(UpdateCertificateRequestStatusRequest $request, CertificateRequest $certRequest)
    {
        $this->authorize('transitionStatus', $certRequest);

        $newStatus = RequestStatus::where('code', $request->validated('status_code'))->firstOrFail();

        $certRequest->transitionTo($newStatus, auth()->user(), $request->validated('note'));

        $certRequest->user->notify(new RequestStatusChanged($certRequest));

        return back()->with('success', 'Status updated to ' . $newStatus->label . '.');
    }
}