@php
    $isVerified = $verification->status === 'verified';
@endphp
<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Alumni Verification {{ $isVerified ? 'Approved' : 'Rejected' }}</title>
</head>

<body style="font-family: Arial, sans-serif; text-align: center; color: #333; padding: 20px;">
    <h2>Alumni Verification Update</h2>

    <p>Hello {{ $verification->user->first_name }}, your alumni verification request has been reviewed:</p>

    <h1
        style="font-size: 28px; letter-spacing: 4px; text-transform: uppercase; color: {{ $isVerified ? '#059669' : '#dc2626' }}; background: {{ $isVerified ? '#ecfdf5' : '#fef2f2' }}; padding: 20px 30px; border-radius: 10px; display: inline-block;">
        {{ $isVerified ? 'Approved' : 'Rejected' }}
    </h1>

    @if ($isVerified)
        <p>Your proof has been verified. You now have access to alumni services, including certificate requests.</p>
    @else
        <p>Your submitted alumni proof was not approved. Please review your submitted information and contact the
            registrar's office for clarification or help with resubmitting your proof.</p>
    @endif

    <p style="color: #64748b; font-size: 14px;">This is an automated message from College of Education Registrar’s
        Office e-Services and Request
        Tracking System. Please do not reply to this email.
    </p>
</body>

</html>