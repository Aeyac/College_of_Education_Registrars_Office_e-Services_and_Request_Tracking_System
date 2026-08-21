<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable //implements MustVerifyEmail // will enable this once I setup mailtrap for local dev email testing
{
    use HasFactory, Notifiable, SoftDeletes, HasRoles;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password',
        'user_type', // student | alumni | admin
        'student_number',
        'course_id',
        'major_id',
        'year_level',
        'batch_year',
        'contact_number',
    ];
 
    
    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function requests()
    {
        return $this->hasMany(CertificateRequest::class);
    }

    public function alumniVerification()
    {
        return $this->hasOne(AlumniVerification::class);
    }

    public function feedback()
    {
        return $this->hasMany(Feedback::class);
    }

    public function major()
    {
        return $this->belongsTo(Major::class);
    }

    public function course()
    {
        return $this->belongsTo(Course::class);
    }

    public function isAdmin(): bool
    {
        return $this->user_type === 'admin';
    }
}