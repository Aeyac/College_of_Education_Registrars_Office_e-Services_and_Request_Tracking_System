<?php

namespace App\Services\ScheduleExtraction;

use Illuminate\Http\Client\Response;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Reads faculty schedule images/PDFs with Gemini's multimodal API.
 *
 * Why a vision model instead of PDF text-regex: schedules are tables, and a
 * text extractor flattens a 2D table into a 1D string, losing which day
 * column a time block actually belongs to. A vision model reads the table
 * the way a person would, so day assignment is a real read, not a guess.
 *
 * Uses Gemini's `responseSchema` (strict JSON mode) so the model can only
 * return JSON matching our shape — but we still validate/normalize every
 * field ourselves before it reaches the database. Never trust model output
 * blindly, schema or not.
 */
class GeminiScheduleExtractor implements ScheduleExtractorContract
{
    private const ALLOWED_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    private const ALLOWED_TYPES = ['class', 'consultation', 'other'];

    public function __construct(
        private readonly string $apiKey,
        private readonly string $model,
        private readonly string $baseUrl,
    ) {
    }

    public function extractMany(array $files): array
    {
        $files = array_values($files);

        if ($files === []) {
            return [];
        }

        // Fire all requests concurrently instead of looping+awaiting one at a
        // time — with up to 5 files, sequential calls could push total
        // latency past a typical PHP-FPM/web timeout. `retry(..., throw:
        // false)` means a transient 429/5xx retries automatically but a
        // final failure comes back as a normal (failed) response instead of
        // throwing and killing the whole pool.
        $responses = Http::pool(fn ($pool) => array_map(
            fn (UploadedFile $file, int $index) => $pool
                ->as($index)
                ->timeout(45)
                ->connectTimeout(10)
                ->retry(2, 500, throw: false)
                ->withHeaders(['Content-Type' => 'application/json'])
                ->post(
                    sprintf('%s/models/%s:generateContent?key=%s', $this->baseUrl, $this->model, $this->apiKey),
                    $this->buildPayload($file)
                ),
            $files,
            array_keys($files)
        ));

        $results = [];
        foreach ($files as $index => $file) {
            $results[$index] = $this->toResult($file, $responses[$index] ?? null);
        }

        return array_values($results);
    }

    private function buildPayload(UploadedFile $file): array
    {
        return [
            'contents' => [[
                'role' => 'user',
                'parts' => [
                    ['text' => $this->prompt()],
                    [
                        'inline_data' => [
                            // Real detected MIME type, not the file extension —
                            // matches what the validation rule already checked.
                            'mime_type' => $file->getMimeType(),
                            'data' => base64_encode(file_get_contents($file->getRealPath())),
                        ],
                    ],
                ],
            ]],
            'generationConfig' => [
                'responseMimeType' => 'application/json',
                'responseSchema' => $this->schema(),
                'temperature' => 0.1, // low temperature: this is extraction, not creative writing
            ],
        ];
    }

    private function prompt(): string
    {
        return <<<'PROMPT'
        You are reading a faculty class/consultation schedule from an image or PDF.
        It may be a table, a grid, or a list layout.

        Extract:
        - the professor's full name
        - their department or program
        - their main office room
        - every scheduled time block: day, start time, end time, room, whether it
          is a "class", a "consultation" block, or "other", and if shown:
            - the course/subject code (a short alphanumeric code like "TLEIA 2102",
              usually the most prominent label inside the block)
            - the section code (e.g. "BTLED-IA_2-1", usually shown below the
              course code or near the faculty name)

        Rules:
        - Read the DAY of each block from its actual column/row position in the
          document. Never assume a repeating Monday-Friday pattern — read what is
          actually printed for each block.
        - Times must be 24-hour "HH:MM" (e.g. "13:30", not "1:30 PM").
        - Course and section codes are often visually distinct (different weight,
          font, or position) from the room and faculty name in the same block —
          don't conflate them. If a block has no course or section printed on it
          (e.g. a pure consultation slot), leave those two fields as empty strings.
        - If a value is not present or not legible, return an empty string for it
          rather than inventing one.
        - Output only the JSON described by the response schema. No commentary.
        PROMPT;
    }

