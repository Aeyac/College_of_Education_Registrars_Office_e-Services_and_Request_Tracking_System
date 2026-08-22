<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\CertificateRequest;
use App\Models\AlumniVerification;
use App\Models\Faculty;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse; // Added for the return type

class AdminDashboardController extends Controller
{
    public function dashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending' => CertificateRequest::whereHas('status', fn($q) => $q->whereIn('code', ['submitted', 'for_review', 'processing', 'for_compliance']))->count(),
                'alumni' => AlumniVerification::where('status', 'pending')->count(),
                'users' => User::whereIn('user_type', ['student', 'alumni'])->count(),
            ]
        ]);
    }

    // 🔥 ADDED: Mark admin notifications as read
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

        // TRIGGER NOTIFICATION TO USER
        $certRequest->load(['service', 'status']);
        if ($certRequest->user) {
            $certRequest->user->notify(new \App\Notifications\RequestStatusChanged($certRequest));
        }

        return back()->with('success', 'Status updated.');
    }

    public function alumni()
    {
        $alumni = AlumniVerification::with('user')->latest()->get()->map(fn($a) => [
            'id' => $a->id,
            'name' => $a->user ? $a->user->first_name . ' ' . $a->user->last_name : 'Unknown',
            'batch' => $a->user ? $a->user->batch_year : 'N/A',
            'proof' => basename($a->path),
            'status' => ucfirst($a->status),
        ]);

        return Inertia::render('Admin/Alumni', ['alumni' => $alumni]);
    }

    public function updateAlumni(Request $request, $id)
    {
        $verification = AlumniVerification::findOrFail($id);
        $verification->update([
            'status' => $request->input('status'),
            'verified_by' => auth()->id(),
            'verified_at' => now(),
        ]);

        return back()->with('success', 'Alumni verification updated.');
    }

    public function faculty()
    {
        $faculty = Faculty::orderBy('name', 'asc')->get()->map(function ($prof) {
            $startStr = $prof->consultation_time_start;
            $endStr = $prof->consultation_time_end;
            
            $startObj = $startStr instanceof \Carbon\Carbon ? $startStr : ($startStr ? \Carbon\Carbon::parse($startStr) : null);
            $endObj = $endStr instanceof \Carbon\Carbon ? $endStr : ($endStr ? \Carbon\Carbon::parse($endStr) : null);

            $formattedStart = $startObj ? $startObj->format('g:i A') : '';
            $formattedEnd = $endObj ? $endObj->format('g:i A') : '';
            
            $inputStart = $startObj ? $startObj->format('H:i') : '';
            $inputEnd = $endObj ? $endObj->format('H:i') : '';

            $hours = trim($prof->consultation_days . ' ' . $formattedStart . ($formattedStart && $formattedEnd ? ' - ' : '') . $formattedEnd);

            return [
                'id' => $prof->id,
                'name' => $prof->name,
                'department_or_program' => $prof->department_or_program,
                'room_or_location' => $prof->room_or_location,
                'consultation_days' => $prof->consultation_days,
                'consultation_time_start' => $inputStart, 
                'consultation_time_end' => $inputEnd,
                'role' => $prof->department_or_program,
                'room' => $prof->room_or_location,
                'hours' => $hours ?: 'No schedule set',
            ];
        });
        
        return Inertia::render('Admin/Faculty', ['faculty' => $faculty]);
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
            ->whereIn('user_type', ['student', 'alumni'])
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
            'user_type' => 'required|in:student,alumni',
            'student_number' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'major_id' => 'nullable|exists:majors,id',
            'year_level' => 'nullable|integer',
            'batch_year' => 'nullable|integer',
            'contact_number' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        $data['password'] = \Illuminate\Support\Facades\Hash::make($data['password']);
        User::create($data);

        return back()->with('success', 'User added successfully.');
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);
        
        $data = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$id,
            'user_type' => 'required|in:student,alumni',
            'student_number' => 'nullable|string',
            'course_id' => 'nullable|exists:courses,id',
            'major_id' => 'nullable|exists:majors,id',
            'year_level' => 'nullable|integer',
            'batch_year' => 'nullable|integer',
            'contact_number' => 'required|string',
        ]);

        if ($request->filled('password')) {
            $data['password'] = \Illuminate\Support\Facades\Hash::make($request->password);
        }

        $user->update($data);

        return back()->with('success', 'User updated successfully.');
    }

    public function destroyUser($id)
    {
        User::findOrFail($id)->delete();
        return back()->with('success', 'User suspended.');
    }

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

        $callback = function() use ($requests) {
            $file = fopen('php://output', 'w');
            // CSV Header
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
                // Dynamically sets the export date to today\'s exact local date
                document.getElementById("export-date").innerText = new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });
            </script>
        </body>
        </html>';

        return response($html);
    }
}