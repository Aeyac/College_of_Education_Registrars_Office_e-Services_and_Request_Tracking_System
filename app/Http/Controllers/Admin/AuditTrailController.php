<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateRequest;
use App\Models\RequestService;
use App\Models\RequestStatus;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Spatie\Activitylog\Models\Activity;

class AuditTrailController extends Controller
{
    public function index(Request $request)
    {
        // Preload status labels once — avoids querying per row for every status_id change
        $statusMap = RequestStatus::pluck('label', 'id');

        $logs = Activity::query()
            ->with([
                'causer',
                'subject' => function ($morphTo) {
                    $morphTo->morphWith([
                        CertificateRequest::class => ['service'],
                    ]);
                },
            ])
            ->whereHasMorph('causer', [User::class], function ($q) {
                $q->where('user_type', 'admin');
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                $search = $request->search;
                $q->where(function ($q) use ($search) {
                    $q->where('description', 'like', "%{$search}%")
                        ->orWhere('subject_type', 'like', "%{$search}%")
                        ->orWhere('event', 'like', "%{$search}%")
                        ->orWhere('log_name', 'like', "%{$search}%")
                        ->orWhereHasMorph('causer', [User::class], function ($q) use ($search) {
                            $q->where('user_type', 'admin')
                                ->where(function ($q) use ($search) {
                                    $q->where('first_name', 'like', "%{$search}%")
                                        ->orWhere('last_name', 'like', "%{$search}%")
                                        ->orWhereRaw("CONCAT(first_name, ' ', last_name) like ?", ["%{$search}%"]);
                                });
                        })
                        ->orWhereHasMorph('subject', '*', function ($q, $type) use ($search) {
                            match ($type) {
                                CertificateRequest::class => $q->whereHas('service', function ($q) use ($search) {
                                        $q->where('label', 'like', "%{$search}%");
                                    })->orWhereHas('user', function ($q) use ($search) {
                                            $q->where('first_name', 'like', "%{$search}%")
                                            ->orWhere('last_name', 'like', "%{$search}%");
                                        }),
                                User::class => $q->where('first_name', 'like', "%{$search}%")
                                    ->orWhere('last_name', 'like', "%{$search}%"),
                                default => null,
                            };
                        });
                });
            })
            ->when($request->filled('log_name'), fn($q) =>
                $q->where('log_name', $request->log_name))
            ->when($request->filled('event'), fn($q) =>
                $q->where('event', $request->event))
            ->when(
                $request->filled('service_id'),
                fn($q) =>
                    $q->whereHasMorph('subject', [CertificateRequest::class], function ($q) use ($request) {
                        $q->where('service_id', $request->service_id);
                    })
            )
            ->when($request->filled('causer_id'), fn($q) =>
                $q->where('causer_id', $request->causer_id))
            ->when($request->filled('date_from'), fn($q) =>
                $q->whereDate('created_at', '>=', $request->date_from))
            ->when($request->filled('date_to'), fn($q) =>
                $q->whereDate('created_at', '<=', $request->date_to))
            ->latest('created_at')
            ->paginate(15)
            ->withQueryString();

        $logs->getCollection()->transform(function ($log) use ($statusMap) {
            $changes = [];
            if ($log->attribute_changes) {
                $attrs = $log->attribute_changes['attributes'] ?? [];
                $old = $log->attribute_changes['old'] ?? [];

                foreach ($attrs as $field => $newValue) {
                    $oldValue = $old[$field] ?? null;

                    if ($field === 'status_id') {
                        $changes[] = [
                            'field' => 'Status',
                            'from' => $statusMap[$oldValue] ?? ($oldValue ?? '—'),
                            'to' => $statusMap[$newValue] ?? ($newValue ?? '—'),
                        ];
                    } else {
                        $changes[] = [
                            'field' => Str::headline($field),
                            'from' => $oldValue ?? '—',
                            'to' => $newValue ?? '—',
                        ];
                    }
                }
            }

            $subjectName = match ($log->subject_type) {
                CertificateRequest::class => $log->subject?->service?->label ?? 'Certificate Request',
                User::class => $log->subject
                    ? trim(($log->subject->first_name ?? '') . ' ' . ($log->subject->last_name ?? ''))
                    : null,
                default => $log->subject_type ? class_basename($log->subject_type) : null,
            };

            return [
                'id' => $log->id,
                'log_name' => $log->log_name,
                'description' => $log->description,
                'event' => $log->event,
                'subject_type' => $log->subject_type ? class_basename($log->subject_type) : null,
                'subject_id' => $log->subject_id,
                'subject_name' => $subjectName,
                'causer_name' => $log->causer
                    ? trim(($log->causer->first_name ?? '') . ' ' . ($log->causer->last_name ?? '')) ?: 'Unknown'
                    : 'System',
                'changes' => $changes,
                'properties' => $log->properties,
                'created_at' => $log->created_at,
                'created_at_human' => $log->created_at->diffForHumans(),
            ];
        });

        return Inertia::render('Admin/AuditTrail', [
            'logs' => $logs,
            'filters' => $request->only([
                'search',
                'log_name',
                'event',
                'service_id',
                'causer_id',
                'date_from',
                'date_to',
            ]),
            'logNames' => Activity::query()->distinct()->whereNotNull('log_name')->pluck('log_name'),
            'events' => Activity::query()->distinct()->whereNotNull('event')->pluck('event'),
            'certificateTypes' => RequestService::query()
                ->where('is_active', 1)
                ->orderBy('sort_order')
                ->get(['id', 'label'])
                ->map(fn($service) => ['value' => $service->id, 'label' => $service->label])
                ->values(),
        ]);
    }
}