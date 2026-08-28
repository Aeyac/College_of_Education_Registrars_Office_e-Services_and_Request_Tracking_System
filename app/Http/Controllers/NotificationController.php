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
}
