<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestService extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'label', 'sort_order', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function requests()
    {
        return $this->hasMany(CertificateRequest::class, 'service_id');
    }

    /** Convenience accessor, e.g. RequestService::isInternshipCode('internship_certificate') */
    public function isInternshipCertificate(): bool
    {
        return $this->code === 'internship_certificate';
    }
}