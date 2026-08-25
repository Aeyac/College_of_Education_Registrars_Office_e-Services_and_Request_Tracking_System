<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\CertificateRequest;
use App\Models\AlumniVerification;
use App\Models\Faculty;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Spatie\Permission\Models\Role;

class AdminDashboardController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending' => CertificateRequest::whereHas('status', fn($q) => $q->whereIn('code', ['submitted', 'for_review', 'processing', 'for_compliance']))->count(),
                'alumni' => AlumniVerification::where('status', 'pending')->count(),
                'users' => User::whereIn('user_type', ['student', 'alumni', 'admin'])->count(),
            ]
        ]);
    }

    public function markNotificationsAsRead(): RedirectResponse
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    }

    public function requests()
    {
        $requests = CertificateRequest::with(['user', 'status', 'service'])->latest()->get()->map(fn($r) => [
            'id' => $r->id,
            'student_name' => $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown',
            'document_type' => $r->service ? $r->service->label : 'Document',
            'format' => $r->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
            'status' => $r->status ? $r->status->label : 'Pending',
            'status_code' => $r->status ? $r->status->code : 'submitted',
        ]);

        return Inertia::render('Admin/Requests', ['requests' => $requests]);
    }

    public function updateRequest(Request $request, $id)
    {
        $certRequest = CertificateRequest::findOrFail($id);
        $statusCode = $request->input('status_code');

        $newStatus = \App\Models\RequestStatus::firstOrCreate(
            ['code' => $statusCode],
            ['label' => ucwords(str_replace('_', ' ', $statusCode))]
        );

        $certRequest->transitionTo($newStatus, auth()->user(), $request->input('note'));

        $certRequest->load(['service', 'status']);
        if ($certRequest->user) {
            $certRequest->user->notify(new \App\Notifications\RequestStatusChanged($certRequest));
        }

        return back()->with('success', 'Status updated.');
    }

    public function alumni()
    {
        $alumni = \App\Models\AlumniVerification::with(['user.course', 'user.major'])->latest()->get()->map(fn($a) => [
            'id' => $a->id,
            'name' => $a->user ? $a->user->first_name . ' ' . $a->user->last_name : 'Unknown',
            'student_id' => $a->user ? $a->user->student_number : 'N/A',
            'course' => $a->user && $a->user->course ? $a->user->course->label : 'N/A',
            'major' => $a->user && $a->user->major ? $a->user->major->label : 'N/A',
            'batch' => $a->user ? $a->user->batch_year : 'N/A',
            'proof' => basename($a->path),
            'proof_url' => asset('storage/' . $a->path), 
            'status' => ucfirst($a->status),
        ]);
        
        $courses = \App\Models\Course::where('is_active', true)->get();

        return \Inertia\Inertia::render('Admin/Alumni', ['alumni' => $alumni, 'courses' => $courses]);
    }

    public function updateAlumni(Request $request, $id)
    {
        $alumni = AlumniVerification::findOrFail($id);
        $alumni->update(['status' => $request->input('status')]);
        return back()->with('success', 'Alumni verification status updated.');
    }

    public function faculty()
    {
        $faculty = \App\Models\Faculty::orderBy('name', 'asc')->get()->map(function ($prof) {
            $startStr = $prof->consultation_time_start;
            $endStr = $prof->consultation_time_end;

            $startObj = $startStr instanceof \Carbon\Carbon ? $startStr : ($startStr ? \Carbon\Carbon::parse($startStr) : null);
            $endObj = $endStr instanceof \Carbon\Carbon ? $endStr : ($endStr ? \Carbon\Carbon::parse($endStr) : null);

            $hours = trim($prof->consultation_days . ' ' . ($startObj ? $startObj->format('g:i A') : '') . ($startObj && $endObj ? ' - ' : '') . ($endObj ? $endObj->format('g:i A') : ''));

            return [
                'id' => $prof->id,
                'name' => $prof->name,
                'department_or_program' => $prof->department_or_program,
                'room_or_location' => $prof->room_or_location,
                'consultation_days' => $prof->consultation_days,
                'consultation_time_start' => $startObj ? $startObj->format('H:i') : '',
                'consultation_time_end' => $endObj ? $endObj->format('H:i') : '',
                'role' => $prof->department_or_program,
                'room' => $prof->room_or_location,
                'hours' => $hours ?: 'No schedule set',
            ];
        });

        return \Inertia\Inertia::render('Admin/Faculty', ['faculty' => $faculty]);
    }

    public function storeFaculty(Request $request)
    {
        Faculty::create($request->validate([
            'name' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
            'consultation_days' => 'required|string|max:255',
            'consultation_time_start' => 'required',
            'consultation_time_end' => 'required',
        ]));
        return back()->with('success', 'Faculty added.');
    }

    public function updateFaculty(Request $request, $id)
    {
        Faculty::findOrFail($id)->update($request->validate([
            'name' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
            'consultation_days' => 'required|string|max:255',
            'consultation_time_start' => 'required',
            'consultation_time_end' => 'required',
        ]));
        return back()->with('success', 'Faculty updated.');
    }

    public function destroyFaculty($id)
    {
        Faculty::findOrFail($id)->delete();
        return back()->with('success', 'Faculty deleted.');
    }

    public function announcements()
    {
        $announcements = Announcement::latest()->get()->map(fn($ann) => [
            'id' => $ann->id,
            'title' => $ann->title,
            'content' => $ann->body,
            'date' => $ann->created_at->format('M d, Y'),
        ]);

        return Inertia::render('Admin/Announcements', ['announcements' => $announcements]);
    }

    public function storeAnnouncement(Request $request)
    {
        Announcement::create([
            'title' => $request->input('title'),
            'body' => $request->input('content'),
            'posted_by' => auth()->id(),
            'published_at' => now(),
        ]);
        return back()->with('success', 'Announcement posted.');
    }

    public function updateAnnouncement(Request $request, $id)
    {
        Announcement::findOrFail($id)->update([
            'title' => $request->input('title'),
            'body' => $request->input('content'),
        ]);
        return back()->with('success', 'Announcement updated.');
    }

    public function destroyAnnouncement($id)
    {
        Announcement::findOrFail($id)->delete();
        return back()->with('success', 'Announcement deleted.');
    }

    public function users()
    {
        $users = User::with(['course', 'major'])
            ->whereIn('user_type', ['student', 'alumni', 'admin'])
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($u) => [
                'id' => $u->id,
                'student_id' => $u->student_number,
                'first_name' => $u->first_name,
                'last_name' => $u->last_name,
                'email' => $u->email,
                'contact_number' => $u->contact_number,
                'user_type' => $u->user_type,
                'course' => $u->course ? $u->course->label : null,
                'course_id' => $u->course_id,
                'major' => $u->major ? $u->major->label : null,
                'major_id' => $u->major_id,
                'year_level' => $u->year_level,
                'batch_year' => $u->batch_year,
            ]);

        $courses = \App\Models\Course::with('majors')->where('is_active', true)->orderBy('sort_order')->get();

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'courses' => $courses
        ]);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'user_type' => 'required|in:student,alumni,admin',
            'student_number' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'major_id' => 'nullable|exists:majors,id',
            'year_level' => 'nullable|integer',
            'batch_year' => 'nullable|integer',
            'contact_number' => 'nullable|string',
            'password' => 'required|string|min:8',
        ]);

        $data['password'] = \Illuminate\Support\Facades\Hash::make($data['password']);

        $user = User::create($data);

        $role = Role::firstOrCreate(['name' => $data['user_type']]);
        $user->assignRole($role);

        return back()->with('success', 'User added successfully.');
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'user_type' => 'required|in:student,alumni,admin',
            'student_number' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'major_id' => 'nullable|exists:majors,id',
            'year_level' => 'nullable|integer',
            'batch_year' => 'nullable|integer',
            'contact_number' => 'nullable|string',
        ]);

        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        $role = Role::firstOrCreate(['name' => $data['user_type']]);
        $user->syncRoles([$role]);

        return back()->with('success', 'User updated successfully in the database.');
    }

    public function destroyUser($id)
    {
        $user = User::withTrashed()->findOrFail($id);
        
        \App\Models\Feedback::where('user_id', $user->id)->delete();
        \App\Models\AlumniVerification::where('user_id', $user->id)->delete();
        
        $inquiries = \App\Models\Inquiry::where('user_id', $user->id)->get();
        foreach($inquiries as $inq) {
            \App\Models\InquiryMessage::where('inquiry_id', $inq->id)->delete();
            $inq->delete();
        }
        
        $requests = \App\Models\CertificateRequest::withTrashed()->where('user_id', $user->id)->get();
        foreach($requests as $req) {
            \App\Models\RequestDocument::where('request_id', $req->id)->delete();
            \App\Models\RequestStatusHistory::where('request_id', $req->id)->delete();
            \App\Models\InternshipRequestDetail::where('request_id', $req->id)->delete();
            $req->forceDelete();
        }

        $user->forceDelete();

        return back()->with('success', 'User completely deleted from the database.');
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

    public function inquiries()
    {
        $inquiries = \App\Models\Inquiry::with(['user', 'messages.user', 'messages.parent.user'])
            ->latest('updated_at')
            ->get()
            ->map(fn($inq) => [
            'id' => $inq->id,
            'student_name' => $inq->user ? $inq->user->first_name . ' ' . $inq->user->last_name : 'Unknown',
            'email' => $inq->user ? $inq->user->email : 'N/A',
            'subject' => $inq->subject,
            'status' => $inq->status,
            'is_read' => $inq->is_read_by_admin,
            'date' => $inq->created_at->format('M d, Y h:i A'),
            'messages' => $inq->messages->map(fn($msg) => [
                'id' => $msg->id,
                'message' => $msg->message,
                'attachment_url' => $msg->attachment_path ? asset('storage/' . $msg->attachment_path) : null,
                'attachment_name' => $msg->attachment_path ? basename($msg->attachment_path) : null,
                'is_edited' => $msg->is_edited,
                'sender_name' => $msg->user ? $msg->user->first_name : 'System',
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

        return Inertia::render('Admin/Inquiries', ['inquiries' => $inquiries]);
    }

    public function replyInquiry(Request $request, $id)
    {
        $data = $request->validate([
            'message' => 'required|string|max:3000',
            'parent_id' => 'nullable|exists:inquiry_messages,id',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,docx|max:10240',
        ]);

        if ($this->containsSpam($data['message'])) {
            return back()->withErrors(['message' => 'Your message contains inappropriate words.']);
        }
        
        $inquiry = \App\Models\Inquiry::with('user')->findOrFail($id);
        
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
            'is_read_by_user' => false,
            'is_read_by_admin' => true,
        ]);

        if ($inquiry->user) {
            $inquiry->user->notify(new \App\Notifications\InquiryReplied($inquiry));
        }

        return back()->with('success', 'Reply sent successfully.');
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

    public function updateInquiryStatus(Request $request, $id)
    {
        $inquiry = \App\Models\Inquiry::findOrFail($id);
        $inquiry->update(['status' => $request->input('status')]);
        return back()->with('success', 'Inquiry status updated.');
    }

    public function markInquiryRead($id): RedirectResponse
    {
        $inquiry = \App\Models\Inquiry::findOrFail($id);
        $inquiry->update(['is_read_by_admin' => true]);
        return back();
    }

    public function markInquiryUnread($id): RedirectResponse
    {
        $inquiry = \App\Models\Inquiry::findOrFail($id);
        $inquiry->update(['is_read_by_admin' => false]);
        return back();
    }

    public function deleteInquiry($id): RedirectResponse
    {
        $inquiry = \App\Models\Inquiry::findOrFail($id);
        $inquiry->delete();
        return back()->with('success', 'Inquiry deleted successfully.');
    }

    // =========================================================================

    public function exportExcel()
    {
        $filename = 'CED_Requests_Report_' . date('Y-m-d') . '.csv';
        $requests = CertificateRequest::with(['user', 'status', 'service'])->latest()->get();

        $headers = [
            "Content-type"        => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma"              => "no-cache",
            "Cache-Control"       => "must-revalidate, post-check=0, pre-check=0",
            "Expires"             => "0"
        ];

        $callback = function () use ($requests) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Tracking ID', 'Student Name', 'Document Type', 'Format', 'Status', 'Date Submitted']);

            foreach ($requests as $r) {
                fputcsv($file, [
                    $r->id,
                    $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown',
                    $r->service ? $r->service->label : 'Document',
                    $r->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
                    $r->status ? $r->status->label : 'Pending',
                    $r->created_at->format('Y-m-d H:i')
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf()
    {
        $requests = CertificateRequest::with(['user', 'status', 'service'])->latest()->get();
        
        $html = '
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>CED Registrar - Requests Report</title>
            <style>
                body { font-family: Arial, sans-serif; color: #1e293b; padding: 30px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
                .header h2 { margin: 0; color: #0f172a; font-size: 22px; }
                .header p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
                th { background-color: #f8fafc; color: #334155; font-weight: bold; text-transform: uppercase; font-size: 11px; }
                td { color: #475569; }
                .footer { margin-top: 30px; text-align: right; font-size: 11px; color: #94a3b8; }
            </style>
        </head>
        <body onload="window.print()">
            <div class="header">
                <h2>College of Education Registrar\'s Office</h2>
                <p>Official Document Requests Report — Generated on <span id="export-date"></span></p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tracking ID</th>
                        <th>Student Name</th>
                        <th>Document Type</th>
                        <th>Format</th>
                        <th>Status</th>
                        <th>Date Submitted</th>
                    </tr>
                </thead>
                <tbody>';

        if ($requests->count() > 0) {
            foreach ($requests as $r) {
                $studentName = $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown';
                $serviceLabel = $r->service ? $r->service->label : 'Document';
                $format = $r->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy';
                $statusLabel = $r->status ? $r->status->label : 'Pending';
                $date = $r->created_at->format('M d, Y');

                $html .= "<tr>
                    <td><strong>#{$r->id}</strong></td>
                    <td>{$studentName}</td>
                    <td>{$serviceLabel}</td>
                    <td>{$format}</td>
                    <td>{$statusLabel}</td>
                    <td>{$date}</td>
                </tr>";
            }
        } else {
            $html .= '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">No requests found.</td></tr>';
        }

        $html .= '</tbody>
            </table>
            <div class="footer">
                <p>CED E-Services System &copy; ' . date('Y') . ' Central Luzon State University</p>
            </div>
            <script>
                document.getElementById("export-date").innerText = new Date().toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                });
            </script>
        </body>
        </html>';

        return response($html);
    }
}