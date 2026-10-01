<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        body {
            font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            background-color: #f8fafc; /* Tailwind slate-50 */
            margin: 0;
            padding: 40px 20px;
        }
        .container {
            max-width: 500px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 24px;
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
            overflow: hidden;
            text-align: center;
        }
        .content {
            padding: 40px 30px;
        }
        .header-title {
            font-size: 24px;
            font-weight: 800;
            color: #0f172a; /* Tailwind slate-900 */
            margin-bottom: 24px;
        }
        .sub-title {
            font-size: 18px;
            font-weight: 600;
            color: #1e293b; /* Tailwind slate-800 */
            margin-bottom: 16px;
        }
        .text {
            font-size: 15px;
            color: #475569; /* Tailwind slate-600 */
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .button-container {
            margin: 32px 0;
        }
        .button {
            display: inline-block;
            background-color: #facc15; /* Tailwind yellow-400 */
            color: #020617; /* Tailwind slate-950 */
            font-weight: bold;
            font-size: 16px;
            text-decoration: none;
            padding: 16px 36px;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(250, 204, 21, 0.2);
        }
        .note {
            background-color: #f8fafc; /* Tailwind slate-50 */
            border: 1px solid #e2e8f0; /* Tailwind slate-200 */
            border-radius: 16px;
            padding: 20px;
            font-size: 13px;
            color: #64748b; /* Tailwind slate-500 */
            margin-bottom: 10px;
            line-height: 1.5;
        }
        .footer {
            background-color: #f8fafc;
            padding: 24px 30px;
            font-size: 12px;
            color: #94a3b8; /* Tailwind slate-400 */
            border-top: 1px solid #f1f5f9;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="content">
            <!-- Header Title -->
            <div class="header-title">CED E-Services</div>
            
            <!-- Subtitle -->
            <div class="sub-title">Reset Your Password</div>
            
            <!-- Body Text -->
            <div class="text">
                You are receiving this email because we received a password reset request for your account. Click the button below to set up a new password.
            </div>
            
            <!-- Action Button -->
            <div class="button-container">
                <a href="{{ $url }}" class="button" style="color: #020617 !important; text-decoration: none;">Reset Password</a>
            </div>
            
            <!-- Security Note mimicking the OTP box container -->
            <div class="note">
                <strong>Note:</strong> This password reset link will expire in 60 minutes.<br>
                If you did not request a password reset, no further action is required.
            </div>
        </div>
        
        <!-- Automated Footer -->
        <div class="footer">
            This is an automated message from the College of Education Registrar Office e-Services. Please do not reply to this email.
        </div>
    </div>
</body>
</html>