<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use App\Models\Faq;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

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
            ->map(fn ($ann) => [
                'id' => $ann->id,
                'title' => $ann->title,
                'content' => $ann->body,
                'attachments' => $ann->attachments,
                'date' => $ann->created_at->format('F d, Y'),
            ]);

        return Inertia::render('Welcome', [
            'announcements' => $announcements,
            'faqs' => Faq::orderBy('sort_order')->get(),

        ]);
    }
}
