<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Services\ScheduleExtraction\ScheduleExtractorContract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class FacultyController extends Controller
{
    public function loadFaculty()
    {
        $faculty = Faculty::orderBy('name', 'asc')->get()->map(function ($prof) {
            return [
                'id' => $prof->id,
                'name' => $prof->name,
                'department_or_program' => $prof->department_or_program,
                'room_or_location' => $prof->room_or_location,
                'weekly_schedule' => $prof->weekly_schedule,
                'current_status' => $prof->current_status,
                'role' => $prof->department_or_program,
                'room' => $prof->room_or_location,
            ];
        });

        return Inertia::render('Admin/Faculty', ['faculty' => $faculty]);
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

    public function storeFaculty(Request $request)
    {
        Faculty::create($request->validate([
            'name' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
            'weekly_schedule' => 'nullable|array',
        ]));

        return back()->with('success', 'Faculty added.');
    }

    public function updateFaculty(Request $request, $id)
    {
        Faculty::findOrFail($id)->update($request->validate([
            'name' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
            'weekly_schedule' => 'nullable|array',
        ]));

        return back()->with('success', 'Faculty updated.');
    }

    public function destroyFaculty($id)
    {
        Faculty::findOrFail($id)->delete();
        return back()->with('success', 'Faculty deleted.');
    }
}