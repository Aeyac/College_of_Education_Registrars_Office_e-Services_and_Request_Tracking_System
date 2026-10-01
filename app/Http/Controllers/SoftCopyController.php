<?php
namespace App\Http\Controllers;

use App\Models\CertificateRequest;
use App\Models\RequestDocument;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;

class SoftCopyController extends Controller
{
    public function show(CertificateRequest $certificateRequest)
    {
        $document = $this->resolve($certificateRequest);

        return Storage::disk(RequestDocument::DISK)->response(
            $document->path,
            $document->original_name ?? 'soft-copy.pdf',
            ['Content-Type' => 'application/pdf', 'X-Content-Type-Options' => 'nosniff'],
            'inline', // opens in the browser
        );
    }

    public function download(CertificateRequest $certificateRequest)
    {
        $document = $this->resolve($certificateRequest);

        return Storage::disk(RequestDocument::DISK)->download(
            $document->path,
            $document->original_name ?? 'soft-copy.pdf',
            ['X-Content-Type-Options' => 'nosniff'],
        );
    }

    private function resolve(CertificateRequest $certificateRequest): RequestDocument
    {
        Gate::authorize('viewSoftCopy', $certificateRequest);

        $document = $certificateRequest->outputDocument;

        abort_unless($document && Storage::disk('local')->exists($document->path), 404);

        return $document;
    }
}