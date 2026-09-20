<?php

namespace App\Http\Controllers\Admin;
use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\Course;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;
use App\Mail\AlumniVerificationStatusMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\Rule;

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
            'proof_url' => route('admin.alumni.proof', $a->id),
            'status' => ucfirst($a->status),
        ]);

        $courses = Course::where('is_active', true)->get();

        return Inertia::render('Admin/Alumni', ['alumni' => $alumni, 'courses' => $courses]);
    }

    public function updateAlumni(Request $request, $id)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'verified', 'rejected'])],
        ]);

        $alumni = AlumniVerification::with('user')->findOrFail($id);

        $alumni->status = $validated['status'];
        $statusChanged = $alumni->isDirty('status');
        $alumni->save();

        if (
            $statusChanged
            && in_array($alumni->status, ['verified', 'rejected'])
            && $alumni->user?->email
        ) {
            try {
                Mail::to($alumni->user->email)->send(new AlumniVerificationStatusMail($alumni));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return back()->with('success', 'Alumni verification status updated.');
    }

    public function viewProof($id)
    {
        $alumni = AlumniVerification::findOrFail($id);

        if (!Storage::disk('private')->exists($alumni->path)) {
            abort(404);
        }

        return Storage::disk('private')
            ->response($alumni->path);
    }
}
