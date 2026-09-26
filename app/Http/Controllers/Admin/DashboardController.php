<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AlumniVerification;
use App\Models\CertificateRequest;
use App\Models\User;
use App\Models\Inquiry;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function loadDashboard()
    {
        $monthlyProcessed = CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'released'))
            ->selectRaw('YEAR(updated_at) as year, MONTH(updated_at) as month, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'asc')
            ->orderBy('month', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'month' => date("F", mktime(0, 0, 0, $item->month, 10)),
                    'year' => $item->year,
                    'count' => $item->count,
                ];
            });

        $statusDistribution = [
            ['name' => 'Submitted', 'value' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'submitted'))->count(), 'color' => '#0284c7'], // sky
            ['name' => 'For Review', 'value' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'for_review'))->count(), 'color' => '#ca8a04'], // yellow
            ['name' => 'Compliance', 'value' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'for_compliance'))->count(), 'color' => '#d97706'], // amber
            ['name' => 'Processing', 'value' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'processing'))->count(), 'color' => '#4f46e5'], // indigo
            ['name' => 'Ready', 'value' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'ready_for_release'))->count(), 'color' => '#059669'], // emerald
            ['name' => 'Released', 'value' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'released'))->count(), 'color' => '#0d9488'], // teal
            ['name' => 'Cancelled/Rejected', 'value' => CertificateRequest::whereHas('status', fn($q) => $q->whereIn('code', ['cancelled', 'returned', 'rejected', 'cancelled_returned']))->count(), 'color' => '#e11d48'], // rose
        ];

        // Filter out zero values for better pie chart rendering
        $statusDistribution = array_values(array_filter($statusDistribution, fn($item) => $item['value'] > 0));

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'new_requests' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'submitted'))->count(),
                'pending' => CertificateRequest::whereHas('status', fn($q) => $q->whereIn('code', ['submitted', 'for_review']))->count(),
                'for_compliance' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'for_compliance'))->count(),
                'processing' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'processing'))->count(),
                'ready_for_release' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'ready_for_release'))->count(),
                'released' => CertificateRequest::whereHas('status', fn($q) => $q->where('code', 'released'))->count(),
                'alumni' => AlumniVerification::where('status', 'pending')->count(),
                'users' => User::whereIn('user_type', ['student', 'alumni', 'admin'])->count(),
                'inquiries' => Inquiry::where('status', 'open')->count(),
            ],
            'monthlyProcessed' => $monthlyProcessed,
            'statusDistribution' => $statusDistribution,
        ]);

        
    }
}
