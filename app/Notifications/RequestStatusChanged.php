<?php

namespace App\Notifications;

use App\Models\CertificateRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RequestStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected CertificateRequest $certRequest,
    ) {
    }

    /**
     * Database channel powers the in-app notification bell/list; mail
     * sends an actual email. Both read from the same toArray()/toMail()
     * below, so the message content only has to be written once.
     */
    public function via(object $notifiable): array
    {
        return ['database', 'mail'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'request_id' => $this->certRequest->id,
            'service_label' => $this->certRequest->service->label,
            'status_code' => $this->certRequest->status->code,
            'status_label' => $this->certRequest->status->label,
            'message' => $this->messageFor($this->certRequest->status->code),
        ];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $status = $this->certRequest->status;

        return (new MailMessage)
            ->subject('Update on your ' . $this->certRequest->service->label . ' request')
            ->greeting('Hi ' . $notifiable->name . ',')
            ->line($this->messageFor($status->code))
            ->action('View Request', route('requests.show', $this->certRequest))
            ->line('CED Registrar\'s Office — WRCIMS');
    }

    /**
     * Maps each status code to the exact wording specified in the
     * revision letter (item 17), so notification copy stays consistent
     * with what the client explicitly asked for.
     */
    protected function messageFor(string $statusCode): string
    {
        return match ($statusCode) {
            'submitted' => 'Your request has been received.',
            'for_review' => 'Your request is under review.',
            'for_compliance' => 'Please comply with missing details: ' . ($this->certRequest->statusHistory()->latest()->first()?->note ?? 'see your request for details.'),
            'processing' => 'Your certificate is being processed.',
            'ready_for_release' => 'Your certificate is ready for release.',
            'released' => 'Your request has been released/resolved.',
            'cancelled_returned' => 'Your request has been cancelled/returned. ' . ($this->certRequest->statusHistory()->latest()->first()?->note ?? ''),
            default => 'Your request status has been updated to ' . $this->certRequest->status->label . '.',
        };
    }
}