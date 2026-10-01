<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Smalot\PdfParser\Parser;

class ScheduleExtractorService
{
    public function extract(UploadedFile $file): array
    {
        try {
            $extension = strtolower($file->getClientOriginalExtension());
            
            // Open-source text parsing is limited to PDFs
            if ($extension !== 'pdf') {
                throw new \Exception("The free open-source scanner currently only supports PDF files.");
            }

            // Using smalot/pdfparser (100% free and open-source)
            $parser = new Parser();
            $pdf = $parser->parseFile($file->getPathname());
            $text = $pdf->getText();

            // 1. Extract Faculty Name
            $name = "";
            if (preg_match('/FACULTY\s+([A-Za-z\s,\.]+)/i', $text, $matches)) {
                // Take the first line after FACULTY
                $lines = explode("\n", trim($matches[1]));
                $name = trim($lines[0]);
            }

            // 2. Extract Classes (Regex to find time blocks)
            $schedule = [];
            $days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            $dayIndex = 0;

            // Matches "07:00 AM - 08:30 AM" and captures the block of text after it
            if (preg_match_all('/(\d{2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{2}:\d{2}\s*(?:AM|PM))(.*?)(?=(?:\d{2}:\d{2}\s*(?:AM|PM))|$)/is', $text, $matches, PREG_SET_ORDER)) {
                
                foreach ($matches as $match) {
                    $startTimeRaw = trim($match[1]);
                    $endTimeRaw = trim($match[2]);
                    $blockData = trim($match[3]);

                    // Convert to strict 24-hour format
                    $start_time = date("H:i", strtotime($startTimeRaw));
                    $end_time = date("H:i", strtotime($endTimeRaw));

                    // Extract room (e.g., CED-N 204 or Online)
                    $room = "TBA";
                    if (preg_match('/(CED-N\s*\d+|Online)_?/i', $blockData, $roomMatch)) {
                        $room = str_replace('_', '', trim($roomMatch[1]));
                    }

                    $schedule[] = [
                        // Open-source text extractors flatten table columns, so we can't reliably detect the Day.
                        // We set it sequentially or default to Monday for manual review.
                        'day' => $days[$dayIndex % 5], 
                        'start_time' => $start_time,
                        'end_time' => $end_time,
                        'room' => $room,
                        'type' => 'class'
                    ];
                    
                    $dayIndex++;
                }
            }

            return [
                "name" => $name ?: "Extracted Name",
                "department_or_program" => "College of Education",
                "room_or_location" => "TBA",
                "weekly_schedule" => $schedule
            ];
            
        } catch (\Exception $e) {
            // Fallback empty structure
            return [
                "name" => "",
                "department_or_program" => "College of Education",
                "room_or_location" => "TBA",
                "weekly_schedule" => []
            ];
        }
    }
}