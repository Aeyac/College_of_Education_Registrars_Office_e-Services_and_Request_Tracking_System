<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AlumniVerification extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'document_type', // diploma | tor
        'path',
        'verified_by',
        'verified_at',
        'status', // pending | verified | rejected
    ];

    protected function casts(): array
    {
        return ['verified_at' => 'datetime'];
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function verifiedBy()
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function isVerified(): bool
    {
        return $this->status === 'verified';
    }
}