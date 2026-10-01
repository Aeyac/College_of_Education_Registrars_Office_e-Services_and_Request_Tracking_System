<?php

namespace App\Notifications;

use App\Models\AlumniVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class AlumniVerificationSubmitted extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected AlumniVerification $verification)
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
        $user = $this->verification->user;
        $name = $user ? "{$user->first_name} {$user->last_name}" : 'An alumnus';

        return [
            'verification_id' => $this->verification->id,
            'service_label' => 'Alumni Verification',
            'status_code' => 'new',
            'status_label' => 'Pending',
            'message' => "{$name} submitted proof for alumni verification.",
            'link' => '/admin/alumni?open=' . $this->verification->id,
        ];
    }
}