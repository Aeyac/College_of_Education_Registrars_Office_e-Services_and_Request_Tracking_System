<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function loadDashboard()
    {
        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'pending' => CertificateRequest::whereHas('status', fn($q) => $q->whereIn('code', ['submitted', 'for_review', 'processing', 'for_compliance']))->count(),
                'alumni' => AlumniVerification::where('status', 'pending')->count(),
                'users' => User::whereIn('user_type', ['student', 'alumni', 'admin'])->count(),
            ]
        ]);

        
    }
}
