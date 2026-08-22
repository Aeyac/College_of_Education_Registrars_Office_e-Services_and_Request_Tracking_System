<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\CertificateRequest;
use App\Models\AlumniVerification;
use App\Models\Announcement;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Illuminate\Support\Str; // Added for automatic string formatting

class UserDashboardController extends Controller
{
    private function getUserDetails()
    {
        $user = auth()->user()->load('course');

        if ($user->user_type === 'alumni') {
            $userRole = 'Alumni • Batch ' . ($user->batch_year ?? 'N/A');
        } else {
            $courseName = $user->course ? $user->course->label : 'College of Education';

            $yl = $user->year_level;
            $suffix = 'th';
            if ($yl == 1) $suffix = 'st';
            if ($yl == 2) $suffix = 'nd';
            if ($yl == 3) $suffix = 'rd';

            $userRole = $courseName . ' • ' . ($yl ? $yl . $suffix . ' Year' : 'N/A');
        }

        $isAlumniVerified = false;
        if ($user->user_type === 'alumni') {
            $isAlumniVerified = AlumniVerification::where('user_id', $user->id)
                ->where('status', 'verified')
                ->exists();
        }

        return [
            'role' => $userRole,
            'isAlumniVerified' => $isAlumniVerified,
        ];
    }

    public function dashboard()
    {
        $details = $this->getUserDetails();

        $allRequests = CertificateRequest::with(['service', 'status'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get();

        $pendingCount = $allRequests->filter(function ($r) {
            return in_array($r->status->code ?? '', ['submitted', 'for_review', 'processing', 'for_compliance']);
        })->count();

        $completedCount = $allRequests->filter(function ($r) {
            return in_array($r->status->code ?? '', ['ready_for_release', 'released']);
        })->count();

        $announcements = Announcement::latest()->take(2)->get()->map(function ($ann) {
            return [
                'id' => $ann->id,
                'title' => $ann->title,
                'content' => $ann->body,
                'date' => $ann->created_at->format('M d, Y'),
            ];
        });

        return Inertia::render('User/Dashboard', [
            'userRole' => $details['role'],
            'isAlumniVerified' => $details['isAlumniVerified'],
            'stats' => [
                'pending' => $pendingCount,
                'completed' => $completedCount,
            ],
            'requests' => $allRequests->take(3)->map(function ($req) {
                return [
                    'id' => $req->id,
                    'document_type' => $req->service ? $req->service->label : 'Document',
                    'format' => $req->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
                    'status' => $req->status ? $req->status->label : 'Pending',
                    'created_at' => $req->created_at->format('M d, Y'),
                ];
            }),
            'announcements' => $announcements,
        ]);
    }

    public function requests()
    {
        $details = $this->getUserDetails();
        $requests = CertificateRequest::with(['service', 'status'])
            ->where('user_id', auth()->id())
            ->latest()
            ->get()
            ->map(function ($req) {
                return [
                    'id' => $req->id,
                    'document_type' => $req->service ? $req->service->label : 'Document',
                    'format' => $req->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
                    'status' => $req->status ? $req->status->label : 'Pending',
                    'created_at' => $req->created_at->format('M d, Y'),
                ];
            });

        return Inertia::render('User/Requests', [
            'userRole' => $details['role'],
            'isAlumniVerified' => $details['isAlumniVerified'],
            'requests' => $requests,
        ]);
    }

    public function faculty()
    {
        $details = $this->getUserDetails();
        $faculty = Faculty::where('is_active', true)->orderBy('name', 'asc')->get()->map(function ($prof) {
            $startStr = $prof->consultation_time_start;
            $endStr = $prof->consultation_time_end;

            $startObj = $startStr instanceof \Carbon\Carbon ? $startStr : ($startStr ? \Carbon\Carbon::parse($startStr) : null);
            $endObj = $endStr instanceof \Carbon\Carbon ? $endStr : ($endStr ? \Carbon\Carbon::parse($endStr) : null);

            $formattedStart = $startObj ? $startObj->format('g:i A') : '';
            $formattedEnd = $endObj ? $endObj->format('g:i A') : '';

            $hours = trim(($prof->consultation_days ?? '') . ' ' . $formattedStart . ($formattedStart && $formattedEnd ? ' - ' : '') . $formattedEnd);

            return [
                'id' => $prof->id,
                'name' => $prof->name,
                'role' => $prof->department_or_program,
                'room' => $prof->room_or_location,
                'hours' => $hours ?: 'No schedule set',
            ];
        });

        return Inertia::render('User/Faculty', [
            'userRole' => $details['role'],
            'faculty' => $faculty,
        ]);
    }

    public function announcements()
    {
        $details = $this->getUserDetails();
        $announcements = Announcement::latest()->get()->map(function ($ann) {
            return [
                'id' => $ann->id,
                'title' => $ann->title,
                'content' => $ann->body,
                'date' => $ann->created_at->format('M d, Y'),
            ];
        });

        return Inertia::render('User/Announcements', [
            'userRole' => $details['role'],
            'announcements' => $announcements,
        ]);
    }

    // --- FIX FOR FOREIGN KEY CRASH ---
    public function storeRequest(Request $request)
    {
        // 1. Failsafe: Auto-create the document service if it is missing from the database
        $service = \App\Models\RequestService::firstOrCreate(
            ['label' => $request->document_type],
            ['code' => Str::slug($request->document_type, '_'), 'is_active' => true]
        );

        // 2. Failsafe: Auto-create the "submitted" status if it is missing from the database
        $status = \App\Models\RequestStatus::firstOrCreate(
            ['code' => 'submitted'],
            ['label' => 'Submitted']
        );

        $certReq = CertificateRequest::create([
            'user_id' => auth()->id(),
            'service_id' => $service->id,
            'status_id' => $status->id,
            'delivery_mode' => $request->format === 'Hard Copy' ? 'hard_copy' : 'soft_copy',
            'purpose' => $request->purpose,
        ]);

        // 3. Register history
        $certReq->statusHistory()->create([
            'from_status_id' => null,
            'to_status_id' => $status->id,
            'changed_by' => auth()->id(),
            'note' => 'Request submitted via portal.',
        ]);

        return back()->with('success', 'Request submitted successfully.');
    }

    public function storeAlumniProof(Request $request)
    {
        $request->validate(['proof_file' => 'required|file|mimes:pdf,jpg,jpeg,png|max:10240']);
        $path = $request->file('proof_file')->store('alumni_proofs', 'public');

        AlumniVerification::updateOrCreate(
            ['user_id' => auth()->id()],
            ['document_type' => 'diploma', 'path' => $path, 'status' => 'pending']
        );

        return back()->with('success', 'Verification proof uploaded successfully.');
    }

    public function documents()
    {
        return Inertia::render('User/Documents', ['userRole' => $this->getUserDetails()['role']]);
    }
    public function faq()
    {
        return Inertia::render('User/Faq', ['userRole' => $this->getUserDetails()['role']]);
    }
    public function about()
    {
        return Inertia::render('User/StaticPage', ['title' => 'About CED', 'description' => '', 'content' => '...', 'userRole' => $this->getUserDetails()['role']]);
    }
    public function privacy()
    {
        return Inertia::render('User/StaticPage', ['title' => 'Privacy Policy', 'description' => '', 'content' => '...', 'userRole' => $this->getUserDetails()['role']]);
    }
    public function terms()
    {
        return Inertia::render('User/StaticPage', ['title' => 'Terms of Service', 'description' => '', 'content' => '...', 'userRole' => $this->getUserDetails()['role']]);
    }
}
