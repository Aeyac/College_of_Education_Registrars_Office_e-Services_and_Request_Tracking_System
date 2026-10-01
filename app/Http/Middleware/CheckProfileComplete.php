<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckProfileComplete
{
    public function handle(Request $request, Closure $next)
    {
        if (auth()->check() && is_null(auth()->user()->user_type)) {
            return redirect()->route('profile.complete');
        }

        return $next($request);
    }
}