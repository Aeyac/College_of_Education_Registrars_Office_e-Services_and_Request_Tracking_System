<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreFeedbackRequest;
use App\Models\CertificateRequest;
use App\Models\Feedback;
use App\Models\User;
use App\Notifications\FeedbackSubmitted;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Notification;
use Inertia\Inertia;
use Inertia\Response;

class FeedbackController extends Controller
{
    public function storeFeedback(StoreFeedbackRequest $feedbackRequest, $id)
    {
        $certificateRequest = CertificateRequest::findOrFail($id);

        abort_if(
            $certificateRequest->feedback()->exists(),
            403,
            "This request already has recorded feedback."
        );

        $data = $feedbackRequest->validated();

        $feedback = Feedback::create([
            'request_id' => $certificateRequest->id,
            'user_id' => auth()->id(),
            'rating' => $data['rating'],
            'comments' => $data['comments'] ?? null,
        ]);

        // Alert admins about the new feedback. The row is already committed at
        // this point, so a notification failure must not lose the submission.
        try {
            Notification::send(
                User::role('admin')->get(),
                new FeedbackSubmitted($feedback->load(['user', 'request.service']))
            );
        } catch (\Throwable $e) {
            report($e);
        }

        return back()->with('success', 'Feedback recorded successfully.');
    }
}