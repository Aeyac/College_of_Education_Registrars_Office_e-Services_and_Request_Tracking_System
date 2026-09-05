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
        // Pass courses to the React view just like the Register Controller
        $courses = Course::with('majors')->orderBy('sort_order')->get();

        return Inertia::render('Auth/CompleteProfile', [
            'courses' => $courses
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_type' => 'required|in:student,alumni',
            'course_id' => 'required|exists:courses,id',
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
    
        // Assign the actual security role so the middleware lets them in
        $user->syncRoles([$request->user_type]);
    
        return redirect()->route('user.dashboard');
    }
}