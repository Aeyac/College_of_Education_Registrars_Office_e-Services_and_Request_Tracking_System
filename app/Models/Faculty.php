<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Faculty extends Model
{
    use HasFactory;

    protected $table = 'faculty';

    protected $fillable = [
        'user_id',
        'name',
        'role',
        'department_or_program',
        'room_or_location',
        'weekly_schedule',
        'is_active',
        'last_edited_by',
        'edited_by_role',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function lastEditor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'last_edited_by');
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
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
}
