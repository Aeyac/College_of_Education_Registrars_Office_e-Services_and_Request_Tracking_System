<?php

namespace App\Notifications;

use App\Models\CertificateRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class RequestStatusChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        protected CertificateRequest $certRequest,
    ) {
    }

    public function via(object $notifiable): array
    {
        // Added 'broadcast' to fire real-time Echo events
        return ['database', 'mail', 'broadcast'];
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'request_id' => $this->certRequest->id,
            'service_label' => $this->certRequest->service->label,
            'status_code' => $this->certRequest->status->code,
            'status_label' => $this->certRequest->status->label,
            'message' => $this->messageFor($this->certRequest->status->code, $notifiable),
        ];
    }

    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'request_id' => $this->certRequest->id,
            'service_label' => $this->certRequest->service->label,
            'status_code' => $this->certRequest->status->code,
            'status_label' => $this->certRequest->status->label,
            'message' => $this->messageFor($this->certRequest->status->code, $notifiable),
        ]);
    }

    public function toMail(object $notifiable): MailMessage
    {
        $status = $this->certRequest->status;
        return (new MailMessage)
            ->subject('Update on your ' . $this->certRequest->service->label . ' request')
            ->greeting('Hi ' . $notifiable->first_name . ',')
            ->line($this->messageFor($status->code, $notifiable))
            ->action('View Request', route('requests.show', $this->certRequest))
            ->line('CED Registrar\'s Office - WRCIMS');
    }

    protected function messageFor(string $statusCode, object $notifiable): string
    {
        // Dynamic messaging: If the receiver is an Admin, they get an admin-focused alert.
        if (method_exists($notifiable, 'isAdmin') && $notifiable->isAdmin()) {
            return match ($statusCode) {
                'submitted' => "New document request submitted by {$this->certRequest->user->first_name} {$this->certRequest->user->last_name}.",
                default => "Request #{$this->certRequest->id} was updated to {$this->certRequest->status->label}."
            };
        }

        // Student/Alumni messaging
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