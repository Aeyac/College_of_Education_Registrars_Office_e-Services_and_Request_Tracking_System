<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use App\Notifications\AnnouncementPosted;
use App\Services\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function loadAnnouncements()
    {
        $announcements = Announcement::latest()->get()->map(fn ($ann) => [
            'id' => $ann->id,
            'title' => $ann->title,
            'content' => $ann->body,
            'date' => $ann->created_at->format('M d, Y'),
        ]);

        return Inertia::render('Admin/Announcements', ['announcements' => $announcements]);
    }

    public function storeAnnouncement(Request $request, HtmlSanitizer $sanitizer)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:65535'],
        ]);

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'body' => $sanitizer->clean($validated['content']),
            'posted_by' => auth()->id(),
            'published_at' => now(),
        ]);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($announcement)
            ->event('created')
            ->log('Posted an announcement: '.$announcement->title);

        User::whereIn('user_type', ['student', 'alumni'])
            ->chunkById(200, fn ($users) => Notification::send($users, new AnnouncementPosted($announcement)));

        return back()->with('success', 'Announcement posted.');
    }

    public function updateAnnouncement(Request $request, $id, HtmlSanitizer $sanitizer)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:65535'],
        ]);

        $announcement = Announcement::findOrFail($id);
        $announcement->update([
            'title' => $validated['title'],
            'body' => $sanitizer->clean($validated['content']),
        ]);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($announcement)
            ->event('updated')
            ->log('Updated an announcement: '.$announcement->title);

        return back()->with('success', 'Announcement updated.');
    }

    public function destroyAnnouncement($id)
    {
        $announcement = Announcement::findOrFail($id);
        $title = $announcement->title;
        $announcement->delete();

        activity()
            ->causedBy(auth()->user())
            ->event('deleted')
            ->log('Deleted an announcement: '.$title);

        return back()->with('success', 'Announcement deleted.');
    }
}
