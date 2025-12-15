<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 15px 30px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
        .url-box { background: #fff; border: 1px solid #ddd; padding: 15px; margin: 15px 0; word-break: break-all; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>🔐 Password Reset Request</h1>
        <p>GeoCRUD - GIS Manager</p>
    </div>
    <div class="content">
        <h2>Hello {{ $username }}!</h2>
        <p>We received a request to reset your password. Click the button below to reset your password:</p>
        <div style="text-align: center; margin: 20px 0;">
            <a href="{{ $resetUrl }}" class="button">🔐 Reset Password</a>
        </div>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 13px; color: #666;">Or copy and paste this URL into your browser:</p>
        <div class="url-box">{{ $resetUrl }}</div>
        <div class="warning"><strong>⚠️ Important:</strong> This link will expire in <strong>1 hour</strong>.</div>
        <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
        <p>Best regards,<br>The GeoCRUD Team</p>
    </div>
</body>
</html>

