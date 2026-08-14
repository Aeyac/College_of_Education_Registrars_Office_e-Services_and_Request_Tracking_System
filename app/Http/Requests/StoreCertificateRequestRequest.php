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
        // Admins aren't expected to submit requests on a student's behalf here.
        return $this->user() && !$this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'service_id' => ['required', 'exists:request_services,id'],
            'delivery_mode' => ['required', Rule::in(['soft_copy', 'hard_copy'])],
            'purpose' => ['nullable', 'string', 'max:2000'],
            'preferred_claiming_date' => ['nullable', 'date', 'after_or_equal:today'],

            // Internship-specific fields — only required when the chosen
            // service is Internship / PT Certificate. Resolved by code,
            // not by a hardcoded ID, so lookup data can be reseeded safely.
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

    /**
     * Whether the submitted service_id resolves to the Internship
     * Certificate service. Used to conditionally require the
     * internship-only fields above.
     */
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