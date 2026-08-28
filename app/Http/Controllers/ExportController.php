<?php

namespace App\Http\Controllers;

use App\Models\CertificateRequest;
use Illuminate\Http\Request;

class ExportController extends Controller
{
    public function exportExcel()
    {
        $filename = 'CED_Requests_Report_' . date('Y-m-d') . '.csv';
        $requests = CertificateRequest::with(['user', 'status', 'service'])->latest()->get();

        $headers = [
            "Content-type" => "text/csv",
            "Content-Disposition" => "attachment; filename=$filename",
            "Pragma" => "no-cache",
            "Cache-Control" => "must-revalidate, post-check=0, pre-check=0",
            "Expires" => "0"
        ];

        $callback = function () use ($requests) {
            $file = fopen('php://output', 'w');
            fputcsv($file, ['Tracking ID', 'Student Name', 'Document Type', 'Format', 'Status', 'Date Submitted']);

            foreach ($requests as $r) {
                fputcsv($file, [
                    $r->id,
                    $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown',
                    $r->service ? $r->service->label : 'Document',
                    $r->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy',
                    $r->status ? $r->status->label : 'Pending',
                    '="' . $r->created_at->format('Y-m-d H:i') . '"',
                ]);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function exportPdf()
    {
        $requests = CertificateRequest::with(['user', 'status', 'service'])->latest()->get();

        $html = '
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>CED Registrar - Requests Report</title>
            <style>
                body { font-family: Arial, sans-serif; color: #1e293b; padding: 30px; }
                .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 15px; }
                .header h2 { margin: 0; color: #0f172a; font-size: 22px; }
                .header p { margin: 5px 0 0; color: #64748b; font-size: 13px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                th, td { border: 1px solid #cbd5e1; padding: 10px; text-align: left; }
                th { background-color: #f8fafc; color: #334155; font-weight: bold; text-transform: uppercase; font-size: 11px; }
                td { color: #475569; }
                .footer { margin-top: 30px; text-align: right; font-size: 11px; color: #94a3b8; }
            </style>
        </head>
        <body onload="window.print()">
            <div class="header">
                <h2>College of Education Registrar\'s Office</h2>
                <p>Official Document Requests Report — Generated on <span id="export-date"></span></p>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Tracking ID</th>
                        <th>Student Name</th>
                        <th>Document Type</th>
                        <th>Format</th>
                        <th>Status</th>
                        <th>Date Submitted</th>
                    </tr>
                </thead>
                <tbody>';

        if ($requests->count() > 0) {
            foreach ($requests as $r) {
                $studentName = $r->user ? $r->user->first_name . ' ' . $r->user->last_name : 'Unknown';
                $serviceLabel = $r->service ? $r->service->label : 'Document';
                $format = $r->delivery_mode === 'hard_copy' ? 'Hard Copy' : 'Soft Copy';
                $statusLabel = $r->status ? $r->status->label : 'Pending';
                $date = $r->created_at->format('M d, Y');

                $html .= "<tr>
                    <td><strong>#{$r->id}</strong></td>
                    <td>{$studentName}</td>
                    <td>{$serviceLabel}</td>
                    <td>{$format}</td>
                    <td>{$statusLabel}</td>
                    <td>{$date}</td>
                </tr>";
            }
        } else {
            $html .= '<tr><td colspan="6" style="text-align: center; color: #94a3b8; padding: 20px;">No requests found.</td></tr>';
        }

        $html .= '</tbody>
            </table>
            <div class="footer">
                <p>CED E-Services System &copy; ' . date('Y') . ' Central Luzon State University</p>
            </div>
            <script>
                document.getElementById("export-date").innerText = new Date().toLocaleDateString("en-US", {
                    year: "numeric", month: "long", day: "numeric"
                });
            </script>
        </body>
        </html>';

        return response($html);
    }
}
