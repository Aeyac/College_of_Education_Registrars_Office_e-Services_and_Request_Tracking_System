<?php

namespace App\Notifications;

use App\Models\Feedback;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class FeedbackSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Feedback $feedback) {}

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
        $user = $this->feedback->user;
        $name = $user ? trim("{$user->first_name} {$user->last_name}") : 'A student';
        $stars = (int) $this->feedback->rating;

        return [
            'feedback_id' => $this->feedback->id,
            'service_label' => 'Student Feedback',
            'status_code' => 'new',
            'status_label' => 'New',
            'message' => "{$name} submitted {$stars}-star feedback for request #{$this->feedback->request_id}.",
            'link' => '/admin/feedback?open='.$this->feedback->id,
        ];
    }
}
