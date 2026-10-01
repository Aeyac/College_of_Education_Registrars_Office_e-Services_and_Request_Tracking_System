<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InternshipRequestDetail extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'internship_school_or_agency',
        'grade_level_handled',
        'semester',
        'school_year',
    ];

    public function request()
    {
        return $this->belongsTo(CertificateRequest::class);
    }
}