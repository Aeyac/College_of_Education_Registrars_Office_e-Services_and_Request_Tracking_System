<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasFactory, Notifiable, SoftDeletes, HasRoles;

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'profile_picture', // Added Field
        'password',
        'user_type',
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




    public function displaySubtitle(): string
    {
        $this->loadMissing('course');

        if ($this->user_type === 'alumni') {
            return 'Alumni   Batch ' . ($this->batch_year ?? 'N/A');
        }

        $courseName = $this->course?->label ?? 'College of Education';
        $yearLevel = $this->year_level;

        $suffix = match ($yearLevel) {
            1 => 'st',
            2 => 'nd',
            3 => 'rd',
            default => 'th',
        };

        return $courseName . '   ' . ($yearLevel ? $yearLevel . $suffix . ' Year' : 'N/A');
    }

    public function isVerifiedAlumni(): bool
    {
        if ($this->user_type !== 'alumni') {
            return false;
        }

        return AlumniVerification::where('user_id', $this->id)
            ->where('status', 'verified')
            ->exists();
    }
}
