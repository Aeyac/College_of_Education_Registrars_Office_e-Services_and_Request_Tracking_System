<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Feedback;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FeedbackController extends Controller
{
    private const PER_PAGE = 10;

    /**
     * Shared by the table and both exports, so an export always
     * matches what the admin sees on screen.
     */
    private function filteredQuery(Request $request)
    {
        $search = trim((string) $request->query('q', ''));
        $rating = $request->query('rating');

        $query = Feedback::with(['user', 'request.service'])
            ->orderByDesc('created_at')
            ->orderByDesc('id');

        if ($search !== '') {
            $like = '%' . addcslashes($search, '\\%_') . '%';

            $query->where(function ($q) use ($like) {
                $q->where('comments', 'like', $like)
                    ->orWhere('request_id', 'like', $like)
                    ->orWhereHas('user', function ($u) use ($like) {
                        $u->where('first_name', 'like', $like)
                            ->orWhere('last_name', 'like', $like)
                            ->orWhereRaw("CONCAT(first_name, ' ', last_name) LIKE ?", [$like]);
                    })
                    ->orWhereHas('request.service', fn($s) => $s->where('label', 'like', $like));
            });
        }

        if (in_array((string) $rating, ['1', '2', '3', '4', '5'], true)) {
            $query->where('rating', (int) $rating);
        }

        return $query;
    }

    private function studentName($fb): string
    {
        return $fb->user ? trim($fb->user->first_name . ' ' . $fb->user->last_name) : 'Unknown';
    }

    private function docType($fb): string
    {
        return $fb->request && $fb->request->service ? $fb->request->service->label : 'N/A';
    }

    private function formatDate($fb): string
    {
        return $fb->created_at
            ? $fb->created_at->timezone('Asia/Manila')->format('M d, Y h:i A')
            : 'N/A';
    }

    /** Stops Excel from executing cells that start with = + - @ */
    private function csvSafe($value): string
    {
        $value = (string) $value;

        return $value !== '' && in_array($value[0], ['=', '+', '-', '@'], true)
            ? "'" . $value
            : $value;
    }

    public function index(Request $request)
    {
        $feedbacks = $this->filteredQuery($request)
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn($fb) => [
                'id' => $fb->id,
                'student_name' => $this->studentName($fb),
                'tracking_id' => $fb->request_id,
                'document_type' => $this->docType($fb),
                'rating' => (int) $fb->rating,
                'comments' => $fb->comments,
                'created_at' => $this->formatDate($fb),
            ]);

        return Inertia::render('Admin/Feedback', [
            'feedbacks' => $feedbacks,
            'filters' => [
                'q' => trim((string) $request->query('q', '')),
                'rating' => $request->query('rating', 'all') ?: 'all',
            ],
        ]);
    }

    public function exportExcel(Request $request)
    {
        $filename = 'CED_Feedback_Report_' . date('Y-m-d') . '.csv';
        $query = $this->filteredQuery($request);

        if (auth()->check()) {
            activity()
                ->causedBy(auth()->user())
                ->event('export')
                ->log('Exported student feedback to CSV');
        }

        return response()->streamDownload(function () use ($query) {
            $file = fopen('php://output', 'w');

            // UTF-8 BOM so Excel reads special characters correctly
            fwrite($file, "\xEF\xBB\xBF");
            fputcsv($file, ['Date Submitted', 'Student Name', 'Tracking ID', 'Document Type', 'Rating', 'Comments']);

            // lazy() reads in chunks with eager loading, so memory stays flat
            foreach ($query->lazy(500) as $fb) {
                fputcsv($file, [
                    '="' . $this->formatDate($fb) . '"',
                    $this->csvSafe($this->studentName($fb)),
                    $fb->request_id,
                    $this->csvSafe($this->docType($fb)),
                    $fb->rating,
                    $this->csvSafe($fb->comments),
                ]);
            }

            fclose($file);
        }, $filename, [
            'Content-Type' => 'text/csv; charset=UTF-8',
            'Cache-Control' => 'no-store, no-cache, must-revalidate',
        ]);
    }

    public function exportPdf(Request $request)
    {
        $feedbacks = $this->filteredQuery($request)->get();

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
            thead { display: table-header-group; }
            tr { page-break-inside: avoid; }
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
                ' . e($exportTimestamp) . '
            </div>
        </div>
        <table>
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

        if ($feedbacks->isNotEmpty()) {
            foreach ($feedbacks as $fb) {
                $ratingClass = $fb->rating >= 4 ? 'rating-high' : ($fb->rating == 3 ? 'rating-mid' : 'rating-low');

                // Everything user-supplied goes through e() to prevent HTML injection
                $html .= '<tr>
                <td style="white-space: nowrap;">' . e($this->formatDate($fb)) . '</td>
                <td><strong>' . e($this->studentName($fb)) . '</strong></td>
                <td><code style="color: #0f172a;">#' . e($fb->request_id) . '</code><br><span style="font-size: 10px; color: #64748b;">' . e($this->docType($fb)) . '</span></td>
                <td><span class="rating-badge ' . $ratingClass . '">' . e($fb->rating) . ' / 5</span></td>
                <td>' . e($fb->comments) . '</td>
            </tr>';
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