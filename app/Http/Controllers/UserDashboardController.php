<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlumniVerificationRequest;
use App\Http\Requests\StoreCertificateRequestRequest;
use App\Models\Announcement;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\Faculty;
use App\Models\InternshipRequestDetail;
use App\Models\RequestService;
use App\Models\RequestStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    private const PENDING_STATUS_CODES = ['submitted', 'for_review', 'processing', 'for_compliance'];

    private const COMPLETED_STATUS_CODES = ['ready_for_release', 'released'];

    private const DEFAULT_REQUEST_STATUS_CODE = 'submitted';

    public function dashboard(): Response
    {
        $requests = $this->userRequests()->latest()->get();

        return Inertia::render('User/Dashboard', [
            'userRole' => $this->userDisplaySubtitle(),
            'isAlumniVerified' => $this->isAlumniVerified(),
            'stats' => [
                'pending' => $requests->whereIn('status.code', self::PENDING_STATUS_CODES)->count(),
                'completed' => $requests->whereIn('status.code', self::COMPLETED_STATUS_CODES)->count(),
            ],
            'requests' => $this->mapRequests($requests->take(3)),
            'announcements' => $this->mapAnnouncements(Announcement::latest()->take(2)->get()),
            'services' => $this->activeServices(),
        ]);
    }

    public function requests(): Response
    {
        return Inertia::render('User/Requests', [
            'userRole' => $this->userDisplaySubtitle(),
            'isAlumniVerified' => $this->isAlumniVerified(),
            'requests' => $this->mapRequests($this->userRequests()->latest()->get()),
        ]);
    }

    public function faculty(): Response
    {
        $faculty = Faculty::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Faculty $prof) => [
                'id' => $prof->id,
                'name' => $prof->name,
                'role' => $prof->department_or_program,
                'room' => $prof->room_or_location,
                'hours' => $this->formatConsultationHours($prof),
            ]);

        return Inertia::render('User/Faculty', [
            'userRole' => $this->userDisplaySubtitle(),
            'faculty' => $faculty,
        ]);
    }

    public function announcements(): Response
    {
        return Inertia::render('User/Announcements', [
            'userRole' => $this->userDisplaySubtitle(),
            'announcements' => $this->mapAnnouncements(Announcement::latest()->get()),
        ]);
    }

    public function storeRequest(StoreCertificateRequestRequest $request): RedirectResponse
    {
        $data = $request->validated();
        $service = RequestService::findOrFail($data['service_id']);
        $status = $this->defaultRequestStatus();

        DB::transaction(function () use ($request, $data, $service, $status) {
            $certificateRequest = CertificateRequest::create([
                'user_id' => $request->user()->id,
                'service_id' => $service->id,
                'status_id' => $status->id,
                'delivery_mode' => $data['delivery_mode'],
                'purpose' => $data['purpose'] ?? null,
                'preferred_claiming_date' => $data['preferred_claiming_date'] ?? null,
            ]);

            $certificateRequest->statusHistory()->create([
                'from_status_id' => null,
                'to_status_id' => $status->id,
                'changed_by' => $request->user()->id,
                'note' => 'Request submitted via portal.',
            ]);

            if ($service->isInternshipCertificate()) {
                $certificateRequest->internshipDetails()->create([
                    'internship_school_or_agency' => $data['internship_school_or_agency'],
                    'grade_level_handled' => $data['grade_level_handled'] ?? null,
                    'semester' => $data['semester'],
                    'school_year' => $data['school_year'],
                ]);
            }
        });

        return back()->with('success', 'Request submitted successfully.');
    }

    public function storeAlumniProof(StoreAlumniVerificationRequest $request): RedirectResponse
    {
        $path = $request->file('file')->store('alumni_proofs', 'public');

        AlumniVerification::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'document_type' => $request->validated('document_type'),
                'path' => $path,
                'status' => 'pending',
            ]
        );

        return back()->with('success', 'Verification proof uploaded successfully.');
    }

    // public function documents(): Response
    // {
    //     return Inertia::render('User/Documents', ['userRole' => $this->userDisplaySubtitle()]);
    // }

    public function faq(): Response
    {
        return Inertia::render('User/Faq', ['userRole' => $this->userDisplaySubtitle()]);
    }

    public function about(): Response
    {
        return $this->staticPage('About CED');
    }

    public function privacy(): Response
    {
        return $this->staticPage('Privacy Policy');
    }

    public function terms(): Response
    {
        return $this->staticPage('Terms of Service');
    }

    private function userRequests()
    {
        return CertificateRequest::with(['service', 'status'])
            ->where('user_id', auth()->id());
    }

    private function mapRequests(Collection $requests): Collection
    {
        return $requests->map(fn (CertificateRequest $req) => [
            'id' => $req->id,
            'document_type' => $req->service?->label ?? 'Document',
            'format' => $req->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
            'status' => $req->status?->label ?? 'Pending',
            'created_at' => $req->created_at->format('M d, Y'),
        ]);
    }

    private function mapAnnouncements(Collection $announcements): Collection
    {
        return $announcements->map(fn (Announcement $ann) => [
            'id' => $ann->id,
            'title' => $ann->title,
            'content' => $ann->body,
            'date' => $ann->created_at->format('M d, Y'),
        ]);
    }

    private function formatConsultationHours(Faculty $prof): string
    {
        $start = $prof->consultation_time_start ? \Carbon\Carbon::parse($prof->consultation_time_start) : null;
        $end = $prof->consultation_time_end ? \Carbon\Carbon::parse($prof->consultation_time_end) : null;

        $range = trim(($start?->format('g:i A') ?? '') . ($start && $end ? ' - ' : '') . ($end?->format('g:i A') ?? ''));
        $hours = trim(($prof->consultation_days ?? '') . ' ' . $range);

        return $hours ?: 'No schedule set';
    }

    private function defaultRequestStatus(): RequestStatus
    {
        return RequestStatus::where('code', self::DEFAULT_REQUEST_STATUS_CODE)->firstOrFail();
    }

    private function activeServices(): Collection
    {
        return RequestService::where('is_active', true)
            ->orderBy('sort_order')
            ->get(['id', 'code', 'label'])
            ->map(fn (RequestService $service) => [
                'id' => $service->id,
                'code' => $service->code,
                'label' => $service->label,
            ]);
    }

    private function userDisplaySubtitle(): string
    {
        $user = auth()->user()->load('course');

        if ($user->user_type === 'alumni') {
            return 'Alumni • Batch ' . ($user->batch_year ?? 'N/A');
        }

        $courseName = $user->course?->label ?? 'College of Education';
        $yearLevel = $user->year_level;

        $suffix = match ($yearLevel) {
            1 => 'st',
            2 => 'nd',
            3 => 'rd',
            default => 'th',
        };

        return $courseName . ' • ' . ($yearLevel ? $yearLevel . $suffix . ' Year' : 'N/A');
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

    private function staticPage(string $title): Response
    {
        return Inertia::render('User/StaticPage', [
            'title' => $title,
            'description' => '',
            'content' => '...',
            'userRole' => $this->userDisplaySubtitle(),
        ]);
    }
}