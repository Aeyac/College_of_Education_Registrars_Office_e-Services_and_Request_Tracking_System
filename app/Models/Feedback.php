<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Feedback extends Model
{
    use HasFactory;

    const UPDATED_AT = null; // one-way submissions are never edited after the fact

    protected $fillable = ['request_id', 'user_id', 'rating', 'comments'];

    public function request()
    {
        return $this->belongsTo(CertificateRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}