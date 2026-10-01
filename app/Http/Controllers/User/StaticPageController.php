<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class StaticPageController extends Controller
{
    public function faq(Request $request): Response
    {
        $search = trim((string) $request->string('search'));

        $faqs = Faq::query()
            ->when($search !== '', fn ($query) => $query->search($search))
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get([
                'id',
                'question',
                'answer',
                'sort_order',
            ]);

        return Inertia::render('User/Faq', [
            'faqs' => $faqs,
            'search' => $search,
        ]);
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
