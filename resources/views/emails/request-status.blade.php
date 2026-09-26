@php
    $code = $certRequest->status->code ?? '';
    $isHardCopy = $certRequest->delivery_mode === 'hard_copy';

    $themes = [
        'processing' => [
            'label' => 'Processing',
            'color' => '#2563eb',
            'bg' => '#eff6ff',
            'heading' => 'Your request is being processed',
            'message' => "The registrar's office has started working on your request. We'll email you again once there's an update.",
        ],
        'ready_for_release' => [
            'label' => 'Ready for Release',
            'color' => '#ca8a04',
            'bg' => '#fefce8',
            'heading' => 'Your document is ready',
            'message' => $isHardCopy
                ? "Your document is ready. Please visit the registrar's office to claim your hard copy."
                : 'Your document is ready and will be released to you shortly.',
        ],
        'released' => [
            'label' => 'Released',
            'color' => '#059669',
            'bg' => '#ecfdf5',
            'heading' => 'Your document has been released',
            'message' => 'Your request is complete and your document has been released. Thank you for using our service.',
        ],
        'rejected' => [
            'label' => 'Rejected',
            'color' => '#dc2626',
            'bg' => '#fef2f2',
            'heading' => 'Your request was rejected',
            'message' => "We're sorry, but your request could not be approved. Please review the remarks below or contact the registrar's office for clarification.",
        ],
        'for_compliance' => [
            'label' => 'For Compliance',
            'color' => '#ea580c',
            'bg' => '#fff7ed',
            'heading' => 'Action needed on your request',
            'message' => "Additional requirements are needed before we can continue. Please review the remarks below and coordinate with the registrar's office so processing can continue.",
        ],
    ];

    $theme = $themes[$code] ?? [
        'label' => $certRequest->status->label ?? 'Updated',
        'color' => '#475569',
        'bg' => '#f1f5f9',
        'heading' => 'Your request status was updated',
        'message' => 'The status of your certificate request has changed.',
    ];
@endphp
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Certificate Request: {{ $theme['label'] }}</title>
</head>

<body style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px;">
    <h2>{{ $theme['heading'] }}</h2>

    <p>Hello {{ $certRequest->user->first_name }}, here's the latest on your certificate request:</p>

    <h1
        style="font-size: 28px; letter-spacing: 4px; text-transform: uppercase; color: {{ $theme['color'] }}; background: {{ $theme['bg'] }}; padding: 20px 30px; border-radius: 10px; display: inline-block;">
        {{ $theme['label'] }}
    </h1>

    <p style="max-width: 480px; margin: 20px auto;">{{ $theme['message'] }}</p>

    @if ($code === 'ready_for_release' && $isHardCopy)
        <div style="max-width: 480px; margin: 0 auto 20px; text-align: left; background: #fffbeb; border: 1px solid #fcd34d; border-radius: 6px; padding: 14px 18px; font-size: 14px; color: #92400e;">
            <strong style="color: #b45309;">Claiming Requirements:</strong><br>
            <ul style="margin: 8px 0 0; padding-left: 20px;">
                <li style="margin-bottom: 6px;"><strong>If you (the requester) will claim:</strong> Please present any valid ID.</li>
                <li><strong>If an authorized person will claim:</strong> They must present:
                    <ul style="margin-top: 4px; padding-left: 20px;">
                        <li>Your valid ID (the requester)</li>
                        <li>Any valid ID of the authorized person with 3 specimen signatures</li>
                        <li>An Authorization Letter</li>
                    </ul>
                </li>
            </ul>
        </div>
    @endif

    @if (!empty($note))
        <div
            style="max-width: 480px; margin: 0 auto 20px; text-align: left; background: {{ $theme['bg'] }}; border-left: 4px solid {{ $theme['color'] }}; border-radius: 6px; padding: 14px 18px; font-size: 14px;">
            <strong style="color: {{ $theme['color'] }};">Remarks</strong><br>
            {!! nl2br(e($note)) !!}
        </div>
    @endif

    <table
        style="margin: 0 auto 20px; width: 100%; max-width: 480px; text-align: left; font-size: 14px; background: #f8fafc; border-top: 4px solid {{ $theme['color'] }}; border-radius: 6px; padding: 10px 18px;"
        cellpadding="6" cellspacing="0">
        <tr>
            <td style="color: #64748b;">Request ID</td>
            <td style="text-align: right; font-weight: bold;">#{{ $certRequest->id }}</td>
        </tr>
        <tr>
            <td style="color: #64748b;">Document</td>
            <td style="text-align: right; font-weight: bold;">{{ $certRequest->service->label ?? 'Document' }}</td>
        </tr>
        <tr>
            <td style="color: #64748b;">Delivery</td>
            <td style="text-align: right; font-weight: bold;">{{ $isHardCopy ? 'Hard Copy' : 'Soft Copy' }}</td>
        </tr>
        <tr>
            <td style="color: #64748b;">Status</td>
            <td style="text-align: right; font-weight: bold; color: {{ $theme['color'] }};">{{ $theme['label'] }}</td>
        </tr>
    </table>

    <p style="color: #64748b; font-size: 14px;">This is an automated message from {{ config('app.name') }}. Please do
        not reply to this email.</p>
</body>

</html>