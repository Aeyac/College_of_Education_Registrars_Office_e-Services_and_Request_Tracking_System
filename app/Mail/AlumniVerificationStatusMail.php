<?php

namespace App\Mail;

use App\Models\AlumniVerification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class AlumniVerificationStatusMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(public AlumniVerification $verification)
    {
    }

    public function envelope(): Envelope
    {
        $subject = $this->verification->status === 'verified'
            ? 'Your alumni verification has been approved'
            : 'Your alumni verification was rejected';

        return new Envelope(subject: $subject);
    }

    public function content(): Content
    {
        return new Content(view: 'emails.alumni-status');
    }
}