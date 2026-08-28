<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAlumniVerificationRequest;
use App\Http\Requests\StoreCertificateRequestRequest;
use App\Models\Announcement;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\Faculty;
use App\Models\Inquiry;
use App\Models\RequestService;
use App\Models\RequestStatus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class UserDashboardController extends Controller
{
    // private const PENDING_STATUS_CODES = ['submitted', 'for_review', 'processing', 'for_compliance'];
    // private const COMPLETED_STATUS_CODES = ['ready_for_release', 'released'];
    // private const DEFAULT_REQUEST_STATUS_CODE = 'submitted';

    // public function dashboard(): Response
    // {
    //     $requests = $this->userRequests()->latest()->get();

    //     return Inertia::render('User/Dashboard', [
    //         'userRole' => $this->userDisplaySubtitle(),
    //         'isAlumniVerified' => $this->isAlumniVerified(),
    //         'stats' => [
    //             'pending' => $requests->whereIn('status.code', self::PENDING_STATUS_CODES)->count(),
    //             'completed' => $requests->whereIn('status.code', self::COMPLETED_STATUS_CODES)->count(),
    //         ],
    //         'requests' => $this->mapRequests($requests->take(3)),
    //         'announcements' => $this->mapAnnouncements(Announcement::latest()->take(2)->get()),
    //         'services' => $this->activeServices(),
    //     ]);
    // }

    // public function requests(): Response
    // {
    //     return Inertia::render('User/Requests', [
    //         'userRole' => $this->userDisplaySubtitle(),
    //         'isAlumniVerified' => $this->isAlumniVerified(),
    //         'requests' => $this->mapRequests($this->userRequests()->latest()->get()),
    //     ]);
    // }

    public function faculty(): Response
    {
        $faculty = Faculty::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn(Faculty $prof) => [
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

            $certificateRequest->load(['service', 'status', 'user']);
            $request->user()->notify(new \App\Notifications\RequestStatusChanged($certificateRequest));

            $admins = \App\Models\User::where('user_type', 'admin')->get();
            \Illuminate\Support\Facades\Notification::send($admins, new \App\Notifications\RequestStatusChanged($certificateRequest));
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

    // === INQUIRIES & THREADS ===
    private function containsSpam(string $text): bool {
        $spamWords = ['fuck', 'shit', 'bitch', 'asshole', 'dick', 'pussy', 'putangina', 'tangina', 'gago', 'bobo', 'tanga', 'inutil', 'ulol', 'punyeta', 'hayop', 'gaga', 'kupal', 'tarantado'];
        foreach ($spamWords as $word) {
            if (stripos($text, $word) !== false) {
                return true;
            }
        }
        return false;
    }

    public function inquiries(): Response
    {
        $inquiries = \App\Models\Inquiry::with(['messages.user', 'messages.parent.user'])
            ->where('user_id', auth()->id())
            ->latest('updated_at')
            ->get()
            ->map(fn($inq) => [
                'id' => $inq->id,
                'subject' => $inq->subject,
                'status' => $inq->status,
                'is_read' => $inq->is_read_by_user,
                'date' => $inq->created_at->format('M d, Y h:i A'),
                'messages' => $inq->messages->map(fn($msg) => [
                    'id' => $msg->id,
                    'message' => $msg->message,
                    'attachment_url' => $msg->attachment_path ? asset('storage/' . $msg->attachment_path) : null,
                    'attachment_name' => $msg->attachment_path ? basename($msg->attachment_path) : null,
                    'is_edited' => $msg->is_edited,
                    'sender_name' => $msg->user ? $msg->user->first_name : 'User',
                    'sender_avatar' => $msg->user && $msg->user->profile_picture ? asset('storage/' . $msg->user->profile_picture) : null,
                    'is_admin' => $msg->user && $msg->user->user_type === 'admin',
                    'is_own' => $msg->user_id === auth()->id(),
                    'created_at' => $msg->created_at->format('M d, Y h:i A'),
                    'parent' => $msg->parent ? [
                        'id' => $msg->parent->id,
                        'message' => $msg->parent->message,
                        'sender_name' => $msg->parent->user ? $msg->parent->user->first_name : 'User',
                    ] : null,
                ])
            ]);

        return Inertia::render('User/Inquiries', [
            'userRole' => $this->userDisplaySubtitle(),
            'inquiries' => $inquiries
        ]);
    }

    public function storeInquiry(\Illuminate\Http\Request $request): RedirectResponse
    {
        $data = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:2000',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,docx|max:10240',
        ]);

        if ($this->containsSpam($data['message']) || $this->containsSpam($data['subject'])) {
            return back()->withErrors(['message' => 'Your message contains inappropriate words.']);
        }

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('inquiries', 'public');
        }

        DB::transaction(function () use ($data, $path) {
            $inquiry = \App\Models\Inquiry::create([
                'user_id' => auth()->id(),
                'subject' => $data['subject'],
                'status'  => 'open',
                'is_read_by_user' => true,
                'is_read_by_admin' => false,
            ]);

            $inquiry->messages()->create([
                'user_id' => auth()->id(),
                'message' => $data['message'],
                'attachment_path' => $path,
            ]);
        });

        return redirect()->route('user.inquiries')->with('success', 'Inquiry thread started successfully.');
    }

    public function replyInquiry(Request $request, $id): RedirectResponse
    {
        $data = $request->validate([
            'message' => 'required|string|max:2000',
            'parent_id' => 'nullable|exists:inquiry_messages,id',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,docx|max:10240',
        ]);

        if ($this->containsSpam($data['message'])) {
            return back()->withErrors(['message' => 'Your message contains inappropriate words.']);
        }

        $inquiry = Inquiry::where('user_id', auth()->id())->findOrFail($id);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('inquiries', 'public');
        }

        $inquiry->messages()->create([
            'user_id' => auth()->id(),
            'message' => $data['message'],
            'parent_id' => $data['parent_id'] ?? null,
            'attachment_path' => $path,
        ]);

        $inquiry->update([
            'is_read_by_user' => true,
            'is_read_by_admin' => false,
        ]);

        return back()->with('success', 'Reply sent.');
    }

    public function editMessage(\Illuminate\Http\Request $request, $id): RedirectResponse
    {
        $data = $request->validate(['message' => 'required|string|max:2000']);
        if ($this->containsSpam($data['message'])) {
            return back()->withErrors(['message' => 'Your message contains inappropriate words.']);
        }

        $message = \App\Models\InquiryMessage::where('user_id', auth()->id())->findOrFail($id);
        $message->update([
            'message' => $data['message'],
            'is_edited' => true,
        ]);

        return back();
    }

    public function deleteMessage($id): RedirectResponse
    {
        $message = \App\Models\InquiryMessage::where('user_id', auth()->id())->findOrFail($id);
        if ($message->inquiry->messages()->count() <= 1) {
            $message->inquiry->delete();
        } else {
            $message->delete();
        }
        return back();
    }

    public function markInquiryRead($id): RedirectResponse
    {
        $inquiry = \App\Models\Inquiry::where('user_id', auth()->id())->findOrFail($id);
        $inquiry->update(['is_read_by_user' => true]);
        return back();
    }

    public function markInquiryUnread($id): RedirectResponse
    {
        $inquiry = \App\Models\Inquiry::where('user_id', auth()->id())->findOrFail($id);
        $inquiry->update(['is_read_by_user' => false]);
        return back();
    }

    public function deleteInquiry($id): RedirectResponse
    {
        $inquiry = \App\Models\Inquiry::where('user_id', auth()->id())->findOrFail($id);
        $inquiry->delete();
        return back()->with('success', 'Inquiry deleted successfully.');
    }

    // =========================================================================

    public function faq(): Response { return Inertia::render('User/Faq', ['userRole' => $this->userDisplaySubtitle()]); }
    public function markNotificationsAsRead(): RedirectResponse { auth()->user()->unreadNotifications->markAsRead(); return back(); }

    public function about(): Response
    {
        $content = <<<'HTML'
        <div style="font-family: inherit;">
            <p style="font-size: 1.125rem; color: #475569; margin-bottom: 2.5rem; line-height: 1.7;">Welcome to the <strong style="color: #0f172a;">College of Education (CED) E-Services Portal</strong>. Our platform is designed to provide students and alumni with a seamless, efficient, and digital-first approach to academic and registrar services.</p>
            
            <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem;">Our Mission</h3>
            <p style="color: #475569; margin-bottom: 3rem; line-height: 1.7;">We aim to streamline the process of requesting vital academic documents, scheduling faculty consultations, and tracking the progress of your submissions. By digitizing these core processes, we eliminate long queues, reduce paperwork, and empower you to manage your academic journey from anywhere, at any time.</p>

            <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-bottom: 1.5rem;">What We Offer</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <div style="width: 3rem; height: 3rem; background-color: #fef9c3; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: #ca8a04; margin-bottom: 1.25rem;">
                        <svg style="width: 1.5rem; height: 1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                    </div>
                    <strong style="display: block; color: #0f172a; font-size: 1rem; margin-bottom: 0.5rem; font-weight: 700;">Document Requests</strong>
                    <span style="font-size: 0.875rem; color: #64748b; line-height: 1.6; display: block;">Request Internship Certificates, Copy of COBC, and other academic records effortlessly.</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <div style="width: 3rem; height: 3rem; background-color: #fef9c3; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: #ca8a04; margin-bottom: 1.25rem;">
                        <svg style="width: 1.5rem; height: 1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    </div>
                    <strong style="display: block; color: #0f172a; font-size: 1rem; margin-bottom: 0.5rem; font-weight: 700;">Real-Time Tracking</strong>
                    <span style="font-size: 0.875rem; color: #64748b; line-height: 1.6; display: block;">Monitor the status of your requests from the moment of submission to its release.</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <div style="width: 3rem; height: 3rem; background-color: #fef9c3; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: #ca8a04; margin-bottom: 1.25rem;">
                        <svg style="width: 1.5rem; height: 1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                    </div>
                    <strong style="display: block; color: #0f172a; font-size: 1rem; margin-bottom: 0.5rem; font-weight: 700;">Faculty Schedules</strong>
                    <span style="font-size: 0.875rem; color: #64748b; line-height: 1.6; display: block;">View up-to-date consultation hours to properly coordinate with your professors.</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <div style="width: 3rem; height: 3rem; background-color: #fef9c3; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: #ca8a04; margin-bottom: 1.25rem;">
                        <svg style="width: 1.5rem; height: 1.5rem;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    </div>
                    <strong style="display: block; color: #0f172a; font-size: 1rem; margin-bottom: 0.5rem; font-weight: 700;">Alumni Verification</strong>
                    <span style="font-size: 0.875rem; color: #64748b; line-height: 1.6; display: block;">A dedicated portal for graduates to secure necessary documents for employment.</span>
                </div>
            </div>

            <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin-top: 3rem; margin-bottom: 1.5rem;">Meet the Development Team</h3>
            <p style="color: #475569; margin-bottom: 2rem; line-height: 1.7;">The CED E-Services Portal was conceptualized, designed, and brought to life by a dedicated team of aspiring IT professionals. Driven by the goal to modernize academic transactions, this system stands as a testament to their collaboration and technical expertise.</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin-bottom: 3rem;">
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <strong style="display: block; color: #0f172a; font-size: 1.125rem;">Jay-ar S. De Guzman</strong>
                    <span style="font-size: 0.875rem; color: #ca8a04; font-weight: 700; margin-top: 0.25rem; display: block;">Scrum Master | Frontend & Backend Programmer</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <strong style="display: block; color: #0f172a; font-size: 1.125rem;">Mel Joseph T. Velasco</strong>
                    <span style="font-size: 0.875rem; color: #64748b; font-weight: 600; margin-top: 0.25rem; display: block;">Frontend & Backend Programmer</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <strong style="display: block; color: #0f172a; font-size: 1.125rem;">Aaron A. Castro</strong>
                    <span style="font-size: 0.875rem; color: #64748b; font-weight: 600; margin-top: 0.25rem; display: block;">Frontend & Backend Programmer</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <strong style="display: block; color: #0f172a; font-size: 1.125rem;">Reazel Keith D. Herbas</strong>
                    <span style="font-size: 0.875rem; color: #64748b; font-weight: 600; margin-top: 0.25rem; display: block;">Frontend Programmer</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <strong style="display: block; color: #0f172a; font-size: 1.125rem;">Dan Loyd S. Francia</strong>
                    <span style="font-size: 0.875rem; color: #64748b; font-weight: 600; margin-top: 0.25rem; display: block;">Frontend Programmer</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <strong style="display: block; color: #0f172a; font-size: 1.125rem;">Sheryn Mae P. De Vera</strong>
                    <span style="font-size: 0.875rem; color: #64748b; font-weight: 600; margin-top: 0.25rem; display: block;">Documentator & Frontend Programmer</span>
                </div>
                <div style="background-color: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);">
                    <strong style="display: block; color: #0f172a; font-size: 1.125rem;">Jayveelyn C. Vicente</strong>
                    <span style="font-size: 0.875rem; color: #64748b; font-weight: 600; margin-top: 0.25rem; display: block;">Quality Assurance (QA)</span>
                </div>
            </div>

            <div style="background-color: #fefce8; border: 1px solid #fef08a; padding: 1.5rem; border-radius: 1rem;">
                <h4 style="font-weight: 800; color: #854d0e; font-size: 1.125rem; margin-bottom: 0.5rem; margin-top: 0;">Commitment to Excellence</h4>
                <p style="color: #a16207; font-size: 0.875rem; line-height: 1.6; margin: 0;">The CED Registrar's Office remains committed to providing transparent, prompt, and secure services tailored to the needs of our future educators and esteemed alumni.</p>
            </div>
        </div>
        HTML;

        return $this->staticPage('About CED E-Services', 'Learn more about our mission and digital platform.', $content);
    }

    public function privacy(): Response
    {
        $content = <<<'HTML'
        <div style="font-family: inherit; color: #475569; line-height: 1.7;">
            <p style="font-size: 1.125rem; margin-bottom: 2.5rem; color: #334155;">CED E-Services ("we," "our," or "us") operates the website and online services for processing document requests and scheduling meetings. This Privacy Policy outlines how we collect, use, and protect your information when you access or use our platform.</p>
            
            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">1. Information We Collect</h3>
            <p style="margin-bottom: 1rem;">We collect personal information that you directly provide when submitting requests or scheduling appointments:</p>
            <ul style="padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem;">
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Contact Information:</strong> Full name, email address, phone number, and physical mailing address (if physical document delivery is required).</li>
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Identification Details:</strong> Student, employee, or reference numbers necessary to verify your record for document issuance.</li>
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Appointment Details:</strong> Date, time, reason for meeting, and any supporting notes submitted during registration.</li>
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Technical Data:</strong> IP address, browser type, and standard server log data collected automatically when accessing the site.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">2. How We Use Your Information</h3>
            <p style="margin-bottom: 1rem;">Your data is used strictly for administrative and operational purposes, including:</p>
            <ul style="padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem;">
                <li style="margin-bottom: 0.5rem;">Processing, issuing, and verifying your requested official documents.</li>
                <li style="margin-bottom: 0.5rem;">Confirming, rescheduling, or managing your requested meeting slots.</li>
                <li style="margin-bottom: 0.5rem;">Sending system notifications, status updates, and administrative reminders.</li>
                <li style="margin-bottom: 0.5rem;">Maintaining system security and preventing unauthorized access.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">3. Sharing and Disclosure</h3>
            <p style="margin-bottom: 1rem;">We do not sell, rent, or trade your personal information. We may share data under the following conditions:</p>
            <ul style="padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem;">
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Authorized Staff:</strong> Internal administrators and officials responsible for fulfilling document requests or attending meetings.</li>
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Legal Requirements:</strong> When required by applicable laws, regulations, or lawful court orders.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">4. Data Security & Retention</h3>
            <p style="margin-bottom: 2rem;">We implement security measures designed to safeguard your personal records against unauthorized disclosure, alteration, or access. Your data is retained only for as long as necessary to fulfill document requests, record-keeping requirements, or legal compliance.</p>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">5. Your Rights</h3>
            <p style="margin-bottom: 2rem;">Depending on applicable local regulations, you have the right to request access to, correction of, or deletion of your personal data maintained on our platform, subject to identity verification and valid record-keeping obligations.</p>
        </div>
        HTML;

        return $this->staticPage('Privacy Policy', 'How we collect, use, and protect your information.', $content);
    }

    public function terms(): Response
    {
        $content = <<<'HTML'
        <div style="font-family: inherit; color: #475569; line-height: 1.7;">
            <p style="font-size: 1.125rem; margin-bottom: 2.5rem; color: #334155;">By accessing or using the CED E-Services platform, you agree to comply with and be bound by the following Terms and Conditions.</p>
            
            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">1. Services Provided</h3>
            <p style="margin-bottom: 1rem;">CED E-Services provides an online system allowing users to:</p>
            <ul style="padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem;">
                <li style="margin-bottom: 0.5rem;">Submit official requests for documents.</li>
                <li style="margin-bottom: 0.5rem;">Schedule appointments or meetings with designated representatives.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">2. User Responsibilities</h3>
            <p style="margin-bottom: 1rem;">By submitting any request or scheduling an appointment, you agree that:</p>
            <ul style="padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem;">
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Accuracy:</strong> All information, identifiers, and supporting details you provide are accurate, truthful, and complete.</li>
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Identity Verification:</strong> You are requesting documents or appointments only for yourself or as an authorized representative. Providing fraudulent or misleading information may result in cancellation of requests and reporting to relevant authorities.</li>
                <li style="margin-bottom: 0.5rem;"><strong style="color: #1e293b;">Account Security:</strong> You are responsible for keeping any registration reference numbers or login credentials confidential.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">3. Document Requests & Processing</h3>
            <ul style="padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem;">
                <li style="margin-bottom: 0.5rem;">Processing times for requested documents may vary depending on availability, administrative verification, or peak schedules.</li>
                <li style="margin-bottom: 0.5rem;">Submitting a request does not guarantee immediate document release if prerequisites, clearance, or fees (if applicable) are not met.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">4. Meeting Scheduling & Attendance</h3>
            <ul style="padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem;">
                <li style="margin-bottom: 0.5rem;">Scheduled appointments are subject to administrative availability and confirmation.</li>
                <li style="margin-bottom: 0.5rem;">Users are expected to arrive on time for scheduled meetings. Missed appointments may require rescheduling through the system.</li>
                <li style="margin-bottom: 0.5rem;">CED E-Services reserves the right to reschedule or cancel appointments due to unexpected operational changes.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">5. Prohibited Activities</h3>
            <p style="margin-bottom: 1rem;">Users must not:</p>
            <ul style="padding-left: 1.5rem; list-style-type: disc; margin-bottom: 2rem;">
                <li style="margin-bottom: 0.5rem;">Use the site to submit false, malicious, or spam requests.</li>
                <li style="margin-bottom: 0.5rem;">Attempt to gain unauthorized access to site infrastructure, databases, or other users' data.</li>
                <li style="margin-bottom: 0.5rem;">Interfere with the proper operation of the registration service.</li>
            </ul>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">6. Limitation of Liability</h3>
            <p style="margin-bottom: 2rem;">CED E-Services is provided on an "as is" and "as available" basis. We are not liable for delays, temporary downtime, or service disruptions caused by technical failures, incomplete user information, or external events beyond our control.</p>

            <h3 style="color: #0f172a; font-size: 1.25rem; font-weight: 800; margin-top: 2.5rem; margin-bottom: 1rem;">7. Changes to Terms</h3>
            <p style="margin-bottom: 2rem;">We reserve the right to update or modify these Terms and Conditions at any time. Continued use of the platform after updates constitutes acceptance of the modified terms.</p>
        </div>
        HTML;

        return $this->staticPage('Terms of Service', 'Rules and guidelines for using the CED E-Services platform.', $content);
    }

    private function staticPage(string $title, string $description, string $content): Response
    {
        return Inertia::render('User/StaticPage', [
            'title' => $title,
            'description' => $description,
            'content' => $content,
            'userRole' => $this->userDisplaySubtitle(),
        ]);
    }

    // private function userRequests()
    // {
    //     return CertificateRequest::with(['service', 'status'])
    //         ->where('user_id', auth()->id());
    // }

    // private function mapRequests(Collection $requests): Collection
    // {
    //     return $requests->map(fn(CertificateRequest $req) => [
    //         'id' => $req->id,
    //         'document_type' => $req->service?->label ?? 'Document',
    //         'format' => $req->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
    //         'status' => $req->status?->label ?? 'Pending',
    //         'created_at' => $req->created_at->format('M d, Y'),
    //     ]);
    // }

    // private function mapAnnouncements(Collection $announcements): Collection
    // {
    //     return $announcements->map(fn(Announcement $ann) => [
    //         'id' => $ann->id,
    //         'title' => $ann->title,
    //         'content' => $ann->body,
    //         'date' => $ann->created_at->format('M d, Y'),
    //     ]);
    // }

    // private function formatConsultationHours(Faculty $prof): string
    // {
    //     $start = $prof->consultation_time_start ? \Carbon\Carbon::parse($prof->consultation_time_start) : null;
    //     $end = $prof->consultation_time_end ? \Carbon\Carbon::parse($prof->consultation_time_end) : null;
    //     $range = trim(($start?->format('g:i A') ?? '') . ($start && $end ? ' - ' : '') . ($end?->format('g:i A') ?? ''));

    //     $hours = trim(($prof->consultation_days ?? '') . ' ' . $range);
    //     return $hours ?: 'No schedule set';
    // }

    // private function defaultRequestStatus(): RequestStatus
    // {
    //     return RequestStatus::where('code', self::DEFAULT_REQUEST_STATUS_CODE)->firstOrFail();
    // }

    // private function activeServices(): Collection
    // {
    //     return RequestService::where('is_active', true)
    //         ->orderBy('sort_order')
    //         ->get(['id', 'code', 'label'])
    //         ->map(fn(RequestService $service) => [
    //             'id' => $service->id,
    //             'code' => $service->code,
    //             'label' => $service->label,
    //         ]);
    // }

    // private function userDisplaySubtitle(): string
    // {
    //     $user = auth()->user()->load('course');

    //     if ($user->user_type === 'alumni') {
    //         return 'Alumni   Batch ' . ($user->batch_year ?? 'N/A');
    //     }

    //     $courseName = $user->course?->label ?? 'College of Education';
    //     $yearLevel = $user->year_level;

    //     $suffix = match ($yearLevel) {
    //         1 => 'st',
    //         2 => 'nd',
    //         3 => 'rd',
    //         default => 'th',
    //     };

    //     return $courseName . '   ' . ($yearLevel ? $yearLevel . $suffix . ' Year' : 'N/A');
    // }

    // private function isAlumniVerified(): bool
    // {
    //     $user = auth()->user();
    //     if ($user->user_type !== 'alumni') {
    //         return false;
    //     }

    //     return AlumniVerification::where('user_id', $user->id)
    //         ->where('status', 'verified')
    //         ->exists();
    // }
}