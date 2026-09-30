<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RequestStatusHistory extends Model
{
    use HasFactory;

    // FIX 1: Explicitly tell Laravel the correct table name
    protected $table = 'request_status_history';
    
    const UPDATED_AT = null; // history rows are never updated, only created

    protected $fillable = [
        'request_id',
        'from_status_id',
        'to_status_id',
        'changed_by',
        'note',
    ];

    public function request()
    {
        // FIX 2: Explicitly define the foreign key
        return $this->belongsTo(CertificateRequest::class, 'request_id');
    }

    public function fromStatus()
    {
        return $this->belongsTo(RequestStatus::class, 'from_status_id');
    }

    public function toStatus()
    {
        return $this->belongsTo(RequestStatus::class, 'to_status_id');
    }

    public function changedBy()
    {
        return $this->belongsTo(User::class, 'changed_by');
    }

    /**
     * The audit trail must still name the actor after their account is
     * soft-deleted, so this relation reaches trashed users.
     *
     * @return BelongsTo<User, $this>
     */
    public function changedByWithTrashed(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by')->withTrashed();
    }
}