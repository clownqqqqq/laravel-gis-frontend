<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, shrink-to-fit=no">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <meta name="generator" content="Laravel Framework">
    <meta name="mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="default">
    <title>{{ $title ?? 'GIS Manager' }}</title>
    
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
            color: #2c3e50;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            -webkit-tap-highlight-color: transparent;
        }

        /* Prevent text size adjustment on iOS */
        input, textarea, select {
            font-size: 16px !important;
        }

        /* Force responsive behavior */
        * {
            max-width: 100%;
        }

        img {
            max-width: 100%;
            height: auto;
        }

        .main-container {
            min-height: 100vh;
        }

        .top-nav {
            background: #0d6efd;
            padding: 15px 0;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }

        .top-nav .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
        }

        .top-nav .logo {
            color: white;
            font-size: 24px;
            font-weight: 600;
            text-decoration: none;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .top-nav .nav-buttons {
            display: flex;
            gap: 10px;
            align-items: center;
            flex-wrap: wrap;
        }

        .top-nav .nav-btn {
            color: white;
            text-decoration: none;
            padding: 8px 20px;
            border: 2px solid white;
            border-radius: 8px;
            font-weight: 500;
            font-size: 15px;
            transition: all 0.3s ease;
            background: transparent;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .top-nav .nav-btn:hover {
            background: white;
            color: #0d6efd;
        }

        .content-area {
            padding: 40px 20px;
        }

        .container {
            width: 100%;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0;
        }

        .card {
            background: #ffffff;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
            border: none;
            margin-bottom: 20px;
        }

        h1 {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 20px;
            color: #1e293b;
        }

        .subtitle {
            font-size: 16px;
            color: #64748b;
            margin-bottom: 30px;
        }

        .form-group {
            margin-bottom: 24px;
        }

        .form-group label {
            display: block;
            margin-bottom: 10px;
            font-weight: 600;
            color: #1e293b;
            font-size: 16px;
        }

        .form-group input[type="text"],
        .form-group input[type="email"],
        .form-group input[type="password"],
        .form-group input[type="tel"],
        .form-group input[type="number"],
        .form-group input[type="file"],
        .form-group textarea,
        .form-group select {
            width: 100%;
            padding: 16px 18px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 16px;
            font-family: inherit;
            background: #ffffff;
            color: #1e293b;
            transition: all 0.3s ease;
            -webkit-appearance: none;
            appearance: none;
        }

            .form-group input[type="file"] {
                padding: 12px;
                cursor: pointer;
                min-height: 48px;
            }

            /* Better file input styling for mobile */
            .form-group input[type="file"]::-webkit-file-upload-button {
                padding: 10px 20px;
                background: #0d6efd;
                color: white;
                border: none;
                border-radius: 6px;
                font-size: 15px;
                font-weight: 500;
                cursor: pointer;
                margin-right: 12px;
            }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
            outline: none;
            border-color: #0d6efd;
            box-shadow: 0 0 0 3px rgba(13, 110, 253, 0.1);
        }

        .form-group input::placeholder {
            color: #94a3b8;
            font-size: 15px;
        }

        .form-group small {
            display: block;
            margin-top: 8px;
            color: #64748b;
            font-size: 14px;
        }

        .btn {
            display: inline-block;
            padding: 16px 32px;
            background: #0d6efd;
            color: white;
            text-decoration: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            border: none;
            min-height: 52px;
            text-align: center;
            -webkit-tap-highlight-color: transparent;
        }

        .btn:hover {
            background: #0b5ed7;
            transform: translateY(-1px);
            box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
        }

        .btn:active {
            transform: translateY(0);
        }

        .alert {
            padding: 18px 24px;
            border-radius: 10px;
            margin-bottom: 24px;
            font-size: 16px;
            line-height: 1.5;
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

        .alert-info {
            background: #d1ecf1;
            color: #0c5460;
            border: 1px solid #b8d4da;
        }

        .link {
            color: #0d6efd;
            text-decoration: none;
            font-weight: 500;
        }

        .link:hover {
            text-decoration: underline;
        }

        .profile-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            object-fit: cover;
            margin-right: 5px;
            border: 2px solid white;
            cursor: pointer;
            flex-shrink: 0;
        }

        .profile-avatar-placeholder {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.2);
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: 5px;
            border: 2px solid white;
            cursor: pointer;
            flex-shrink: 0;
        }

        .profile-avatar-placeholder span {
            font-size: 20px;
        }

        /* Responsive Design */
        @media screen and (max-width: 768px) {
            .content-area {
                padding: 20px 15px !important;
            }

            .container {
                padding: 0 15px !important;
            }

            .card {
                padding: 20px !important;
                border-radius: 12px;
                margin-bottom: 16px;
            }

            h1 {
                font-size: 28px !important;
                margin-bottom: 16px !important;
                line-height: 1.3;
            }

            .subtitle {
                font-size: 15px !important;
                margin-bottom: 24px !important;
            }

            .form-group {
                margin-bottom: 20px !important;
            }

            .form-group label {
                font-size: 15px !important;
                margin-bottom: 8px !important;
            }

            .form-group input[type="text"],
            .form-group input[type="email"],
            .form-group input[type="password"],
            .form-group input[type="tel"],
            .form-group input[type="number"],
            .form-group input[type="file"],
            .form-group textarea,
            .form-group select {
                padding: 14px 16px !important;
                font-size: 16px !important; /* Prevent zoom on iOS */
                border-radius: 8px;
                width: 100% !important;
            }

            .btn {
                padding: 14px 24px !important;
                font-size: 16px !important;
                min-height: 48px !important;
                width: 100% !important;
                max-width: 100% !important;
                display: block !important;
            }

            .alert {
                padding: 16px 20px !important;
                font-size: 15px !important;
            }

            .top-nav {
                padding: 12px 0 !important;
            }

            .top-nav .container {
                padding: 0 15px !important;
                flex-direction: row;
                flex-wrap: wrap;
            }

            .top-nav .logo {
                font-size: 18px !important;
                margin-bottom: 0;
                flex: 1 1 auto;
            }

            .top-nav .nav-buttons {
                gap: 6px !important;
                width: 100%;
                justify-content: flex-end;
                margin-top: 10px;
                flex: 0 0 auto;
                flex-wrap: wrap;
            }
            
            .top-nav .nav-btn {
                padding: 8px 14px !important;
                font-size: 13px !important;
                flex: 0 0 auto;
                white-space: nowrap;
            }

            .top-nav .nav-btn span {
                font-size: 14px !important;
            }

            /* Stack navigation buttons on very small screens */
            @media screen and (max-width: 360px) {
                .top-nav .nav-buttons {
                    flex-direction: column;
                    width: 100%;
                }

                .top-nav .nav-btn {
                    width: 100%;
                    justify-content: center;
                }
            }

            .profile-avatar,
            .profile-avatar-placeholder {
                width: 32px !important;
                height: 32px !important;
                margin-right: 4px !important;
            }

            .profile-avatar-placeholder span {
                font-size: 16px !important;
            }
        }

        @media screen and (max-width: 480px) {
            .content-area {
                padding: 15px 10px !important;
            }

            .container {
                padding: 0 10px !important;
            }

            h1 {
                font-size: 24px !important;
            }

            .card {
                padding: 16px !important;
            }

            .form-group input[type="text"],
            .form-group input[type="email"],
            .form-group input[type="password"],
            .form-group input[type="tel"],
            .form-group input[type="number"],
            .form-group input[type="file"] {
                padding: 12px 14px !important;
            }

            .btn {
                padding: 12px 20px !important;
                font-size: 15px !important;
            }

            .top-nav .logo {
                font-size: 16px !important;
            }

            .top-nav .nav-btn {
                padding: 8px 12px !important;
                font-size: 13px !important;
            }
        }
    </style>
    @stack('styles')
