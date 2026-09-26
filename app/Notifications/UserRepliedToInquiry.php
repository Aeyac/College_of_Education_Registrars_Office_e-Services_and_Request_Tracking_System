<?php

namespace App\Notifications;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class UserRepliedToInquiry extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Inquiry $inquiry) {}

    public function via(object $notifiable): array
    {
        return ['database'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'service_label' => 'Inquiry Reply',
            'message' => 'User replied to: ' . $this->inquiry->subject,
            'status_code' => 'new',
            'status_label' => 'Unread',
            'link' => '/admin/inquiries',
        ];
    }
}
