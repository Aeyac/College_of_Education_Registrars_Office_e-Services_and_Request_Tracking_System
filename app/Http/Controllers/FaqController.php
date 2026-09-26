<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;
use Inertia\Inertia;

class FaqController extends Controller
{
    public function index()
    {
        $faqs = Faq::orderBy('sort_order')->orderBy('id')->get();

        return Inertia::render('Admin/Faq', [
            'faqs' => $faqs,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['sort_order'] = $validated['sort_order'] ?? ((int) Faq::max('sort_order') + 1);
        $validated['updated_by'] = $request->user()->id;

        Faq::create($validated);

        return back()->with('success', 'FAQ added.');
    }

    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);

        $validated = $request->validate([
            'question' => ['required', 'string', 'max:500'],
            'answer' => ['required', 'string'],
            'category' => ['nullable', 'string', 'max:100'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['sort_order'] = $validated['sort_order'] ?? $faq->sort_order;
        $validated['updated_by'] = $request->user()->id;

        $faq->update($validated);

        return back()->with('success', 'FAQ updated.');
    }

    public function destroy($id)
    {
        Faq::findOrFail($id)->delete();

        return back()->with('success', 'FAQ removed.');
    }
}