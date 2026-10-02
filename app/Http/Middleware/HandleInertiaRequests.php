<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'role' => $request->user()?->user_type,
                'notifications' => fn() => $request->user()
                    ? $request->user()->notifications()->latest()->take(10)->get()
                    : [],
                'unreadNotificationsCount' => fn() => $request->user()
                    ? $request->user()->unreadNotifications()->count()
                    : 0,
            ],
            // Kept as closures so partial reloads (e.g. the notification poll,
            // which only asks for 'auth') never carry a stale flash.
            'flash' => [
                'success' => fn() => $request->session()->get('success'),
                'error' => fn() => $request->session()->get('error'),
            ],
        ];
    }
}