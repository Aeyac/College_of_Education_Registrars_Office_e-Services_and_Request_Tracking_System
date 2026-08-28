<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FacultyController extends Controller
{
    public function loadFaculty()
    {
        $faculty = Faculty::orderBy('name', 'asc')->get()->map(function ($prof) {
            $startStr = $prof->consultation_time_start;
            $endStr = $prof->consultation_time_end;

            $startObj = $startStr instanceof \Carbon\Carbon ? $startStr : ($startStr ? \Carbon\Carbon::parse($startStr) : null);
            $endObj = $endStr instanceof \Carbon\Carbon ? $endStr : ($endStr ? \Carbon\Carbon::parse($endStr) : null);

            $hours = trim($prof->consultation_days . ' ' . ($startObj ? $startObj->format('g:i A') : '') . ($startObj && $endObj ? ' - ' : '') . ($endObj ? $endObj->format('g:i A') : ''));

            return [
                'id' => $prof->id,
                'name' => $prof->name,
                'department_or_program' => $prof->department_or_program,
                'room_or_location' => $prof->room_or_location,
                'consultation_days' => $prof->consultation_days,
                'consultation_time_start' => $startObj ? $startObj->format('H:i') : '',
                'consultation_time_end' => $endObj ? $endObj->format('H:i') : '',
                'role' => $prof->department_or_program,
                'room' => $prof->room_or_location,
                'hours' => $hours ?: 'No schedule set',
            ];
        });

        return Inertia::render('Admin/Faculty', ['faculty' => $faculty]);
    }

    public function storeFaculty(Request $request)
    {
        Faculty::create($request->validate([
            'name' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
            'consultation_days' => 'required|string|max:255',
            'consultation_time_start' => 'required',
            'consultation_time_end' => 'required',
        ]));
        return back()->with('success', 'Faculty added.');
    }

    public function updateFaculty(Request $request, $id)
    {
        Faculty::findOrFail($id)->update($request->validate([
            'name' => 'required|string|max:255',
            'department_or_program' => 'required|string|max:255',
            'room_or_location' => 'required|string|max:255',
            'consultation_days' => 'required|string|max:255',
            'consultation_time_start' => 'required',
            'consultation_time_end' => 'required',
        ]));
        return back()->with('success', 'Faculty updated.');
    }

    public function destroyFaculty($id)
    {
        Faculty::findOrFail($id)->delete();
        return back()->with('success', 'Faculty deleted.');
    }
}
