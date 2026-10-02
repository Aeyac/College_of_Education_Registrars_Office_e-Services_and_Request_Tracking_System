<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\Course;
use App\Models\Feedback;
use App\Models\Inquiry;
use App\Models\InquiryMessage;
use App\Models\InternshipRequestDetail;
use App\Models\RequestDocument;
use App\Models\RequestStatusHistory;
use App\Models\User;
use App\Rules\ValidatesUserAccount;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UserController extends Controller
{
    // Same rules the public registration page applies.
    use ValidatesUserAccount;

    private const PER_PAGE = 15;

    // Whitelist: the sort key comes from the URL, so never trust it directly
    private const SORTS = ['student_id', 'name', 'user_type', 'course'];

    public function loadUsers(Request $request)
    {
        $q = trim((string) $request->query('q', ''));

        $type = in_array($request->query('type'), ['student', 'alumni', 'admin', 'faculty'], true)
            ? $request->query('type')
            : 'all';

        $course = ctype_digit((string) $request->query('course', ''))
            ? (string) $request->query('course')
            : 'all';

        $sort = in_array($request->query('sort'), self::SORTS, true) ? $request->query('sort') : 'name';
        $dir = $request->query('dir') === 'desc' ? 'desc' : 'asc';

        // Deactivated accounts are soft deleted, so the admin list simply switches scope
        $showingDeactivated = $request->boolean('deactivated');

        $query = ($showingDeactivated ? User::onlyTrashed() : User::query())
            ->with(['course:id,label', 'major:id,label'])
            ->whereIn('user_type', ['student', 'alumni', 'admin', 'faculty']);

        if ($q !== '') {
            $like = '%'.addcslashes($q, '\\%_').'%';

            $query->where(function ($w) use ($like) {
                $w->where('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$like])
                    ->orWhere('student_number', 'like', $like)
                    ->orWhere('email', 'like', $like)
                    ->orWhereHas('course', fn ($c) => $c->where('label', 'like', $like))
                    ->orWhereHas('major', fn ($m) => $m->where('label', 'like', $like));
            });
        }

        if ($type !== 'all') {
            $query->where('user_type', $type);
        }

        if ($course !== 'all') {
            $query->where('course_id', (int) $course);
        }

        switch ($sort) {
            case 'student_id':
                $query->orderBy('student_number', $dir);
                break;
            case 'user_type':
                $query->orderBy('user_type', $dir);
                break;
            case 'course':
                $query->orderBy(
                    Course::select('label')->whereColumn('courses.id', 'users.course_id'),
                    $dir
                );
                break;
            default:
                $query->orderBy('last_name', $dir)->orderBy('first_name', $dir);
        }

        // Stable tiebreaker so rows don't jump between pages
        $query->orderByDesc('id');

        $users = $query->paginate(self::PER_PAGE)->withQueryString();

        // After deleting the last row on a page, go to the last valid page
        if ($users->isEmpty() && $users->currentPage() > 1) {
            return redirect()->to(
                $request->url().'?'.http_build_query(array_merge($request->query(), ['page' => $users->lastPage()]))
            );
        }

        $users->through(fn ($u) => [
            'id' => $u->id,
            'student_id' => $u->student_number,
            'first_name' => $u->first_name,
            'last_name' => $u->last_name,
            'email' => $u->email,
            'contact_number' => $u->contact_number,
            'user_type' => $u->user_type,
            'course' => $u->course?->label,
            'course_id' => $u->course_id,
            'major' => $u->major?->label,
            'major_id' => $u->major_id,
            'year_level' => $u->year_level,
            'batch_year' => $u->batch_year,
            'deactivated_at' => $u->deleted_at?->toDayDateTimeString(),
        ]);

        return Inertia::render('Admin/UserManagement', [
            'users' => $users,
            'courses' => fn () => Course::with('majors')->where('is_active', true)->orderBy('sort_order')->get(),
            'filters' => [
                'q' => $q,
                'type' => $type,
                'course' => $course,
                'sort' => $sort,
                'dir' => $dir,
                'deactivated' => $showingDeactivated,
            ],
        ]);
    }

    public function storeUser(Request $request)
    {
        $this->normalizeEmail($request);

        // Identical to public registration, except an admin may also create an
        // admin account, and the admin vouches for the alumni proof themselves.
        $data = $request->validate(
            $this->accountRules($request, ['admin'], requireProof: false),
            $this->accountMessages()
        );

        $isStudent = $data['user_type'] === 'student';
        $isAlumni = $data['user_type'] === 'alumni';

        DB::transaction(function () use ($data, $request, $isStudent, $isAlumni) {
            $user = User::create([
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'user_type' => $data['user_type'],
                'student_number' => $isStudent ? $data['student_number'] : null,
                'year_level' => $isStudent
                    ? $this->yearLevelFromStudentNumber($data['student_number'])
                    : null,
                'batch_year' => $isStudent ? null : ($data['batch_year'] ?? null),
                'course_id' => $data['course_id'] ?? null,
                'major_id' => $data['major_id'] ?? null,
                'contact_number' => $data['contact_number'],
                'password' => Hash::make($data['password']),
            ]);

            if ($data['user_type'] === 'faculty') {
                $user->facultyProfile()->create([
                    'name' => trim($data['first_name'].' '.$data['last_name']),
                    'role' => 'Not specified',
                    'department_or_program' => 'Not specified',
                    'room_or_location' => 'Not specified',
                    'weekly_schedule' => [],
                ]);
            }

            if ($isAlumni) {
                // No proof is collected here, so the admin's own action is the
                // attestation and the account is usable straight away.
                AlumniVerification::create([
                    'user_id' => $user->id,
                    'document_type' => null,
                    'path' => null,
                    'verified_by' => $request->user()?->id,
                    'verified_at' => now(),
                    'status' => 'verified',
                ]);
            }

            $role = Role::firstOrCreate(['name' => $data['user_type']]);
            $user->assignRole($role);
        });

        return back()->with('success', 'User added successfully.');
    }

    public function updateUser(Request $request, $id)
    {
        $user = User::findOrFail($id);

        $this->normalizeEmail($request);

        // The same rules as adding a user, except the account keeps its own
        // email/student number and the password may be left untouched.
        $data = $request->validate(
            $this->accountRules($request, ['admin'], requireProof: false, ignoreUserId: $user->id, requirePassword: false),
            $this->accountMessages()
        );

        $isStudent = $data['user_type'] === 'student';
        $isAlumni = $data['user_type'] === 'alumni';

        DB::transaction(function () use ($data, $request, $user, $isStudent, $isAlumni) {
            $payload = [
                'first_name' => $data['first_name'],
                'last_name' => $data['last_name'],
                'email' => $data['email'],
                'user_type' => $data['user_type'],
                'student_number' => $isStudent ? $data['student_number'] : null,
                'year_level' => $isStudent
                    ? $this->yearLevelFromStudentNumber($data['student_number'])
                    : null,
                'batch_year' => $isStudent ? null : ($data['batch_year'] ?? null),
                'course_id' => $data['course_id'] ?? null,
                'major_id' => $data['major_id'] ?? null,
                'contact_number' => $data['contact_number'],
            ];

            if ($request->filled('password')) {
                $payload['password'] = Hash::make($data['password']);
            }

            $user->update($payload);

            if ($data['user_type'] === 'faculty' && ! $user->facultyProfile) {
                $user->facultyProfile()->create([
                    'name' => trim($data['first_name'].' '.$data['last_name']),
                    'role' => 'Not specified',
                    'department_or_program' => 'Not specified',
                    'room_or_location' => 'Not specified',
                    'weekly_schedule' => [],
                ]);
            }

            // Turning an account into an alumni would otherwise leave it stuck
            // behind the verified.alumni gate with no proof to review.
            if ($isAlumni && ! $user->alumniVerification()->exists()) {
                $user->alumniVerification()->create([
                    'document_type' => null,
                    'path' => null,
                    'verified_by' => $request->user()?->id,
                    'verified_at' => now(),
                    'status' => 'verified',
                ]);
            }

            $role = Role::firstOrCreate(['name' => $data['user_type']]);
            $user->syncRoles([$role]);
        });

        return back()->with('success', 'User updated successfully in the database.');
    }

    // currently in used
    public function destroyUser($id)
    {
        // Stops an admin from locking themselves out
        if ((int) $id === (int) auth()->id()) {
            return back()->withErrors(['delete' => 'You cannot deactivate your own account.']);
        }

        $user = User::findOrFail($id);

        // Stops the last remaining admin from locking everyone out of user management
        if ($user->isAdmin() && ! User::where('user_type', 'admin')->where('id', '!=', $user->id)->exists()) {
            return back()->withErrors(['delete' => 'You cannot deactivate the last active admin account.']);
        }

        $user->delete(); // soft delete only / records remains

        return back()->with('success', 'User account deactivated.');
    }

    public function restoreUser($id)
    {
        // Roles and all related records are untouched, so restoring re-grants access
        $user = User::onlyTrashed()->findOrFail($id);
        $user->restore();

        return back()->with('success', 'User account reactivated.');
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
                InquiryMessage::where('inquiry_id', $inq->id)->delete();
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
