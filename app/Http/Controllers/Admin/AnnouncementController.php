<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Notifications\AnnouncementPosted;
use Illuminate\Support\Facades\Notification;

class AnnouncementController extends Controller
{
    public function loadAnnouncements()
    {
        $announcements = Announcement::latest()->get()->map(fn($ann) => [
            'id' => $ann->id,
            'title' => $ann->title,
            'content' => $ann->body,
            'attachments' => $ann->attachments,
            'date' => $ann->created_at->format('M d, Y'),
        ]);

        return Inertia::render('Admin/Announcements', ['announcements' => $announcements]);
    }

    public function storeAnnouncement(Request $request)
    {
        $attachments = [];
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('announcements', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getClientMimeType(),
                ];
            }
        }

        $announcement = Announcement::create([
            'title' => $request->input('title'),
            'body' => $request->input('content'),
            'attachments' => empty($attachments) ? null : $attachments,
            'posted_by' => auth()->id(),
            'published_at' => now(),
        ]);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($announcement)
            ->event('created')
            ->log('Posted an announcement: ' . $announcement->title);

        User::whereIn('user_type', ['student', 'alumni'])
            ->chunkById(200, fn($users) => Notification::send($users, new AnnouncementPosted($announcement)));

        return back()->with('success', 'Announcement posted.');
    }

    public function updateAnnouncement(Request $request, $id)
    {
        $announcement = Announcement::findOrFail($id);
        
        $attachments = $announcement->attachments ?? [];
        
        // Handle new attachments
        if ($request->hasFile('attachments')) {
            foreach ($request->file('attachments') as $file) {
                $path = $file->store('announcements', 'public');
                $attachments[] = [
                    'name' => $file->getClientOriginalName(),
                    'path' => $path,
                    'size' => $file->getSize(),
                    'type' => $file->getClientMimeType(),
                ];
            }
        }
        
        // Handle removed attachments
        if ($request->filled('remove_attachments')) {
            $removePaths = $request->input('remove_attachments');
            $attachments = array_filter($attachments, function($attachment) use ($removePaths) {
                if (in_array($attachment['path'], $removePaths)) {
                    \Illuminate\Support\Facades\Storage::disk('public')->delete($attachment['path']);
                    return false;
                }
                return true;
            });
            $attachments = array_values($attachments); // re-index
        }

        $announcement->update([
            'title' => $request->input('title'),
            'body' => $request->input('content'),
            'attachments' => empty($attachments) ? null : $attachments,
        ]);

        activity()
            ->causedBy(auth()->user())
            ->performedOn($announcement)
            ->event('updated')
            ->log('Updated an announcement: ' . $announcement->title);

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
            ->log('Deleted an announcement: ' . $title);

        return back()->with('success', 'Announcement deleted.');
    }
}
