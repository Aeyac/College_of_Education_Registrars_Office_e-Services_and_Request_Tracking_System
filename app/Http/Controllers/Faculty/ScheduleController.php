<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Controller;
use App\Services\ScheduleExtraction\ScheduleExtractorContract;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Faculty/Schedule', [
            'faculty' => $request->user()->facultyProfile,
        ]);
    }

    public function update(Request $request)
    {
        $validated = $request->validate([
            'role' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
            'weekly_schedule' => 'nullable|array',
        ]);

        $request->user()->facultyProfile()->update($validated);

        return back()->with('success', 'Schedule updated successfully.');
    }

    public function extract(Request $request, ScheduleExtractorContract $extractor)
    {
        $request->validate([
            'schedule_files' => ['required', 'array', 'min:1', 'max:1'],
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
}
