<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;

class FilteredWord extends Model
{
    protected $fillable = ['word', 'added_by'];

    protected static function booted(): void
    {
        // Any time the list changes, drop the cached copy so ProfanityFilter
        // picks up the new word list on its very next check — no manual
        // cache-clearing step, no stale filter after an admin edits the list.
        static::saved(fn () => Cache::forget('filtered_words'));
        static::deleted(fn () => Cache::forget('filtered_words'));
    }

    public function addedBy()
    {
        return $this->belongsTo(User::class, 'added_by');
    }
}

//  protected static function booted(): void
//     {
//         static::saved(function () {
//             app(ProfanityFilter::class)->clearCache();
//         });

//         static::deleted(function () {
//             app(ProfanityFilter::class)->clearCache();
//         });
//     }