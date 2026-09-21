<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class RequestDocument extends Model
{
    use HasFactory;

    public const TYPE_OUTPUT = 'output';
    public const DISK = 'private';

    protected $fillable = [
        'request_id',
        'type',
        'path',
        'original_name',
        'size',
        'uploaded_by',
        'verified_by',
        'verified_at',
    ];

    protected $hidden = ['path'];

    protected function casts(): array
    {
        return ['verified_at' => 'datetime'];
    }

    public function request()
    {
        return $this->belongsTo(CertificateRequest::class);
    }

    public function uploadedBy()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    /** Signed/temporary download URL rather than exposing the raw path. */
    public function downloadUrl(): string
    {
        return Storage::temporaryUrl($this->path, now()->addMinutes(10));
    }
}