<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Course extends Model
{
    protected $fillable = ['code', 'label', 'sort_order'];

    public function users()
    {
        return $this->hasMany(User::class);
    }

    public function majors()
    {
        return $this->hasMany(Major::class);
    }
}
