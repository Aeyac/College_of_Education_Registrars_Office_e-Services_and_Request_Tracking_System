<?php
namespace App\Http\Controllers;

use App\Models\Announcement;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\RedirectResponse;

class HomeController extends Controller
{
    public function index(): Response|RedirectResponse
    {
        // Session Control: Redirect if already logged in
        if (auth()->check()) {
            return auth()->user()->isAdmin() 
                ? redirect()->route('admin.dashboard') 
                : redirect()->route('user.dashboard');
        }

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