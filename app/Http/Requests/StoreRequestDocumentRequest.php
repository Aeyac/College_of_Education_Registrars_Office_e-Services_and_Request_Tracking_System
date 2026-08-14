<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequestDocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Both the owning student/alumni (uploading a requirement) and
        // admins (uploading verification/output files) can hit this —
        // the controller/policy narrows further based on `type`.
        return (bool) $this->user();
    }

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(['requirement', 'verification', 'output'])],
            'file' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240', // 10MB
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'file.mimes' => 'Only PDF, JPG, or PNG files are accepted.',
            'file.max' => 'The file may not be larger than 10MB.',
        ];
    }
}