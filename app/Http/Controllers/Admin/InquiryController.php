<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\InquiryMessageResource;
use App\Models\Inquiry;
use App\Models\InquiryMessage;
use App\Notifications\InquiryReplied;
use App\Rules\NotProfane;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class InquiryController extends Controller
{
    /**
     * Display all inquiries for the admin.
     */
    public function inquiries()
    {
        $inquiries = Inquiry::with([
                'user',
                'messages.user',
                'messages.parent.user',
            ])
            ->latest('updated_at')
            ->get()
            ->map(fn ($inquiry) => [
                'id' => $inquiry->id,

                'student_name' => $inquiry->user
                    ? $inquiry->user->first_name . ' ' . $inquiry->user->last_name
                    : 'Unknown',

                'email' => $inquiry->user->email ?? 'N/A',

                'subject' => $inquiry->subject,

                'status' => $inquiry->status,

                'is_read' => $inquiry->is_read_by_admin,

                'date' => $inquiry->created_at->format('M d, Y h:i A'),

                'messages' => InquiryMessageResource::collection(
                    $inquiry->messages
                )->resolve(),
            ]);

        return Inertia::render('Admin/Inquiries', [
            'inquiries' => $inquiries,
        ]);
    }

    /**
     * Reply to an inquiry.
     */
    public function replyInquiry(Request $request, $id): RedirectResponse
    {
        $data = $request->validate([
            'message' => [
                'required',
                'string',
                'max:3000',
                new NotProfane,
            ],

            'parent_id' => [
                'nullable',
                'exists:inquiry_messages,id',
            ],

            'attachment' => [
                'nullable',
                'file',
                'mimes:jpeg,png,jpg,pdf,docx',
                'max:10240',
            ],
        ]);

        $inquiry = Inquiry::with('user')->findOrFail($id);

        $path = null;

        if ($request->hasFile('attachment')) {
            $path = $request
                ->file('attachment')
                ->store('inquiries', 'public');
        }

        $inquiry->messages()->create([
            'user_id' => auth()->id(),
            'message' => $data['message'],
            'parent_id' => $data['parent_id'] ?? null,
            'attachment_path' => $path,
        ]);

        $inquiry->update([
            'is_read_by_user' => false,
            'is_read_by_admin' => true,
        ]);

        if ($inquiry->user) {
            $inquiry->user->notify(
                new InquiryReplied($inquiry)
            );
        }

        return back()->with(
            'success',
            'Reply sent successfully.'
        );
    }

    /**
     * Edit an existing inquiry message.
     */
    public function editMessage(
        Request $request,
        $id
    ): RedirectResponse {
        $data = $request->validate([
            'message' => [
                'required',
                'string',
                'max:2000',
                new NotProfane,
            ],
        ]);

        $message = InquiryMessage::findOrFail($id);

        // Admins may edit any message for moderation purposes.
        $message->update([
            'message' => $data['message'],
            'is_edited' => true,
        ]);

        return back();
    }

    /**
     * Delete an inquiry message.
     *
     * If it is the only message in the inquiry,
     * delete the entire inquiry instead.
     */
    public function deleteMessage($id): RedirectResponse
    {
        $message = InquiryMessage::findOrFail($id);

        if ($message->inquiry->messages()->count() <= 1) {
            $message->inquiry->delete();
        } else {
            $message->delete();
        }

        return back();
    }

    /**
     * Update the status of an inquiry.
     */
    public function updateInquiryStatus(
        Request $request,
        $id
    ): RedirectResponse {
        $data = $request->validate([
            'status' => [
                'required',
                'in:open,pending,resolved,closed',
            ],
        ]);

        Inquiry::findOrFail($id)->update([
            'status' => $data['status'],
        ]);

        return back()->with(
            'success',
            'Inquiry status updated.'
        );
    }

    /**
     * Mark an inquiry as read by the admin.
     */
    public function markInquiryRead($id): RedirectResponse
    {
        Inquiry::findOrFail($id)->update([
            'is_read_by_admin' => true,
        ]);

        return back();
    }

    /**
     * Mark an inquiry as unread by the admin.
     */
    public function markInquiryUnread($id): RedirectResponse
    {
        Inquiry::findOrFail($id)->update([
            'is_read_by_admin' => false,
        ]);

        return back();
    }

    /**
     * Delete an entire inquiry.
     */
    public function deleteInquiry($id): RedirectResponse
    {
        Inquiry::findOrFail($id)->delete();

        return back()->with(
            'success',
            'Inquiry deleted successfully.'
        );
    }
}
