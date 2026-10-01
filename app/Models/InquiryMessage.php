<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InquiryMessage extends Model
{
    use HasFactory;

    // Idinagdag ang 'attachment_path' sa fillable
    protected $fillable = ['inquiry_id', 'user_id', 'parent_id', 'message', 'attachment_path', 'is_edited'];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function inquiry()
    {
        return $this->belongsTo(Inquiry::class);
    }

    public function parent()
    {
        return $this->belongsTo(InquiryMessage::class, 'parent_id');
    }
}