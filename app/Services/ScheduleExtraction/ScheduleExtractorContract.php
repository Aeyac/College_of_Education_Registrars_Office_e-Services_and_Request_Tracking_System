<?php

namespace App\Services\ScheduleExtraction;

use Illuminate\Http\UploadedFile;

interface ScheduleExtractorContract
{
    /**
     * Extract structured faculty schedule data from one or more uploaded files
     * (images or PDFs). Files are processed concurrently where the underlying
     * provider supports it, and a bad file must never abort the whole batch —
     * each entry in the returned array reports its own success/failure.
     *
     * @param  UploadedFile[]  $files
     * @return array<int, array{
     *     file_name: string,
     *     success: bool,
     *     data: array{
     *         name: string,
     *         department_or_program: string,
     *         room_or_location: string,
     *         weekly_schedule: array<int, array{
     *             day: string,
     *             start_time: string,
     *             end_time: string,
     *             room: string,
     *             type: string,
     *             course_code: string,
     *             section_code: string
     *         }>
     *     }|null,
     *     message: string|null
     * }>
     */
    public function extractMany(array $files): array;
}