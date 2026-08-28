<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlumniController extends Controller
{
    public function loadAlumni()
    {
        $alumni = AlumniVerification::with(['user.course', 'user.major'])->latest()->get()->map(fn($a) => [
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
        
        $courses = Course::where('is_active', true)->get();

        return Inertia::render('Admin/Alumni', ['alumni' => $alumni, 'courses' => $courses]);
    }

    public function updateAlumni(Request $request, $id)
    {
        $alumni = AlumniVerification::findOrFail($id);
        $alumni->update(['status' => $request->input('status')]);
        return back()->with('success', 'Alumni verification status updated.');
    }
}
