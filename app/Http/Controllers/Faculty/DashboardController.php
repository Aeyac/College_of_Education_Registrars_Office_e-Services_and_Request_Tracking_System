<?php

namespace App\Http\Controllers\Faculty;

use App\Http\Controllers\Controller;
use App\Services\FacultyProfileLinker;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request, FacultyProfileLinker $linker)
    {
        return Inertia::render('Faculty/Dashboard', [
            'faculty' => $linker->adoptForDisplay($request->user())?->load('user'),
        ]);
    }
}
