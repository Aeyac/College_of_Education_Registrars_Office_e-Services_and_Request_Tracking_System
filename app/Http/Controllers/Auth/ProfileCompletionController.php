<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\Course;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProfileCompletionController extends Controller
{
    public function create()
    {
        $user = auth()->user();
        if ($user->user_type) {
            if ($user->user_type === 'admin') {
                return Inertia::location(route('admin.dashboard'));
            } elseif ($user->user_type === 'faculty') {
                return Inertia::location(route('faculty.dashboard'));
            }
            return Inertia::location(route('user.dashboard'));
        }

        // Pass courses to the React view just like the Register Controller
        $courses = Course::with('majors')->orderBy('sort_order')->get();

        return Inertia::render('Auth/CompleteProfile', [
            'courses' => $courses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_type' => 'required|in:student,alumni,faculty',
            'course_id' => 'required_unless:user_type,faculty|nullable|exists:courses,id',
            'student_number' => 'required_if:user_type,student',
            'year_level' => 'required_if:user_type,student',
            'batch_year' => 'required_if:user_type,alumni',
            'password' => ['required', 'confirmed', \Illuminate\Validation\Rules\Password::defaults()],
        ]);
    
        $user = auth()->user();
        
        $user->update([
            'user_type' => $request->user_type,
            'student_number' => $request->student_number,
            'course_id' => $request->course_id,
            'major_id' => $request->major_id,
            'year_level' => $request->year_level,
            'batch_year' => $request->batch_year,
            'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        ]);
    
        if ($request->user_type === 'faculty' && !$user->facultyProfile) {
            $user->facultyProfile()->create([
                'name' => trim($user->first_name . ' ' . $user->last_name),
                'role' => 'Not specified',
                'department_or_program' => 'Not specified',
                'room_or_location' => 'Not specified',
                'weekly_schedule' => [],
            ]);
        }

        // Assign the actual security role so the middleware lets them in
        $user->syncRoles([$request->user_type]);
    
        if ($request->user_type === 'faculty') {
            return Inertia::location(route('faculty.dashboard'));
        }
        
        return Inertia::location(route('user.dashboard'));
    }
}