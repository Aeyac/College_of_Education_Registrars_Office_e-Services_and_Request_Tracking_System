<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\User;
use App\Models\CertificateRequest;
use App\Models\AlumniVerification;
use App\Models\Faculty; 
use App\Models\Announcement; 
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class AdminDashboardController extends Controller
{
    // --- 1. DASHBOARD OVERVIEW ---
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

    // --- 2. REQUESTS ---
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
        
        // Auto-create the new status if the database table is empty to prevent FK crash
        $statusCode = $request->input('status_code');
        $newStatus = \App\Models\RequestStatus::firstOrCreate(
            ['code' => $statusCode],
            ['label' => ucwords(str_replace('_', ' ', $statusCode))]
        );
         
        $certRequest->transitionTo($newStatus, auth()->user(), $request->input('note'));
        return back()->with('success', 'Status updated.');
    }

    // --- 3. ALUMNI VERIFICATIONS ---
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

    // --- 4. FACULTY SCHEDULES ---
    public function faculty()
    {
        $faculty = Faculty::orderBy('name', 'asc')->get()->map(function ($prof) {
            
            // Failsafe time parsing to prevent Carbon crashes
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
                'consultation_time_start' => $inputStart, // Sends safe HH:MM back to React form
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

    // --- 5. ANNOUNCEMENTS ---
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

    // --- 6. USER MANAGEMENT ---
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
}