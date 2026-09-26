<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    private function scopedFeedback(Request $request)
    {
        $query = Feedback::with(['user', 'request.service'])->latest();

        if ($request->filled('ids')) {
            $ids = array_filter(explode(',', $request->query('ids')), 'is_numeric');
            $query->whereIn('id', $ids);
        }

        return $query->get();
    }

    public function index(Request $request)
    {
        $feedbacks = $this->scopedFeedback($request)->map(function ($fb) {
            return [
                'id' => $fb->id,
                'student_name' => $fb->user ? $fb->user->first_name . ' ' . $fb->user->last_name : 'Unknown',
                'tracking_id' => $fb->request_id,
                'document_type' => $fb->request && $fb->request->service ? $fb->request->service->label : 'N/A',
                'rating' => $fb->rating,
                'comments' => $fb->comments,
                'created_at' => $fb->created_at ? $fb->created_at->format('M d, Y h:i A') : 'N/A',
            ];
        });

        return Inertia::render('Admin/Feedback', [
            'feedbacks' => $feedbacks
        ]);
    }

    public function exportExcel(Request $request)
    {
        $filename = 'CED_Feedback_Report_' . date('Y-m-d') . '.csv';
        $feedbacks = $this->scopedFeedback($request);

        if (auth()->check()) {
            activity()
                ->causedBy(auth()->user())
                ->event('export')
                ->log('Exported student feedback to CSV');
        }

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($feedbacks) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Date Submitted', 'Student Name', 'Tracking ID', 'Document Type', 'Rating', 'Comments']);

            foreach ($feedbacks as $fb) {
                $studentName = $fb->user ? $fb->user->first_name . ' ' . $fb->user->last_name : 'Unknown';
                $docType = $fb->request && $fb->request->service ? $fb->request->service->label : 'N/A';
                $date = $fb->created_at ? $fb->created_at->timezone('Asia/Manila')->format('M d, Y h:i A') : 'N/A';
                
                fputcsv($file, [
                    '="' . $date . '"',
                    $studentName,
                    $fb->request_id,
                    $docType,
                    $fb->rating,
                    $fb->comments
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $feedbacks = $this->scopedFeedback($request);
        $isFiltered = $request->filled('ids');

        if (auth()->check()) {
            activity()
                ->causedBy(auth()->user())
                ->event('export')
                ->log('Exported student feedback to PDF');
        }

        $exportTimestamp = now()->timezone('Asia/Manila')->format('F j, Y - h:i A');

        $html = '
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>CED Registrar - Feedback Report</title>
        <style>
            @page { size: A4 landscape; margin: 15mm; }
            body { font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; color: #1e293b; margin: 0; background-color: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #0284c7; padding-bottom: 12px; margin-bottom: 20px; }
            .header-title h2 { margin: 0; color: #0f172a; font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
            .header-title p { margin: 4px 0 0; color: #0284c7; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
            .header-meta { text-align: right; font-size: 11px; color: #64748b; }
            table { width: 100%; border-collapse: separate; border-spacing: 0; margin-top: 10px; font-size: 12px; }
            th { background-color: #f1f5f9; color: #334155; font-weight: 600; text-transform: uppercase; font-size: 10px; letter-spacing: 0.5px; padding: 10px 12px; border-bottom: 2px solid #cbd5e1; text-align: left; }
            td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; color: #334155; vertical-align: top; }
            tbody tr:nth-child(even) { background-color: #f8fafc; }
            .rating-badge { display: inline-block; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; }
            .rating-high { background-color: #dcfce7; color: #166534; }
            .rating-mid { background-color: #fef08a; color: #854d0e; }
            .rating-low { background-color: #fee2e2; color: #991b1b; }
            .footer { margin-top: 30px; padding-top: 12px; border-top: 1px solid #e2e8f0; display: flex; justify-content: space-between; font-size: 10px; color: #94a3b8; }
        </style>
    </head>
    <body onload="window.print()">
        <div class="header">
            <div class="header-title">
                <h2>College of Education Registrar\'s Office</h2>
                <p>Student Feedback Report</p>
            </div>
            <div class="header-meta">
                <strong>Exported On:</strong><br>
                ' . $exportTimestamp . '
            </div>
        </div>';

        $html .= '<table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Student Name</th>
                    <th>Request ID / Doc Type</th>
                    <th>Rating</th>
                    <th style="width: 40%">Comments</th>
                </tr>
            </thead>
            <tbody>';

        if ($feedbacks->count() > 0) {
            foreach ($feedbacks as $fb) {
                $studentName = $fb->user ? $fb->user->first_name . ' ' . $fb->user->last_name : 'Unknown';
                $docType = $fb->request && $fb->request->service ? $fb->request->service->label : 'N/A';
                $date = $fb->created_at ? $fb->created_at->timezone('Asia/Manila')->format('M d, Y h:i A') : 'N/A';
                
                $ratingClass = 'rating-low';
                if ($fb->rating >= 4) $ratingClass = 'rating-high';
                elseif ($fb->rating == 3) $ratingClass = 'rating-mid';

                $html .= "<tr>
                <td style=\"white-space: nowrap;\">{$date}</td>
                <td><strong>{$studentName}</strong></td>
                <td><code style=\"color: #0f172a;\">#{$fb->request_id}</code><br><span style=\"font-size: 10px; color: #64748b;\">{$docType}</span></td>
                <td><span class=\"rating-badge {$ratingClass}\">{$fb->rating} / 5</span></td>
                <td>{$fb->comments}</td>
            </tr>";
            }
        } else {
            $html .= '<tr><td colspan="5" style="text-align: center; color: #94a3b8; padding: 24px;">No feedback found.</td></tr>';
        }

        $html .= '</tbody>
        </table>
        <div class="footer">
            <span>CED E-Services System &copy; ' . date('Y') . ' Central Luzon State University</span>
        </div>
    </body>
    </html>';

        return response($html);
    }
}
