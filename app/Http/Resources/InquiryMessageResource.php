<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InquiryMessageResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'attachment_url' => $this->attachment_path ? asset('storage/' . $this->attachment_path) : null,
            'attachment_name' => $this->attachment_path ? basename($this->attachment_path) : null,
            'is_edited' => $this->is_edited,
            'sender_name' => $this->user?->first_name ?? 'User',
            'sender_avatar' => $this->user?->profile_picture ? asset('storage/' . $this->user->profile_picture) : null,
            'is_admin' => $this->user?->user_type === 'admin',
            'is_own' => $this->user_id === auth()->id(),
            'created_at' => $this->created_at->format('M d, Y h:i A'),
            'parent' => $this->whenLoaded('parent', fn() => [
                'id' => $this->parent->id,
                'message' => $this->parent->message,
                'sender_name' => $this->parent->user?->first_name ?? 'User',
            ]),
        ];
    }
}
