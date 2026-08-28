<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CertificateRequestResource extends JsonResource
{
    public function toArray($request): array
    {
        return [
            'id' => $this->id,
            'document_type' => $this->service?->label ?? 'Document',
            'format' => $this->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
            'status' => $this->status?->label ?? 'Pending',
            'created_at' => $this->created_at->format('M d, Y'),
            'student_name' => $this->whenLoaded(
                'user',
                fn() =>
                $this->user->first_name . ' ' . $this->user->last_name
            ),
        ];
    }
}