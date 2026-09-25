<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFilteredWordRequest;
use App\Models\FilteredWord;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class FilteredWordController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Admin/FilteredWords', [
            'words' => FilteredWord::with('addedBy:id,first_name,last_name')
                ->orderBy('word')
                ->get()
                ->map(fn(FilteredWord $w) => [
                    'id' => $w->id,
                    'word' => $w->word,
                    'added_by' => $w->addedBy?->first_name ?? 'System',
                    'created_at' => $w->created_at->format('M d, Y'),
                ]),
        ]);
    }

    public function store(StoreFilteredWordRequest $request): RedirectResponse
    {
        FilteredWord::create([
            'word' => $request->validated('word'),
            'added_by' => auth()->id(),
        ]);

        return back()->with('success', 'Word added to filter.');
    }

    public function destroy(FilteredWord $filteredWord): RedirectResponse
    {
        $filteredWord->delete();

        return back()->with('success', 'Word removed from filter.');
    }
}