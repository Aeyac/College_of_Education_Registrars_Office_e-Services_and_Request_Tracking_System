<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InquiryMessageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'message' => $this->message,
            'attachment_url' => $this->attachment_path
                ? route($this->resolveAttachmentRouteName(), $this->id)
                : null,
            'attachment_name' => $this->attachment_path ? basename($this->attachment_path) : null,
            'is_edited' => $this->is_edited,
            'sender_name' => $this->user?->first_name ?? 'User',
            'sender_avatar' => $this->user?->profile_picture ? asset('storage/' . $this->user->profile_picture) : null,
            'is_admin' => $this->user?->user_type === 'admin',
            'is_own' => $this->user_id === auth()->id(),
            'created_at' => $this->created_at->timezone('Asia/Manila')->format('M d, Y h:i A'),
            'parent' => $this->whenLoaded('parent', fn() => [
                'id' => $this->parent->id,
                'message' => $this->parent->message,
                'sender_name' => $this->parent->user?->first_name ?? 'User',
            ]),
        ];
    }

    private function resolveAttachmentRouteName(): string
    {
        return auth()->user()?->user_type === 'admin'
            ? 'admin.inquiries.attachment'
            : 'user.inquiries.attachment';
    }
}