    private function schema(): array
    {
        return [
            'type' => 'OBJECT',
            'properties' => [
                'faculty_name' => ['type' => 'STRING'],
                'department_or_program' => ['type' => 'STRING'],
                'room_or_location' => ['type' => 'STRING'],
                'weekly_schedule' => [
                    'type' => 'ARRAY',
                    'items' => [
                        'type' => 'OBJECT',
                        'properties' => [
                            'day' => ['type' => 'STRING', 'enum' => self::ALLOWED_DAYS],
                            'start_time' => ['type' => 'STRING'],
                            'end_time' => ['type' => 'STRING'],
                            'room' => ['type' => 'STRING'],
                            'type' => ['type' => 'STRING', 'enum' => self::ALLOWED_TYPES],
                            'course_code' => ['type' => 'STRING'],
                            'section_code' => ['type' => 'STRING'],
                        ],
                        // course_code/section_code deliberately NOT required —
                        // a consultation block or a faculty-only document may
                        // legitimately have neither.
                        'required' => ['day', 'start_time', 'end_time', 'room', 'type'],
                    ],
                ],
            ],
            'required' => ['faculty_name', 'department_or_program', 'room_or_location', 'weekly_schedule'],
        ];
    }

    private function toResult(UploadedFile $file, ?Response $response): array
    {
        $fileName = $file->getClientOriginalName();

        if (! $response || $response->failed()) {
            Log::warning('Gemini schedule extraction request failed', [
                'file' => $fileName,
                'status' => $response?->status(),
            ]);

            return [
                'file_name' => $fileName,
                'success' => false,
                'data' => null,
                'message' => 'The AI scanner could not process this file. Try a clearer photo/scan, or add it manually.',
            ];
        }

        try {
            $text = $response->json('candidates.0.content.parts.0.text');

            if (! is_string($text) || $text === '') {
                throw new \RuntimeException('Empty response text from model.');
            }

            $parsed = json_decode($text, true, 512, JSON_THROW_ON_ERROR);

            return [
                'file_name' => $fileName,
                'success' => true,
                'data' => $this->normalize($parsed),
                'message' => null,
            ];
        } catch (Throwable $e) {
            Log::warning('Gemini schedule response could not be parsed', [
                'file' => $fileName,
                'error' => $e->getMessage(),
            ]);

            return [
                'file_name' => $fileName,
                'success' => false,
                'data' => null,
                'message' => 'The AI scanner returned an unreadable result for this file. Please add it manually.',
            ];
        }
    }

    /**
     * Defensive normalization. `responseSchema` makes malformed JSON unlikely,
     * not impossible — an enum can still come back slightly off, a time can
     * still come back in the wrong format. We coerce or drop rather than let
     * bad data reach the database.
     */
    private function normalize(array $parsed): array
    {
        $schedule = collect($parsed['weekly_schedule'] ?? [])
            ->filter(fn ($block) => is_array($block))
            ->map(function (array $block) {
                return [
                    'day' => in_array($block['day'] ?? null, self::ALLOWED_DAYS, true)
                        ? $block['day']
                        : 'Monday',
                    'start_time' => $this->normalizeTime($block['start_time'] ?? ''),
                    'end_time' => $this->normalizeTime($block['end_time'] ?? ''),
                    'room' => trim((string) ($block['room'] ?? '')),
                    'type' => in_array($block['type'] ?? null, self::ALLOWED_TYPES, true)
                        ? $block['type']
                        : 'class',
                    // Plain text on purpose — resolving these to real
                    // course/section rows (firstOrCreate) happens at save
                    // time in the controller, after the admin has had a
                    // chance to correct a misread code in the review modal.
                    'course_code' => trim((string) ($block['course_code'] ?? '')),
                    'section_code' => trim((string) ($block['section_code'] ?? '')),
                ];
            })
            ->values()
            ->all();

        return [
            'name' => trim((string) ($parsed['faculty_name'] ?? '')),
            'department_or_program' => trim((string) ($parsed['department_or_program'] ?? '')),
            'room_or_location' => trim((string) ($parsed['room_or_location'] ?? '')),
            'weekly_schedule' => $schedule,
        ];
    }

    private function normalizeTime(string $value): string
    {
        $value = trim($value);

        return preg_match('/^\d{2}:\d{2}$/', $value) ? $value : '';
    }
}