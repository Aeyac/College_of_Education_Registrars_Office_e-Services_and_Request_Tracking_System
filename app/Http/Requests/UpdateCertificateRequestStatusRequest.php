<?php

namespace App\Http\Requests;

use App\Models\RequestStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCertificateRequestStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Flat admin model — any admin can transition any request.
        return (bool) $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'status_code' => ['required', 'string', Rule::in(RequestStatus::pluck('code'))],
            // Required specifically when moving into For Compliance or
            // Cancelled/Returned, so staff always leave a reason for those.
            'note' => [
                Rule::requiredIf(fn() => in_array($this->input('status_code'), [
                    'for_compliance',
                    'cancelled_returned',
                ])),
                'nullable',
                'string',
                'max:2000',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'note.required' => 'A note explaining the reason is required for this status change.',
        ];
    }
}