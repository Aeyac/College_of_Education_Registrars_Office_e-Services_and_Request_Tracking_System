<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use App\Services\ScheduleExtractorService;
use Illuminate\Http\Request;
use Inertia\Inertia;

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
                'consultation_days' => $prof->consultation_days,
                'consultation_time_start' => $prof->consultation_time_start ? \Carbon\Carbon::parse($prof->consultation_time_start)->format('H:i') : '',
                'consultation_time_end' => $prof->consultation_time_end ? \Carbon\Carbon::parse($prof->consultation_time_end)->format('H:i') : '',
                'weekly_schedule' => $prof->weekly_schedule,
                'current_status' => $prof->current_status,
                'role' => $prof->department_or_program,
                'room' => $prof->room_or_location,
                'hours' => $prof->formattedConsultationHours(),
            ];
        });

        return Inertia::render('Admin/Faculty', ['faculty' => $faculty]);
    }

    public function extractSchedule(Request $request, ScheduleExtractorService $extractor)
    {
        $request->validate([
            'schedule_file' => 'required|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        try {
            $extractedData = $extractor->extract($request->file('schedule_file'));
            return response()->json(['success' => true, 'data' => $extractedData]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Extraction failed: ' . $e->getMessage()], 500);
        }
    }

    public function storeFaculty(Request $request)
    {
        Faculty::create($request->validate([
            'name' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
            'consultation_days' => 'nullable|string|max:255',
            'consultation_time_start' => 'nullable',
            'consultation_time_end' => 'nullable',
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
            'consultation_days' => 'nullable|string|max:255',
            'consultation_time_start' => 'nullable',
            'consultation_time_end' => 'nullable',
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