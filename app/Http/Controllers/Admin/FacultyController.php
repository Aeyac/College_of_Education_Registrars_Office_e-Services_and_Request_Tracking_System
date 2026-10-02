<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Services\ScheduleExtraction\ScheduleExtractorContract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;
use App\Support\ScheduleRules;

class FacultyController extends Controller
{
    private const PER_PAGE = 10;

    public function loadFaculty(Request $request)
    {
        $filters = [
            'search' => trim((string) $request->query('search', '')),
            'department' => (string) $request->query('department', 'all'),
        ];

        $paginator = Faculty::query()
            ->with('user:id,profile_picture')
            ->select(['id', 'user_id', 'name', 'role', 'department_or_program', 'room_or_location', 'weekly_schedule'])
            ->when($filters['department'] !== 'all', fn($q) => $q->where('department_or_program', $filters['department']))
            ->when($filters['search'] !== '', function ($q) use ($filters) {
                $like = '%' . addcslashes($filters['search'], '%_\\') . '%';
                $q->where(fn($w) => $w
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

        $paginator->through(fn($prof) => [
            'id' => $prof->id,
            'user' => $prof->user,
            'name' => $prof->name,
            'role' => $prof->role,
            'department_or_program' => $prof->department_or_program,
            'room_or_location' => $prof->room_or_location,
            'weekly_schedule' => $prof->weekly_schedule,
        ]);

        return Inertia::render('Admin/Faculty', [
            'faculty' => $paginator,
            'filters' => $filters,
            // Lazy: skipped on partial reloads (search, paging) that don't ask for it
            'departments' => fn() => Faculty::query()
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

    public function storeFaculty(Request $request)
    {
        Faculty::create($request->validate($this->facultyRules(true), ScheduleRules::messages()));

        return back()->with('success', 'Faculty added.');
    }

    public function updateFaculty(Request $request, $id)
    {
        Faculty::findOrFail($id)->update(
            $request->validate($this->facultyRules(false), ScheduleRules::messages())
        );

        return back()->with('success', 'Faculty updated.');
    }

    public function destroyFaculty($id)
    {
        Faculty::findOrFail($id)->delete();
        return back()->with('success', 'Faculty deleted.');
    }
}