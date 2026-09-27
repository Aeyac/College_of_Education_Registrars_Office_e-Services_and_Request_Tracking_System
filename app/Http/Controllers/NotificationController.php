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
        return back();
    }
}
