<?php

namespace App\Http\Controllers;

use App\Models\CertificateRequest;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    /**
     * Apply the optional ?ids=1,4,7 filter coming from the frontend's
     * currently-visible (filtered/searched) table rows. Falls back to
     * every request when no ids param is present.
     */
    private function scopedRequests(Request $request)
    {
        $query = CertificateRequest::with(['user', 'status', 'service'])->latest();

        if ($request->filled('ids')) {
            $ids = array_filter(explode(',', $request->query('ids')), 'is_numeric');
            $query->whereIn('id', $ids);
        }

        return $query->get();
    }

    public function exportExcel(Request $request)
    {
        $filename = 'CED_Requests_Report_' . date('Y-m-d') . '.csv';
        $requests = $this->scopedRequests($request);

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($requests) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Date Submitted', 'Tracking ID', 'Student Name', 'Document Type', 'Format', 'Status']);

            foreach ($requests as $r) {
                fputcsv($file, [
                    '="' . $r->created_at->timezone('Asia/Manila')->format('M d, Y h:i A') . '"',
                    $r->id,
                    $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown',
                    $r->service ? $r->service->label : 'Document',
                    $r->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
                    $r->status ? $r->status->label : 'Pending',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf(Request $request)
    {
        $requests = $this->scopedRequests($request);
        $isFiltered = $request->filled('ids');

        // Server-side export timestamp in Asia/Manila timezone
        $exportTimestamp = now()->timezone('Asia/Manila')->format('F j, Y - h:i A');

        $html = '
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>CED Registrar - Requests Report</title>
        <style>
            @page {
                size: A4 landscape;
                margin: 15mm;
            }
            body { 
                font-family: "Helvetica Neue", Helvetica, Arial, sans-serif; 
                color: #1e293b; 
                margin: 0;
                padding: 20px;
                background-color: #ffffff;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }
            .header { 
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                border-bottom: 2px solid #0284c7; 
                padding-bottom: 12px; 
                margin-bottom: 20px;
            }
            .header-title h2 { 
                margin: 0; 
                color: #0f172a; 
                font-size: 20px; 
                font-weight: 700;
                letter-spacing: -0.5px;
            }
            .header-title p { 
                margin: 4px 0 0; 
                color: #0284c7; 
                font-size: 12px; 
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            .header-meta {
                text-align: right;
                font-size: 11px;
                color: #64748b;
            }
            .filter-note {
                margin: -8px 0 16px;
                font-size: 10px;
                color: #b45309;
                background-color: #fffbeb;
                border: 1px solid #fde68a;
                border-radius: 4px;
                padding: 6px 10px;
                display: inline-block;
            }
            table { 
                width: 100%; 
                border-collapse: separate; 
                border-spacing: 0; 
                margin-top: 10px; 
                font-size: 12px; 
            }
            th { 
                background-color: #f1f5f9; 
                color: #334155; 
                font-weight: 600; 
                text-transform: uppercase; 
                font-size: 10px; 
                letter-spacing: 0.5px;
                padding: 10px 12px;
                border-bottom: 2px solid #cbd5e1;
                text-align: left;
            }
            td { 
                padding: 10px 12px; 
                border-bottom: 1px solid #e2e8f0; 
                color: #334155;
                vertical-align: middle;
            }
            tbody tr:nth-child(even) {
                background-color: #f8fafc;
            }
            tbody tr:hover {
                background-color: #f1f5f9;
            }
            .badge {
                display: inline-block;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
                text-transform: uppercase;
            }
            .badge-hard { background-color: #e0f2fe; color: #0369a1; }
            .badge-soft { background-color: #f0fdf4; color: #15803d; }
            .badge-status { background-color: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; }
            
            .footer { 
                margin-top: 30px; 
                padding-top: 12px;
                border-top: 1px solid #e2e8f0;
                display: flex;
                justify-content: space-between;
                font-size: 10px; 
                color: #94a3b8; 
            }
        </style>
    </head>
    <body onload="window.print()">
        <div class="header">
            <div class="header-title">
                <h2>College of Education Registrar\'s Office</h2>
                <p>Official Document Requests Report</p>
            </div>
            <div class="header-meta">
                <strong>Exported On:</strong><br>
                ' . $exportTimestamp . '
            </div>
        </div>';

        if ($isFiltered) {
            $html .= '<div class="filter-note">Filtered export &mdash; showing ' . $requests->count() . ' matching request(s)</div>';
        }

        $html .= '
        <table>
            <thead>
                <tr>
                    <th>Date Submitted</th>
                    <th>Tracking ID</th>
                    <th>Student Name</th>
                    <th>Document Type</th>
                    <th>Format</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>';

        if ($requests->count() > 0) {
            foreach ($requests as $r) {
                $studentName = $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown';
                $serviceLabel = $r->service ? $r->service->label : 'Document';
                $isHardCopy = $r->delivery_mode === 'hard_copy';
                $format = $isHardCopy ? 'Hard Copy' : 'Soft Copy';
                $badgeClass = $isHardCopy ? 'badge-hard' : 'badge-soft';
                $statusLabel = $r->status ? $r->status->label : 'Pending';
                $date = $r->created_at->timezone('Asia/Manila')->format('M d, Y h:i A');

                $html .= "<tr>
                <td style=\"white-space: nowrap;\">{$date}</td>
                <td><code style=\"color: #0f172a; font-weight: 600;\">#{$r->id}</code></td>
                <td><strong>{$studentName}</strong></td>
                <td>{$serviceLabel}</td>
                <td><span class=\"badge {$badgeClass}\">{$format}</span></td>
                <td><span class=\"badge badge-status\">{$statusLabel}</span></td>
            </tr>";
            }
        } else {
            $html .= '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 24px;">No requests found.</td></tr>';
        }

        $html .= '</tbody>
        </table>

        <div class="footer">
            <span>CED E-Services System &copy; ' . date('Y') . ' Central Luzon State University</span>
            <span>Confidential Document</span>
        </div>
    </body>
    </html>';

        return response($html);
    }
}