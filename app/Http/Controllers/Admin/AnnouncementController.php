<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function loadAnnouncements()
    {
        $announcements = Announcement::latest()->get()->map(fn($ann) => [
            'id' => $ann->id,
            'title' => $ann->title,
            'content' => $ann->body,
            'date' => $ann->created_at->format('M d, Y'),
        ]);

        return Inertia::render('Admin/Announcements', ['announcements' => $announcements]);
    }

    public function storeAnnouncement(Request $request)
    {
        Announcement::create([
            'title' => $request->input('title'),
            'body' => $request->input('content'),
            'posted_by' => auth()->id(),
            'published_at' => now(),
        ]);
        return back()->with('success', 'Announcement posted.');
    }

    public function updateAnnouncement(Request $request, $id)
    {
        Announcement::findOrFail($id)->update([
            'title' => $request->input('title'),
            'body' => $request->input('content'),
        ]);
        return back()->with('success', 'Announcement updated.');
    }

    public function destroyAnnouncement($id)
    {
        Announcement::findOrFail($id)->delete();
        return back()->with('success', 'Announcement deleted.');
    }
}
