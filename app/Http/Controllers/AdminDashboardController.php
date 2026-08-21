<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\DocumentRequest;
use App\Models\AlumniVerification;
use App\Models\Inquiry;

class AdminDashboardController extends Controller
{
    public function index()
    {
        // 1. Fetch real-time requests from the database
        $requests = DocumentRequest::orderBy('created_at', 'desc')->get();
        
        // 2. Fetch real-time analytics/stats for the top cards
        $stats = [
            'pending' => DocumentRequest::where('status', 'Pending Review')->count(),
            'alumni' => AlumniVerification::where('status', 'Pending')->count(),
            'inquiries' => Inquiry::where('status', 'Unread')->count(),
        ];

        // 3. Send the data as props to your React component
        return Inertia::render('Admin/Dashboard', [
            'requests' => $requests,
            'stats' => $stats
        ]);
    }
}

?>