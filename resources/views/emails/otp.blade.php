<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your Security Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #e2e8f0; padding: 40px 20px;">
        <tr>
            <td align="center">
                <!-- Main Email Card with Faux Shadow (Thick Bottom Border) -->
                <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; border: 1px solid #cbd5e1; border-bottom: 4px solid #cbd5e1; overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td align="center" style="padding: 32px 40px 20px; background-color: #ffffff;">
                            <h2 style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a; letter-spacing: -0.5px;">CED E-Services</h2>
                        </td>
                    </tr>
                    <!-- Content -->
                    <tr>
                        <td align="center" style="padding: 0 40px 32px;">
                            <h3 style="margin: 0 0 12px; font-size: 18px; font-weight: 700; color: #1e293b;">Verify Your Email Address</h3>
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 24px; color: #475569;">
                                Thank you for registering. Please use the following 6-digit security code to complete your account setup:
                            </p>
                            
                            <!-- OTP Box (Darkened dashed border for depth) -->
                            <div style="background-color: #f8fafc; border: 2px dashed #94a3b8; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
                                <h1 style="margin: 0; font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #ca8a04; text-align: center;">
                                    {{ $otp }}
                                </h1>
                            </div>
                            
                            <!-- Warning Note (Added left border for depth) -->
                            <p style="margin: 0; font-size: 13px; line-height: 20px; color: #475569; background-color: #f1f5f9; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #94a3b8; text-align: left;">
                                <strong>Note:</strong> This code is valid for 10 minutes. Do not share this code with anyone.
                            </p>
                        </td>
                    </tr>
                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 24px 40px; background-color: #f8fafc; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0; font-size: 12px; line-height: 18px; color: #64748b;">
                                This is an automated message from the College of Education Registrar Office e-Services. Please do not reply to this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>