<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Controller;
use App\Services\FacultyProfileLinker;
use App\Services\ScheduleExtraction\ScheduleExtractorContract;
use App\Support\ScheduleRules;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Throwable;

class ScheduleController extends Controller
{
    public function index(Request $request, FacultyProfileLinker $linker)
    {
        $user = $request->user();

        // An account can reach this page before it owns a row -- the registrar
        // may have uploaded its schedule without linking it yet. Adopting that
        // upload here is what puts the registrar's copy on the professor's screen
        // without anyone re-uploading anything.
        return Inertia::render('Faculty/Schedule', [
            'faculty' => $linker->adoptForDisplay($user)?->load('user'),
        ]);
    }

    public function update(Request $request, FacultyProfileLinker $linker)
    {
        $validated = $request->validate(array_merge([
            'role' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
        ], ScheduleRules::rules(false)), ScheduleRules::messages());

        $user = $request->user();

        // The same row the registrar edits, so a save here shows up in the admin
        // listing and a save there shows up on this page.
        $faculty = $linker->resolve($user);

        $this->authorize('update', $faculty);

        // update() rather than a create, so the array cast on weekly_schedule is
        // applied and the row keeps the name the registrar gave it.
        $faculty->update($validated);

        $linker->stamp($faculty, $user, 'faculty');

        activity()
            ->causedBy($user)
            ->performedOn($faculty)
            ->event('updated')
            ->log('Updated own faculty schedule');

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
