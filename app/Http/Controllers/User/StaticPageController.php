<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageController extends Controller
{
    public function faq(): Response
    {
        return Inertia::render('User/Faq');
    }

    public function about(): Response
    {
        return Inertia::render('User/About');
    }

    public function privacy(): Response
    {
        return Inertia::render('User/Privacy');
    }

    public function terms(): Response
    {
        return Inertia::render('User/Terms');
    }
}