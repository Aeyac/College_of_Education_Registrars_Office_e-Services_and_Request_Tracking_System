<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function markNotificationsAsRead(): RedirectResponse
    {
        auth()->user()->unreadNotifications->markAsRead();
        return back();
    }

    public function markNotificationAsRead($id): RedirectResponse
    {
        $notification = auth()->user()->notifications()->findOrFail($id);
        $notification->markAsRead();

        $data = $notification->data;
        $link = $data['link'] ?? null;

        if ($link && !empty($data['request_id']) && str_starts_with($link, '/user/dashboard')) {
            $link = route('user.requests', ['highlight' => $data['request_id']], absolute: false);
        }

        return $link ? redirect($link) : back();
    }
}