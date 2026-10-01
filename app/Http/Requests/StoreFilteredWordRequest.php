<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreFilteredWordRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'word' => ['required', 'string', 'max:100', 'unique:filtered_words,word'],
        ];
    }

    protected function prepareForValidation(): void
    {
        if ($this->has('word')) {
            $this->merge(['word' => strtolower(trim($this->input('word')))]);
        }
    }

    public function messages(): array
    {
        return [
            'word.unique' => 'That word is already in the filter list.',
        ];
    }
}