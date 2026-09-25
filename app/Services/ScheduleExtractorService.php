<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Smalot\PdfParser\Parser;

class ScheduleExtractorService
{
    public function extract(UploadedFile $file): array
    {
        $mimeType = $file->getMimeType();
        $text = "";

        // Kunin ang text mula sa PDF gamit ang Smalot PDF Parser
        if ($mimeType === 'application/pdf' && class_exists(Parser::class)) {
            try {
                $parser = new Parser();
                $pdf = $parser->parseFile($file->getPathname());
                $text = $pdf->getText();
            } catch (\Exception $e) {
                $text = "";
            }
        }

        $prompt = "You are a data extraction assistant for Central Luzon State University (CLSU). Your job is to parse Official Class Schedule text or matrices and return a strict JSON object.

RULES FOR EXTRACTION:
1. FACULTY NAME: Locate the 'FACULTY' label near the bottom of the document and extract the name (e.g., 'Verjun Dilla').
2. WEEKLY SCHEDULE: Extract every class block identifying its Day (Monday-Friday), Start Time, End Time, and Room (e.g., 'CED-N 204', 'CED-N 108', or 'Online').
3. TIME FORMAT: Convert all AM/PM times into 24-hour format (HH:mm). Example: '01:00 PM-02:30 PM' becomes start_time: '13:00', end_time: '14:30'.
4. Set the type of all extracted blocks to 'class'.
5. If the department is not explicitly stated, default to 'College of Education'.
6. If the main office room is not stated, default to 'TBA'.

RETURN EXACTLY THIS JSON FORMAT (No markdown blocks, just raw JSON):
{
  \"name\": \"Extracted Name\",
  \"department_or_program\": \"College of Education\",
  \"room_or_location\": \"TBA\",
  \"weekly_schedule\": [
    {\"day\": \"Monday\", \"start_time\": \"10:00\", \"end_time\": \"11:30\", \"room\": \"CED-N 108\", \"type\": \"class\"}
  ]
}";

        $apiKey = env('GEMINI_API_KEY');
        
        // GINAMIT NATIN ANG "gemini-pro" NA SAKOP AT SUPPORTED NG LAHAT NG GEMINI API KEYS
        $url = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key={$apiKey}";

        $response = Http::withHeaders([
            'Content-Type' => 'application/json',
        ])->post($url, [
            'contents' => [
                [
                    'parts' => [
                        ['text' => $prompt],
                        ['text' => "Schedule Document Content:\n\n" . $text]
                    ]
                ]
            ],
            'generationConfig' => [
                'temperature' => 0.1,
                'responseMimeType' => 'application/json'
            ]
        ]);

        if ($response->failed()) {
            throw new \Exception('Gemini API Error: ' . $response->body());
        }

        $content = $response->json('candidates.0.content.parts.0.text');
        $cleanedContent = str_replace(['```json', '```'], '', $content);
        $decoded = json_decode(trim($cleanedContent), true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new \Exception('Failed to parse AI response as JSON. Raw response: ' . $content);
        }

        return $decoded;
    }
}