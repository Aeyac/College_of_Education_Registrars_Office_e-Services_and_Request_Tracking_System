<?php

namespace App\Http\Controllers\User;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAlumniVerificationRequest;
use App\Models\AlumniVerification;
use Illuminate\Http\RedirectResponse;

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
}