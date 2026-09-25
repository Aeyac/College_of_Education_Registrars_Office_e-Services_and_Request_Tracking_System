<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Faculty extends Model
{
    use HasFactory;

    protected $table = 'faculty';

    protected $fillable = [
        'name',
        'department_or_program',
        'consultation_days',
        'consultation_time_start',
        'consultation_time_end',
        'room_or_location',
        'weekly_schedule',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'consultation_time_start' => 'datetime:H:i',
            'consultation_time_end' => 'datetime:H:i',
            'weekly_schedule' => 'array',
        ];
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function getCurrentStatusAttribute(): array
    {
        if (empty($this->weekly_schedule)) {
            return ['status' => 'Unknown', 'room' => $this->room_or_location, 'color' => 'slate'];
        }

        $now = now()->timezone('Asia/Manila');
        $currentDay = $now->format('l'); 
        $currentTime = $now->format('H:i');

        foreach ($this->weekly_schedule as $block) {
            if ($block['day'] === $currentDay && $currentTime >= $block['start_time'] && $currentTime <= $block['end_time']) {
                if ($block['type'] === 'consultation') {
                    return ['status' => 'Available for Consultation', 'room' => $block['room'], 'color' => 'emerald'];
                }
                if ($block['type'] === 'class') {
                    return ['status' => 'In Class', 'room' => $block['room'], 'color' => 'rose'];
                }
                return ['status' => 'In a Meeting/Busy', 'room' => $block['room'], 'color' => 'amber'];
            }
        }

        return ['status' => 'Unavailable / Off Schedule', 'room' => null, 'color' => 'slate'];
    }

    public function formattedConsultationHours(): string
    {
        $start = $this->consultation_time_start ? Carbon::parse($this->consultation_time_start) : null;
        $end = $this->consultation_time_end ? Carbon::parse($this->consultation_time_end) : null;
        $range = trim(($start?->format('g:i A') ?? '') . ($start && $end ? ' - ' : '') . ($end?->format('g:i A') ?? ''));
        $hours = trim(($this->consultation_days ?? '') . ' ' . $range);
        return $hours ?: 'No schedule set';
    }
}