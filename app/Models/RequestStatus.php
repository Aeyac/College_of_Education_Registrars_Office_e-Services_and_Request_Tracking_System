<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RequestStatus extends Model
{
    use HasFactory;

    protected $fillable = ['code', 'label', 'sort_order'];

    public function requests()
    {
        return $this->hasMany(CertificateRequest::class, 'status_id');
    }
}