<?php

namespace App\Support;

use Illuminate\Validation\Rule;

class ScheduleRules
{
    public static function rules(bool $requireBlocks = false): array
    {
        return [
            'weekly_schedule' => $requireBlocks
                ? ['required', 'array', 'min:1']
                : ['nullable', 'array'],
            'weekly_schedule.*' => ['array'],
            'weekly_schedule.*.day' => ['required', Rule::in([
                'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
            ])],
            'weekly_schedule.*.start_time' => ['required', 'date_format:H:i'],
            'weekly_schedule.*.end_time' => ['required', 'date_format:H:i', 'after:weekly_schedule.*.start_time'],
            'weekly_schedule.*.type' => ['required', Rule::in(['class', 'consultation', 'other'])],
            'weekly_schedule.*.room' => ['required', 'string', 'max:255'],
            'weekly_schedule.*.course_code' => ['nullable', 'string', 'max:50'],
            'weekly_schedule.*.section_code' => ['nullable', 'string', 'max:50'],
        ];
    }

    public static function messages(): array
    {
        return [
            'weekly_schedule.required' => 'Add at least one schedule block.',
            'weekly_schedule.min' => 'Add at least one schedule block.',
            'weekly_schedule.*.day.required' => 'Every schedule block needs a day.',
            'weekly_schedule.*.start_time.required' => 'Every schedule block needs a start time.',
            'weekly_schedule.*.start_time.date_format' => 'Start time must look like 08:00.',
            'weekly_schedule.*.end_time.required' => 'Every schedule block needs an end time.',
            'weekly_schedule.*.end_time.date_format' => 'End time must look like 09:30.',
            'weekly_schedule.*.end_time.after' => 'End time must be later than the start time.',
            'weekly_schedule.*.type.required' => 'Every schedule block needs a type.',
            'weekly_schedule.*.room.required' => 'Every schedule block needs a room.',
        ];
    }
}