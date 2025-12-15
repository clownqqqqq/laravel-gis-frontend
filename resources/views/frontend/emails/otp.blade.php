<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .otp-code { background: #fff; border: 2px dashed #667eea; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #667eea; margin: 20px 0; border-radius: 5px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Account Activation</h1>
        <p>GeoCRUD - GIS Manager</p>
    </div>
    <div class="content">
        <h2>Welcome {{ $username }}!</h2>
        <p>Thank you for registering with GeoCRUD. To activate your account, please use the OTP code below:</p>
        <div class="otp-code">{{ $otpCode }}</div>
        <div class="warning"><strong>Important:</strong> This code will expire in <strong>15 minutes</strong>.</div>
        <div style="text-align: center; margin: 30px 0;">
            <a href="{{ $activationUrl }}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                Verify OTP Code
            </a>
        </div>
        <p style="text-align: center; margin-bottom: 15px; color: #666; font-size: 14px;">Click the button above or enter the code on the verification page to activate your account.</p>
        <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
        <p style="font-size: 13px; color: #666; text-align: center; margin-top: 15px;">If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>The GeoCRUD Team</p>
    </div>
</body>
</html>

