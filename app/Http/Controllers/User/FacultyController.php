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

        $faculty = Faculty::with('user:id,profile_picture')
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Faculty $prof) => [
                'id' => $prof->id,
                'user' => $prof->user,
                'name' => $prof->name,
                'department_or_program' => $prof->department_or_program,
                'room_or_location' => $prof->room_or_location,
                'weekly_schedule' => $prof->weekly_schedule,
                'current_status' => $prof->current_status,
                'role' => $prof->role,
                'room' => $prof->room_or_location,
                'hours' => $prof->formattedConsultationHours(),
            ]);

        return Inertia::render('User/Faculty', [
            'userRole' => auth()->user()->displaySubtitle(),
            'faculty' => $faculty,
        ]);
    }
}