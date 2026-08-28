<?php

namespace App\Rules;

use App\Services\ProfanityFilter;
use Closure;
use Illuminate\Contracts\Validation\ValidationRule;

class NotProfane implements ValidationRule
{
    public function validate(
        string $attribute,
        mixed $value,
        Closure $fail
    ): void {
        $filter = app(ProfanityFilter::class);

        if ($filter->containsProfanity((string) $value)) {
            $fail('The :attribute contains inappropriate language.');
        }
    }
}