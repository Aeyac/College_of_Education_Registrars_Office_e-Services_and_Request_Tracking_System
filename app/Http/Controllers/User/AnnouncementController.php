<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnouncementResource;
use App\Models\Announcement;
use Inertia\Inertia;
use Inertia\Response;

class AnnouncementController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('User/Announcements', [
            'userRole' => auth()->user()->displaySubtitle(),
            'announcements' => AnnouncementResource::collection(Announcement::latest()->get())->resolve(),
        ]);
    }
}