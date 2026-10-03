<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Models\User;
use App\Services\FacultyProfileLinker;
use App\Services\ScheduleExtraction\ScheduleExtractorContract;
use App\Support\ScheduleRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class FacultyController extends Controller
{
    private const PER_PAGE = 10;

    public function loadFaculty(Request $request, FacultyProfileLinker $linker)
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'department' => (string) $request->query('department', 'all'),
        ];

        $paginator = Faculty::query()
            ->with('user:id,profile_picture,email')
            ->select(['id', 'user_id', 'name', 'role', 'department_or_program', 'room_or_location', 'weekly_schedule', 'last_edited_by', 'edited_by_role'])
            ->when($filters['department'] !== 'all', fn ($q) => $q->where('department_or_program', $filters['department']))
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $like = '%'.addcslashes($filters['search'], '%_\\').'%';
                $q->where(fn ($w) => $w
                    ->where('name', 'like', $like)
                    ->orWhere('department_or_program', 'like', $like)
                    ->orWhere('room_or_location', 'like', $like)
                    ->orWhere('weekly_schedule', 'like', $like)); // course and section codes
            })
            ->orderBy('name')
            ->orderBy('id') // tie-breaker so rows never repeat across pages
            ->paginate(self::PER_PAGE)
            ->onEachSide(1)
            ->withQueryString();

        // Deleting the last row of a page leaves it empty, so jump to the new last page.
        if ($paginator->isEmpty() && $paginator->currentPage() > 1) {
            return redirect()->to($request->fullUrlWithQuery(['page' => $paginator->lastPage()]));
        }

        // An unlinked row whose name collides with a schedule that already has an
        // account is the duplicate case the linker refuses to merge on its own, so
        // the admin gets told about it instead of finding out from a faculty member.
        $collisions = $linker->claimedCollisions($paginator->getCollection());

        $paginator->through(fn ($prof) => [
            'id' => $prof->id,
            'user' => $prof->user,
            'name' => $prof->name,
            'role' => $prof->role,
            'department_or_program' => $prof->department_or_program,
            'room_or_location' => $prof->room_or_location,
            'weekly_schedule' => $prof->weekly_schedule,
            'edited_by_role' => $prof->edited_by_role,
            'collision' => $collisions[$prof->id] ?? null,
        ]);

        return Inertia::render('Admin/Faculty', [
            'faculty' => $paginator,
            'filters' => $filters,
            // Lazy: skipped on partial reloads (search, paging) that don't ask for it
            'departments' => fn () => Faculty::query()
                ->whereNotNull('department_or_program')
                ->where('department_or_program', '!=', 'Not specified')
                ->distinct()
                ->orderBy('department_or_program')
                ->pluck('department_or_program'),
        ]);
    }

    public function extractSchedule(Request $request, ScheduleExtractorContract $extractor)
    {
        $request->validate([
            'schedule_files' => ['required', 'array', 'min:1', 'max:5'],
            'schedule_files.*' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:10240'],
        ]);

        try {
            $results = $extractor->extractMany($request->file('schedule_files'));
        } catch (Throwable $e) {
            Log::error('Schedule extraction provider error', ['error' => $e->getMessage()]);

            return response()->json([
                'success' => false,
                'message' => 'The AI scanner is unavailable right now. Please try again shortly or add schedules manually.',
            ], 503);
        }

        return response()->json([
            'success' => true,
            'results' => $results,
        ]);
    }

    private function facultyRules(bool $requireBlocks): array
    {
        return array_merge([
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
        ], ScheduleRules::rules($requireBlocks));
    }

    public function storeFaculty(Request $request, FacultyProfileLinker $linker)
    {
        $data = $request->validate($this->facultyRules(true), ScheduleRules::messages());

        // Uploading the same professor's schedule again has to land on the row
        // that already exists -- linked or not -- not beside it, or the portal
        // ends up showing one copy and the registrar another.
        $faculty = $linker->uniqueMatchForUpload($data['name']);
        $created = $faculty === null;

        if ($created) {
            $faculty = Faculty::create($data);
            $message = 'Faculty added.';
        } else {
            $faculty->update($data);
            $message = 'Faculty schedule updated.';
        }

        // The registrar often uploads a schedule before the professor is given an
        // account. If an account already exists and has nothing of its own, this
        // upload becomes that account's schedule instead of a second copy of it.
        $linker->adoptMatchingAccount($faculty);
        $linker->stamp($faculty, $request->user(), 'admin');

        activity()
            ->causedBy($request->user())
            ->performedOn($faculty)
            ->event($created ? 'created' : 'updated')
            ->log(($created ? 'Uploaded' : 'Re-uploaded').' faculty schedule: '.$faculty->name);

        return back()->with('success', $message);
    }

    public function updateFaculty(Request $request, $id, FacultyProfileLinker $linker)
    {
        $faculty = Faculty::query()->whereKey($id)->sole();

        $faculty->update($request->validate($this->facultyRules(false), ScheduleRules::messages()));
        $linker->stamp($faculty, $request->user(), 'admin');

        activity()
            ->causedBy($request->user())
            ->performedOn($faculty)
            ->event('updated')
            ->log('Updated faculty schedule: '.$faculty->name);

        return back()->with('success', 'Faculty updated.');
    }

    public function destroyFaculty(Request $request, $id)
    {
        $faculty = Faculty::query()->whereKey($id)->sole();
        $name = $faculty->name;
        $faculty->delete();

        activity()
            ->causedBy($request->user())
            ->performedOn($faculty)
            ->event('deleted')
            ->log('Removed faculty schedule: '.$name);

        return back()->with('success', 'Faculty deleted.');
    }

    /**
     * Give a schedule to a specific faculty account, or take it back.
     *
     * Only reachable on the admin side: the automatic path in the linker already
     * covers the ordinary case, and this exists for the rows it deliberately
     * refuses to guess about -- duplicate names and typo'd uploads.
     */
    public function linkAccount(Request $request, FacultyProfileLinker $linker)
    {
        $data = $request->validate([
            'faculty_id' => ['required', 'integer', 'exists:faculty,id'],
            'user_id' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        $faculty = Faculty::query()->whereKey($data['faculty_id'])->sole();

        if ($data['user_id'] === null) {
            $linker->unlink($faculty);

            return back()->with('success', 'Schedule unlinked from its faculty account.');
        }

        $user = User::query()->whereKey($data['user_id'])->sole();

        if ($user->user_type !== 'faculty') {
            return back()->withErrors([
                'user_id' => 'That account is not a faculty account.',
            ]);
        }

        $linker->link($faculty, $user);

        activity()
            ->causedBy($request->user())
            ->performedOn($faculty)
            ->event('linked')
            ->log('Linked faculty schedule to account: '.$user->fullName());

        return back()->with('success', 'Schedule linked to '.$user->fullName().'.');
    }

    /**
     * Faculty accounts with no schedule of their own, for the link picker.
     */
    public function unlinkedAccounts(Request $request)
    {
        $search = trim((string) $request->query('search', ''));

        $accounts = User::query()
            ->where('user_type', 'faculty')
            ->whereDoesntHave('facultyProfile')
            ->when($search !== '', function ($q) use ($search) {
                $like = '%'.addcslashes($search, '%_\\').'%';
                $q->where(fn ($w) => $w
                    ->where('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like)
                    ->orWhere('email', 'like', $like));
            })
            ->orderBy('last_name')
            ->orderBy('first_name')
            ->limit(25)
            ->get(['id', 'first_name', 'last_name', 'email']);

        return response()->json([
            'accounts' => $accounts->map(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->fullName(),
                'email' => $user->email,
            ])->values(),
        ]);
    }
}
