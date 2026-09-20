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
        public CertificateRequest $certRequest,
        public ?string $note = null,
    ) {
    }

    public function via(object $notifiable): array
    {
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
        $code = $this->certRequest->status->code ?? '';

        $subject = match ($code) {
            'processing' => 'Your certificate request is being processed',
            'ready_for_release' => 'Your certificate is ready for release',
            'released' => 'Your certificate has been released',
            'rejected' => 'Your certificate request was rejected',
            'for_compliance' => 'Action needed: your certificate request requires compliance',
            default => 'Update on your certificate request',
        };

        return (new MailMessage)
            ->subject($subject)
            ->view('emails.request-status', [
                'certRequest' => $this->certRequest,
                'note' => $this->note,
            ]);
    }


    protected function messageFor(string $statusCode, object $notifiable): string
    {
        if (method_exists($notifiable, 'isAdmin') && $notifiable->isAdmin()) {
            return match ($statusCode) {
                'submitted' => "New document request submitted by {$this->certRequest->user->first_name} {$this->certRequest->user->last_name}.",
                default => "Request #{$this->certRequest->id} was updated to {$this->certRequest->status->label}."
            };
        }

        return match ($statusCode) {
            'submitted' => 'Your request has been received.',
            'for_review' => 'Your request is under review.',
            'for_compliance' => 'Please comply with missing details.',
            'processing' => 'Your certificate is being processed.',
            'ready_for_release' => 'Your certificate is ready for release.',
            'released' => 'Your request has been released/resolved.',
            'cancelled_returned' => 'Your request has been cancelled/returned.',
            default => 'Your request status has been updated to ' . $this->certRequest->status->label . '.',
        };
    }
}