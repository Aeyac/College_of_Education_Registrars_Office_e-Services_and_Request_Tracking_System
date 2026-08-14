<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;

/**
 * Represents a certificate/document request submitted by a student or
 * alumni. Named `CertificateRequest` (rather than `Request`) specifically
 * to avoid colliding with Illuminate\Http\Request, so controllers can
 * type-hint both without any aliasing.
 */
class CertificateRequest extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    protected $table = 'requests';

    protected $fillable = [
        'user_id',
        'service_id',
        'status_id',
        'delivery_mode', // soft_copy | hard_copy
        'purpose',
        'preferred_claiming_date',
    ];

    protected function casts(): array
    {
        return [
            'preferred_claiming_date' => 'date',
        ];
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logOnly(['status_id', 'delivery_mode', 'preferred_claiming_date'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function service()
    {
        return $this->belongsTo(RequestService::class, 'service_id');
    }

    /** Current, denormalized status. */
    public function status()
    {
        return $this->belongsTo(RequestStatus::class, 'status_id');
    }

    /** Full transition history, source of truth for the audit trail. */
    public function statusHistory()
    {
        return $this->hasMany(RequestStatusHistory::class)->orderBy('created_at');
    }

    public function internshipDetails()
    {
        return $this->hasOne(InternshipRequestDetail::class);
    }

    public function documents()
    {
        return $this->hasMany(RequestDocument::class);
    }

    public function feedback()
    {
        return $this->hasMany(Feedback::class);
    }

    /**
     * Moves the request to a new status and records the transition.
     * Keeps `status_id` (fast-read) and `request_status_history`
     * (source of truth) in sync in one place.
     */
    public function transitionTo(RequestStatus $newStatus, User $changedBy, ?string $note = null): void
    {
        $this->statusHistory()->create([
            'from_status_id' => $this->status_id,
            'to_status_id' => $newStatus->id,
            'changed_by' => $changedBy->id,
            'note' => $note,
        ]);

        $this->update(['status_id' => $newStatus->id]);
    }
}