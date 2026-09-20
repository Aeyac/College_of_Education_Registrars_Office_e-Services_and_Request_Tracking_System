<?php

namespace App\Events;

use App\Models\CertificateRequest;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestListUpdated implements ShouldBroadcastNow
{
    use Dispatchable, SerializesModels;

    public function __construct(public CertificateRequest $certRequest)
    {
    }

    public function broadcastOn(): array
    {
        return [
            new PrivateChannel('admin.requests'),
            new PrivateChannel('App.Models.User.' . $this->certRequest->user_id),
        ];
    }

    public function broadcastAs(): string
    {
        return 'requests.updated';
    }

    public function broadcastWith(): array
    {
        return ['id' => $this->certRequest->id];
    }
}