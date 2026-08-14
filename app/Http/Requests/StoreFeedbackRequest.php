<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && !$this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            // Nullable — a request may not always exist (general feedback
            // is allowed, not just per-request feedback).
            'request_id' => ['nullable', 'exists:requests,id'],
            'rating' => ['nullable', 'integer', 'min:1', 'max:5'],
            'comments' => ['nullable', 'string', 'max:2000'],
        ];
    }
}