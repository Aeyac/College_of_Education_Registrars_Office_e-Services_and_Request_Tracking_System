<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Announcement;
use App\Models\User;
use App\Notifications\AnnouncementPosted;
use App\Services\HtmlSanitizer;
use Illuminate\Http\Request;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class AnnouncementController extends Controller
{
    public function loadAnnouncements()
    {
        $announcements = Announcement::latest()->get()->map(fn ($ann) => [
            'id' => $ann->id,
            'title' => $ann->title,
            'content' => $ann->body,
            'attachments' => $ann->attachments,
            'date' => $ann->created_at->format('M d, Y'),
        ]);

        return Inertia::render('Admin/Announcements', ['announcements' => $announcements]);
    }

    public function storeAnnouncement(Request $request, HtmlSanitizer $sanitizer)
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['required', 'string', 'max:65535'],
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'max:10240'],
        ]);

        $attachments = $this->storeAttachments($request->file('attachments', []));

        $announcement = Announcement::create([
            'title' => $validated['title'],
            'body' => $sanitizer->clean($validated['content']),
            'attachments' => $attachments ?: null,
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
            'attachments' => ['nullable', 'array', 'max:10'],
            'attachments.*' => ['file', 'max:10240'],
            'remove_attachments' => ['nullable', 'array'],
            'remove_attachments.*' => ['string'],
        ]);

        $announcement = Announcement::findOrFail($id);

        $attachments = $this->dropAttachments(
            $announcement->attachments ?? [],
            $request->input('remove_attachments', [])
        );

        $attachments = array_merge($attachments, $this->storeAttachments($request->file('attachments', [])));

        $announcement->update([
            'title' => $validated['title'],
            'body' => $sanitizer->clean($validated['content']),
            'attachments' => $attachments ?: null,
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

    /**
     * Persist newly uploaded files and return their attachment metadata.
     *
     * @param  array<int, UploadedFile>  $files
     * @return array<int, array<string, mixed>>
     */
    private function storeAttachments(array $files): array
    {
        $attachments = [];

        foreach ($files as $file) {
            $attachments[] = [
                'name' => $file->getClientOriginalName(),
                'path' => $file->store('announcements', 'public'),
                'size' => $file->getSize(),
                'type' => $file->getClientMimeType(),
            ];
        }

        return $attachments;
    }

    /**
     * Delete the files behind the given attachment paths and return the
     * remaining metadata, re-indexed so it can be cast back to JSON.
     *
     * @param  array<int, array<string, mixed>>  $attachments
     * @param  array<int, string>  $removePaths
     * @return array<int, array<string, mixed>>
     */
    private function dropAttachments(array $attachments, array $removePaths): array
    {
        if ($removePaths === []) {
            return $attachments;
        }

        $remaining = [];

        foreach ($attachments as $attachment) {
            if (in_array($attachment['path'], $removePaths, true)) {
                Storage::disk('public')->delete($attachment['path']);

                continue;
            }

            $remaining[] = $attachment;
        }

        return $remaining;
    }
}
