<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\AlumniVerificationStatusMail;
use App\Models\AlumniVerification;
use App\Models\Course;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AlumniController extends Controller
{
    private const PER_PAGE = 10;

    public function loadAlumni(Request $request)
    {
        $sorts = [
            'id' => ['alumni_verifications.id'],
            'name' => ['users.first_name', 'users.last_name'],
            'course' => ['courses.label'],
            'batch' => ['users.batch_year'],
            'status' => ['alumni_verifications.status'],
        ];

        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'status' => $request->query('status', 'pending'),
            'course' => (string) $request->query('course', 'all'),
            'sort' => $request->query('sort', 'id'),
            'direction' => $request->query('direction', 'desc'),
        ];

        if (!in_array($filters['status'], ['all', 'pending', 'verified', 'rejected'], true)) {
            $filters['status'] = 'pending';
        }
        if (!array_key_exists($filters['sort'], $sorts)) {
            $filters['sort'] = 'id';
        }
        if (!in_array($filters['direction'], ['asc', 'desc'], true)) {
            $filters['direction'] = 'desc';
        }

        // Notification redirect: ?open={id}. Reset to a view where the row is guaranteed visible.
        $target = ($openId = $request->integer('open')) ? AlumniVerification::find($openId) : null;
        if ($target) {
            $filters = [
                'search' => '',
                'status' => $target->status,
                'course' => 'all',
                'sort' => 'id',
                'direction' => 'desc',
            ];
        }

        $query = AlumniVerification::query()
            ->select('alumni_verifications.*')
            ->leftJoin('users', 'users.id', '=', 'alumni_verifications.user_id')
            ->leftJoin('courses', 'courses.id', '=', 'users.course_id')
            ->leftJoin('majors', 'majors.id', '=', 'users.major_id')
            ->when($filters['status'] !== 'all', fn($q) => $q->where('alumni_verifications.status', $filters['status']))
            ->when($filters['course'] !== 'all', fn($q) => $q->where('users.course_id', $filters['course']))
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                // Every word must match the first name, last name, major, or ID
                foreach (preg_split('/\s+/', $filters['search']) as $term) {
                    $like = '%' . addcslashes($term, '%_\\') . '%';
                    $q->where(function ($w) use ($like, $term) {
                        $w->where('users.first_name', 'like', $like)
                            ->orWhere('users.last_name', 'like', $like)
                            ->orWhere('majors.label', 'like', $like);
                        if (ctype_digit($term)) {
                            $w->orWhere('alumni_verifications.id', (int) $term);
                        }
                    });
                }
            });

        // Newest first, so the page holding the target is the count of newer rows / per page
        $page = $target
            ? intdiv((clone $query)->where('alumni_verifications.id', '>', $target->id)->count(), self::PER_PAGE) + 1
            : null;

        foreach ($sorts[$filters['sort']] as $column) {
            $query->orderBy($column, $filters['direction']);
        }
        $query->orderByDesc('alumni_verifications.id'); // tie-breaker so rows never repeat across pages

        $paginator = $query
            ->with(['user:id,first_name,last_name,course_id,major_id,batch_year', 'user.course:id,label', 'user.major:id,label'])
            ->paginate(self::PER_PAGE, ['*'], 'page', $page)
            ->onEachSide(1)
            ->appends(array_filter($filters, fn($v) => $v !== ''));

        // Verifying the last row of a page leaves it empty, so jump to the new last page.
        if ($paginator->isEmpty() && $paginator->currentPage() > 1) {
            return redirect()->to($request->fullUrlWithQuery(['page' => $paginator->lastPage()]));
        }

        $paginator->through(fn($a) => [
            'id' => $a->id,
            'name' => $a->user ? $a->user->first_name . ' ' . $a->user->last_name : 'Unknown',
            'course' => $a->user?->course?->label ?? 'N/A',
            'major' => $a->user?->major?->label ?? 'N/A',
            'batch' => $a->user?->batch_year ?? 'N/A',
            'proof' => basename($a->path),
            'proof_url' => route('admin.alumni.proof', $a->id),
            'status' => ucfirst($a->status),
        ]);

        return Inertia::render('Admin/Alumni', [
            'alumni' => $paginator,
            'courses' => Course::where('is_active', true)->orderBy('sort_order')->get(['id', 'label']),
            'filters' => $filters,
            'focus' => $target ? ['id' => $target->id, 'token' => (string) Str::uuid()] : null,
        ]);
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