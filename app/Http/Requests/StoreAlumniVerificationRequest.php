<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreAlumniVerificationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->user_type === 'alumni';
    }

    public function rules(): array
    {
        return [
            'document_type' => ['required', Rule::in(['diploma', 'tor'])],
            'file' => [
                'required',
                'file',
                'mimes:pdf,jpg,jpeg,png',
                'max:10240', // 10MB
            ],
        ];
    }
}