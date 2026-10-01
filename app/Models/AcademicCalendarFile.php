<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AcademicCalendarFile extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'file_path',
        'uploaded_by',
        'effective_school_year',
        'is_current',
    ];

    protected function casts(): array
    {
        return ['is_current' => 'boolean'];
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function scopeCurrent($query)
    {
        return $query->where('is_current', true);
    }
}