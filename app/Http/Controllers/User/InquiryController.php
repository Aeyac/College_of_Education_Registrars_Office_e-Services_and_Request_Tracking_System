<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\InquiryMessageResource;
use App\Models\Inquiry;
use App\Models\InquiryMessage;
use App\Rules\NotProfane;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class InquiryController extends Controller
{
    public function index(): Response
    {
        $inquiries = Inquiry::with(['messages.user', 'messages.parent.user'])
            ->where('user_id', auth()->id())
            ->latest('updated_at')
            ->get()
            ->map(fn (Inquiry $inq) => [
                'id' => $inq->id,
                'subject' => $inq->subject,
                'status' => $inq->status,
                'is_read' => $inq->is_read_by_user,
                'date' => $inq->created_at->format('M d, Y h:i A'),
                'messages' => InquiryMessageResource::collection($inq->messages)->resolve(),
            ]);

        return Inertia::render('User/Inquiries', [
            'userRole' => auth()->user()->displaySubtitle(),
            'inquiries' => $inquiries,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'subject' => ['required', 'string', 'max:255', new NotProfane],
            'message' => ['required', 'string', 'max:2000', new NotProfane],
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,docx|max:10240',
        ]);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('inquiries', 'public');
        }

        \Illuminate\Support\Facades\DB::transaction(function () use ($data, $path) {
            $inquiry = Inquiry::create([
                'user_id' => auth()->id(),
                'subject' => $data['subject'],
                'status' => 'open',
                'is_read_by_user' => true,
                'is_read_by_admin' => false,
            ]);

            $inquiry->messages()->create([
                'user_id' => auth()->id(),
                'message' => $data['message'],
                'attachment_path' => $path,
            ]);
        });

        return redirect()->route('user.inquiries')->with('success', 'Inquiry thread started successfully.');
    }

    public function reply(Request $request, $id): RedirectResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000', new NotProfane],
            'parent_id' => 'nullable|exists:inquiry_messages,id',
            'attachment' => 'nullable|file|mimes:jpeg,png,jpg,pdf,docx|max:10240',
        ]);

        $inquiry = Inquiry::where('user_id', auth()->id())->findOrFail($id);

        $path = null;
        if ($request->hasFile('attachment')) {
            $path = $request->file('attachment')->store('inquiries', 'public');
        }

        $inquiry->messages()->create([
            'user_id' => auth()->id(),
            'message' => $data['message'],
            'parent_id' => $data['parent_id'] ?? null,
            'attachment_path' => $path,
        ]);

        $inquiry->update([
            'is_read_by_user' => true,
            'is_read_by_admin' => false,
        ]);

        return back()->with('success', 'Reply sent.');
    }

    public function updateMessage(Request $request, $id): RedirectResponse
    {
        $data = $request->validate([
            'message' => ['required', 'string', 'max:2000', new NotProfane],
        ]);

        // Scoped to the owner — a student may only edit their own messages.
        $message = InquiryMessage::where('user_id', auth()->id())->findOrFail($id);
        $message->update([
            'message' => $data['message'],
            'is_edited' => true,
        ]);

        return back();
    }

    public function destroyMessage($id): RedirectResponse
    {
        $message = InquiryMessage::where('user_id', auth()->id())->findOrFail($id);

        if ($message->inquiry->messages()->count() <= 1) {
            $message->inquiry->delete();
        } else {
            $message->delete();
        }

        return back();
    }

    public function markRead($id): RedirectResponse
    {
        Inquiry::where('user_id', auth()->id())->findOrFail($id)->update(['is_read_by_user' => true]);
        return back();
    }

    public function markUnread($id): RedirectResponse
    {
        Inquiry::where('user_id', auth()->id())->findOrFail($id)->update(['is_read_by_user' => false]);
        return back();
    }

    public function destroy($id): RedirectResponse
    {
        Inquiry::where('user_id', auth()->id())->findOrFail($id)->delete();
        return back()->with('success', 'Inquiry deleted successfully.');
    }
}