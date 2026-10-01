<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAlumniIsVerified
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && $user->user_type === 'alumni' && !$user->isVerifiedAlumni()) {
            return redirect()->route('user.pending-verification');
        }

        return $next($request);
    }
}