</head>
<body>
    <div class="main-container">
        <nav class="top-nav">
            <div class="container">
                <a href="/gis" class="logo">
                    <span>📍</span> GIS Manager
                </a>
                <div class="nav-buttons">
                    @if(isset($current_user) && $current_user->profile_picture)
                    <img src="/uploads/{{ $current_user->profile_picture }}" 
                         alt="Profile" 
                         class="profile-avatar"
                         onerror="this.onerror=null; this.src='/uploads/default/default-profile.svg';"
                         onclick="window.location.href='/profile';"
                         title="View Profile">
                    @else
                    <div class="profile-avatar-placeholder" onclick="window.location.href='/profile';">
                        <span>👤</span>
                    </div>
                    @endif
                    @php
                        // Check if user is admin - try multiple methods
                        $isAdmin = false;
                        $userId = session('user_id');
                        
                        if ($userId) {
                            // Method 1: Use current_user if available
                            if (isset($current_user) && $current_user && $current_user->id == $userId) {
                                $isAdmin = ($current_user->role === 'admin');
                            } else {
                                // Method 2: Load user directly from database
                                try {
                                    $checkUser = \App\Models\User::find($userId);
                                    $isAdmin = $checkUser && $checkUser->role === 'admin';
                                } catch (\Exception $e) {
                                    $isAdmin = false;
                                }
                            }
                        }
                    @endphp
                    @if($isAdmin)
                        <a href="/admin/users" class="nav-btn" style="background: rgba(255,215,0,0.3); border: 2px solid rgba(255,215,0,0.6); font-weight: bold;">
                            <span>👑</span> Admin
                        </a>
                    @endif
                    <a href="/profile" class="nav-btn">
                        <span>👤</span> Profile
                    </a>
                    <button onclick="handleLogout(event)" class="nav-btn">
                        <span>🚪</span> Logout
                    </button>
                </div>
            </div>
        </nav>
        <div class="content-area">
            <div class="container">
                @yield('content')
            </div>
        </div>
    </div>
    
    <script>
        function handleLogout(event) {
            event.preventDefault();
            localStorage.clear();
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            window.location.href = '/auth/logout';
        }
        
        // Token validation and localStorage sync (like Slim version)
        (function() {
            const sessionToken = '{{ session('auth_token') ?? '' }}';
            const storedToken = localStorage.getItem('auth_token');
            
            // If tokens don't match, show error and block page
            if (sessionToken && storedToken && storedToken !== sessionToken) {
                console.error('Token mismatch detected!');
                
                // Set flag to prevent any token updates
                window.TOKEN_INVALID = true;
                
                // Prevent localStorage from being updated by any other scripts
                const originalSetItem = Storage.prototype.setItem;
                Storage.prototype.setItem = function(key, value) {
                    if (key === 'auth_token' && window.TOKEN_INVALID) {
                        console.warn('Blocked attempt to update auth_token while in invalid state');
                        return; // Block the update
                    }
                    originalSetItem.apply(this, arguments);
                };
                
                // Show error modal
                document.addEventListener('DOMContentLoaded', function() {
                    // Load SweetAlert dynamically and show alert
                    const script = document.createElement('script');
                    script.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                    script.onload = function() {
                        Swal.fire({
                            icon: 'error',
                            title: 'Authentication Error',
                            text: 'Your authentication token has been modified. Please fix it or logout and login again.',
                            confirmButtonText: 'OK',
                            allowOutsideClick: false
                        });
                    };
                    document.head.appendChild(script);
                });
                
                return;
            }
            
            // Only update localStorage if tokens are valid
            if (sessionToken && !window.TOKEN_INVALID) {
                localStorage.setItem('auth_token', sessionToken);
                localStorage.setItem('email', '{{ session('email') ?? '' }}');
                localStorage.setItem('username', '{{ session('username') ?? '' }}');
                window.TOKEN_INVALID = false;
                console.log('Auth token saved to localStorage');
            }
        })();
    </script>
    
    @stack('scripts')
</body>
</html>

