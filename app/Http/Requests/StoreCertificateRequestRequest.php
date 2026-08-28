<?php

namespace App\Http\Requests;

use App\Models\RequestService;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCertificateRequestRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Any authenticated student/alumni can submit a request for themselves.
        return $this->user() && !$this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'service_id' => ['required', 'exists:request_services,id'],
            'purpose' => ['required', 'string', 'max:2000'],
            'preferred_claiming_date' => ['nullable', 'date', 'after_or_equal:today'],
            'requirement_file' => ['nullable', 'file', 'mimes:pdf,jpg,jpeg,png', 'max:10240'],

            // Internship-specific fields (Conditionally Required)
            'internship_school_or_agency' => [
                Rule::requiredIf(fn() => $this->isInternshipCertificate()),
                'nullable',
                'string',
                'max:255',
            ],
            'grade_level_handled' => ['nullable', 'string', 'max:255'],
            'semester' => [
                Rule::requiredIf(fn() => $this->isInternshipCertificate()),
                'nullable',
                'string',
                'max:50',
            ],
            'school_year' => [
                Rule::requiredIf(fn() => $this->isInternshipCertificate()),
                'nullable',
                'string',
                'max:20',
            ],
        ];
    }

    protected function isInternshipCertificate(): bool
    {
        $service = RequestService::find($this->input('service_id'));
        return $service?->code === 'internship_certificate';
    }

    public function messages(): array
    {
        return [
            'internship_school_or_agency.required' => 'The internship school/agency is required for Internship Certificate requests.',
            'semester.required' => 'The semester is required for Internship Certificate requests.',
            'school_year.required' => 'The school year is required for Internship Certificate requests.',
        ];
    }
}