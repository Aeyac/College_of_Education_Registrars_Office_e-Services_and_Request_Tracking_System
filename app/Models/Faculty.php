<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'department_or_program',
        'consultation_days',
        'consultation_time_start',
        'consultation_time_end',
        'room_or_location',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'consultation_time_start' => 'datetime:H:i',
            'consultation_time_end' => 'datetime:H:i',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /** Simple search-by-name/department helper for the view/search feature. */
    public function scopeSearch($query, ?string $term)
    {
        if (!$term) {
            return $query;
        }

        return $query->where(function ($q) use ($term) {
            $q->where('name', 'like', "%{$term}%")
                ->orWhere('department_or_program', 'like', "%{$term}%");
        });
    }
}