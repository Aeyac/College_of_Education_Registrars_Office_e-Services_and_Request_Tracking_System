<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\Course;
use App\Models\Feedback;
use App\Models\Inquiry;
use App\Models\InternshipRequestDetail;
use App\Models\RequestDocument;
use App\Models\RequestStatus;
use App\Models\RequestStatusHistory;
use App\Models\User;
use App\Notifications\RequestStatusChanged;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    public function loadUsers()
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

        $courses = Course::with('majors')->where('is_active', true)->orderBy('sort_order')->get();

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

        $data['password'] = Hash::make($data['password']);

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
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        $role = Role::firstOrCreate(['name' => $data['user_type']]);
        $user->syncRoles([$role]);

        return back()->with('success', 'User updated successfully in the database.');
    }

    // currently in used
    public function destroyUser($id)
    {
        $user = User::findOrFail($id);
        $user->delete(); // soft delete only / records remains 
        return back()->with('success', 'User account deactivated.');
    }



    // not yet used
    public function permanentlyDeleteUser($id)
    {
        DB::transaction(function () use ($id) {
            $user = User::withTrashed()->findOrFail($id);

            Feedback::where('user_id', $user->id)->delete();
            AlumniVerification::where('user_id', $user->id)->delete();

            $inquiries = Inquiry::where('user_id', $user->id)->get();
            foreach ($inquiries as $inq) {
                \App\Models\InquiryMessage::where('inquiry_id', $inq->id)->delete();
                $inq->delete();
            }

            $requests = CertificateRequest::withTrashed()->where('user_id', $user->id)->get();
            foreach ($requests as $req) {
                RequestDocument::where('request_id', $req->id)->delete();
                RequestStatusHistory::where('request_id', $req->id)->delete();
                InternshipRequestDetail::where('request_id', $req->id)->delete();
                $req->forceDelete();
            }
            $user->forceDelete();
        });

        return back()->with('success', 'User permanently erased.');
    }
}
