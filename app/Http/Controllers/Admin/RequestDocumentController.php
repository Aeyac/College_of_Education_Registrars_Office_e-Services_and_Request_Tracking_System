<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CertificateRequest;
use App\Models\RequestDocument;
use Illuminate\Support\Facades\Storage;

class RequestDocumentController extends Controller
{
    public function show(CertificateRequest $certificateRequest, int $document)
    {
        $doc = $this->resolve($certificateRequest, $document);

        return Storage::disk(RequestDocument::DISK)->response(
            $doc->path,
            $doc->original_name ?? basename($doc->path),
            ['X-Content-Type-Options' => 'nosniff'],
            'inline'
        );
    }

    public function download(CertificateRequest $certificateRequest, int $document)
    {
        $doc = $this->resolve($certificateRequest, $document);

        return Storage::disk(RequestDocument::DISK)->download(
            $doc->path,
            $doc->original_name ?? basename($doc->path)
        );
    }

    private function resolve(CertificateRequest $certificateRequest, int $documentId): RequestDocument
    {
        $doc = $certificateRequest->documents()
            ->where('type', RequestDocument::TYPE_REQUIREMENT)
            ->findOrFail($documentId);

        abort_unless(Storage::disk(RequestDocument::DISK)->exists($doc->path), 404);

        return $doc;
    }
}