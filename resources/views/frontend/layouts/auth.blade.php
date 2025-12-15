<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="generator" content="Laravel Framework">
    <title>{{ $title ?? 'GeoCRUD' }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f0f2f5;
            min-height: 100vh;
            margin: 0;
            padding: 0;
        }

        .auth-header {
            background: #0d6efd;
            padding: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .auth-header .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .auth-header .logo {
            color: white;
            font-size: 24px;
            font-weight: 600;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .auth-header .header-btn {
            color: white;
            text-decoration: none;
            padding: 8px 20px;
            border: 2px solid white;
            border-radius: 8px;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.3s ease;
        }

        .auth-header .header-btn:hover {
            background: white;
            color: #0d6efd;
        }

        .auth-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: calc(100vh - 70px);
            padding: 40px 20px;
        }

        .auth-card {
            background: white;
            border-radius: 16px;
            padding: 50px 45px;
            width: 100%;
            max-width: 500px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }

        .auth-icon {
            text-align: center;
            font-size: 64px;
            margin-bottom: 20px;
            color: #0d6efd;
        }

        .auth-title {
            text-align: center;
            font-size: 32px;
            font-weight: 700;
            color: #1e293b;
            margin-bottom: 10px;
        }

        .auth-subtitle {
            text-align: center;
            font-size: 15px;
            color: #64748b;
            margin-bottom: 35px;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #2c3e50;
            font-weight: 500;
            font-size: 14px;
        }

        .input-wrapper {
            position: relative;
        }

        .input-icon {
            position: absolute;
            left: 15px;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 18px;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"],
        .form-group input[type="tel"],
        .form-group input[type="file"] {
            width: 100%;
            padding: 12px 15px;
            border: 1px solid #d1d5db;
            border-radius: 8px;
            font-size: 14px;
            transition: all 0.2s ease;
            background: #ffffff;
            color: #2c3e50;
        }

        .form-group input.with-icon {
            padding-left: 45px;
        }

        .form-group input:focus {
            outline: none;
            border-color: #0d6efd;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }

        .form-group input::placeholder {
            color: #9ca3af;
        }

        .forgot-link {
            text-align: right;
            margin-top: 8px;
            margin-bottom: 20px;
        }

        .forgot-link a {
            color: #64748b;
            text-decoration: none;
            font-size: 13px;
            display: inline-flex;
            align-items: center;
            gap: 4px;
        }

        .forgot-link a:hover {
            color: #0d6efd;
        }

        .btn-primary {
            width: 100%;
            padding: 14px;
            background: #0d6efd;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .btn-primary:hover {
            background: #0b5ed7;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
        }

        .btn-primary:active {
            transform: translateY(0);
        }

        .auth-footer {
            text-align: center;
            margin-top: 25px;
            color: #64748b;
            font-size: 14px;
        }

        .auth-footer a {
            color: #0d6efd;
            text-decoration: none;
            font-weight: 500;
        }

        .auth-footer a:hover {
            text-decoration: underline;
        }

        .alert {
            padding: 15px 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-size: 14px;
            font-weight: 400;
        }

        .alert-success {
            background: #d1f4e0;
            color: #0f5132;
            border: 1px solid #a3e1c5;
        }

        .alert-error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .required {
            color: #dc3545;
        }

        small {
            display: block;
            margin-top: 5px;
            color: #6c757d;
            font-size: 13px;
        }

        .profile-preview {
            text-align: center;
            margin: 15px 0;
        }

        .profile-preview img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            object-fit: cover;
            border: 3px solid #e5e7eb;
        }

        @media (max-width: 640px) {
            .auth-card {
                padding: 35px 25px;
            }

            .form-row {
                grid-template-columns: 1fr;
            }

            .auth-title {
                font-size: 28px;
            }
        }
    </style>
    @stack('styles')
</head>
<body>
    <header class="auth-header">
        <div class="container">
            <a href="/" class="logo">
                <span>📍</span> GeoCRUD
            </a>
            @yield('header_action')
        </div>
    </header>

    <div class="auth-container">
        <div class="auth-card">
            @yield('content')
        </div>
    </div>
    
    @stack('scripts')
</body>
</html>

