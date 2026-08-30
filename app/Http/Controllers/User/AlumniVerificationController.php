<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAlumniVerificationRequest;
use App\Models\AlumniVerification;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class AlumniVerificationController extends Controller
{
    public function store(StoreAlumniVerificationRequest $request): RedirectResponse
    {
        $path = $request->file('file')->store('alumni_proofs', 'public');

        AlumniVerification::updateOrCreate(
            ['user_id' => $request->user()->id],
            [
                'document_type' => $request->validated('document_type'),
                'path' => $path,
                'status' => 'pending',
            ]
        );

        return back()->with('success', 'Verification proof uploaded successfully.');
    }

    public function pending()
    {
        $user = auth()->user();

        if ($user->isVerifiedAlumni()) {
            return redirect()->route('user.dashboard');
        }

        $verification = $user->alumniVerification;

        return Inertia::render('User/AlumniPending', [
            'submittedAt' => $verification->created_at
                ->timezone('Asia/Manila')
                ->format('M d, Y h:i A'),
            'proofFileName' => basename($verification->proof_path),
        ]);
    }


}