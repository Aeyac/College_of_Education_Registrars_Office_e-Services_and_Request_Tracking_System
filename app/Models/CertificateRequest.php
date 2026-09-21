<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Support\LogOptions;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class CertificateRequest extends Model
{
    use HasFactory, SoftDeletes, LogsActivity;

    public const DELIVERY_SOFT_COPY = 'soft_copy';
    public const OUTPUT_REQUIRED_STATUSES = ['ready_for_release', 'released'];

    protected $table = 'requests';

    protected $fillable = [
        'user_id',
        'service_id',
        'status_id',
        'delivery_mode', // soft_copy | hard_copy
        'purpose',
        'preferred_claiming_date',
        'archived_at',
        'received_at',
    ];

    protected function casts(): array
    {
        return [
            'preferred_claiming_date' => 'date',
            'archived_at' => 'datetime',
            'received_at' => 'datetime',
        ];
    }

    public function scopeNotArchived($query)
    {
        return $query->whereNull('archived_at');
    }

    public function scopeArchived($query)
    {
        return $query->whereNotNull('archived_at');
    }

    public function isArchived(): bool
    {
        return !is_null($this->archived_at);
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
        // FIX: Explicitly set foreign key to 'request_id'
        return $this->hasMany(RequestStatusHistory::class, 'request_id')->orderBy('created_at');
    }

    public function internshipDetails()
    {
        // FIX: Explicitly set foreign key to 'request_id'
        return $this->hasOne(InternshipRequestDetail::class, 'request_id');
    }

    public function documents()
    {
        // FIX: Explicitly set foreign key to 'request_id'
        return $this->hasMany(RequestDocument::class, 'request_id');
    }

    public function feedback()
    {
        // FIX: Explicitly set foreign key to 'request_id'
        return $this->hasOne(Feedback::class, 'request_id');
    }

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

    public function isCancellable(): bool
    {
        return in_array($this->status?->code, ['submitted'], true); // add your other cancellable codes
    }


    public function outputDocument()
    {
        return $this->hasOne(RequestDocument::class, 'request_id')
            ->where('type', RequestDocument::TYPE_OUTPUT);
    }

    public function isSoftCopy(): bool
    {
        return $this->delivery_mode === self::DELIVERY_SOFT_COPY;
    }

    //Can a soft copy be attached when moving to this status? 
    public function acceptsOutputDocumentFor(string $statusCode): bool
    {
        return $this->isSoftCopy()
            && in_array($statusCode, self::OUTPUT_REQUIRED_STATUSES, true);
    }

    // Must the admin upload one? Only if none exists yet. 
    public function needsOutputDocumentFor(string $statusCode): bool
    {
        return $this->acceptsOutputDocumentFor($statusCode)
            && !$this->outputDocument()->exists();
    }

    // Should the student see the soft copy right now? 
    public function isSoftCopyAvailableToOwner(): bool
    {
        return $this->isSoftCopy()
            && in_array($this->status?->code, self::OUTPUT_REQUIRED_STATUSES, true)
            && $this->outputDocument !== null;
    }

    public function attachOutputDocument(UploadedFile $file, User $uploader): RequestDocument
    {
        $originalName = $file->getClientOriginalName();
        $size = $file->getSize();
        $old = $this->outputDocument;

        // store() generates a random filename, so the client's filename is never used on disk
        $path = $file->store("request-outputs/{$this->id}", 'local');

        try {
            $document = DB::transaction(function () use ($old, $path, $originalName, $size, $uploader) {
                $old?->delete();

                return $this->documents()->create([
                    'type' => RequestDocument::TYPE_OUTPUT,
                    'path' => $path,
                    'original_name' => $originalName,
                    'size' => $size,
                    'uploaded_by' => $uploader->id,
                ]);
            });
        } catch (\Throwable $e) {
            Storage::disk(RequestDocument::DISK)->delete($path); // no orphan file if the DB write fails
            throw $e;
        }

        if ($old) {
            Storage::disk(RequestDocument::DISK)->delete($old->path); // replaced file removed only after success
        }

        return $document;
    }

}