<?php

namespace App\Notifications;

use App\Models\Announcement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AnnouncementPosted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Announcement $announcement)
    {
    }

    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        return $this->payload();
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage($this->payload());
    }

    protected function payload(): array
    {
        return [
            'announcement_id' => $this->announcement->id,
            'service_label' => 'Announcement',
            'status_code' => 'new',
            'status_label' => 'New',
            'message' => 'New announcement: ' . $this->announcement->title,
            'link' => route('user.announcements', ['highlight' => $this->announcement->id], absolute: false),
        ];
    }
}