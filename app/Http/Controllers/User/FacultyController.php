<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Inertia\Inertia;
use Inertia\Response;

class FacultyController extends Controller
{
    public function index(): Response
    {
        $this->authorize('viewAny', Faculty::class);

        $faculty = Faculty::where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Faculty $prof) => [
                'id' => $prof->id,
                'name' => $prof->name,
                'department_or_program' => $prof->department_or_program,
                'room_or_location' => $prof->room_or_location,
                'consultation_days' => $prof->consultation_days,
                'consultation_time_start' => $prof->consultation_time_start,
                'consultation_time_end' => $prof->consultation_time_end,
                'weekly_schedule' => $prof->weekly_schedule,
                'current_status' => $prof->current_status,
                'role' => $prof->department_or_program,
                'room' => $prof->room_or_location,
                'hours' => $prof->formattedConsultationHours(),
            ]);

        return Inertia::render('User/Faculty', [
            'userRole' => auth()->user()->displaySubtitle(),
            'faculty' => $faculty,
        ]);
    }
}