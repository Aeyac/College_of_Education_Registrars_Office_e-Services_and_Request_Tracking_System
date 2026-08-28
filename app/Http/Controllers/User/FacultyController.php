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