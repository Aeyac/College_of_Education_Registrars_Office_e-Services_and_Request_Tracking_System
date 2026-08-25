<?php

namespace App\Notifications;

use App\Models\Inquiry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class InquiryReplied extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(protected Inquiry $inquiry) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Response to your Inquiry: ' . $this->inquiry->subject)
            ->greeting('Hello ' . $notifiable->first_name . ',')
            ->line('An administrator has replied to your recent inquiry.')
            ->line('**Your Message:** ' . $this->inquiry->message)
            ->line('**Admin Reply:** ' . $this->inquiry->reply)
            ->action('View Dashboard', route('user.dashboard'))
            ->line('Thank you,')
            ->line('CED Registrar\'s Office');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'service_label' => 'Inquiry Reply',
            'message' => 'Admin replied to: ' . $this->inquiry->subject,
            'status_code' => 'released',
            'status_label' => 'Resolved',
        ];
    }
}