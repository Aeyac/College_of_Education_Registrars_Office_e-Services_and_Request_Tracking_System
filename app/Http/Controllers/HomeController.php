<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Display the landing page with dynamic data.
     */
    public function index(): Response
    {
        // Fetch up to 3 of the latest active announcements
        $announcements = Announcement::current()
            ->latest()
            ->take(3)
            ->get()
            ->map(fn($ann) => [
                'id' => $ann->id,
                'title' => $ann->title,
                'content' => $ann->body,
                'date' => $ann->created_at->format('F d, Y'),
            ]);

        return Inertia::render('Welcome', [
            'announcements' => $announcements,
        ]);
    }
}