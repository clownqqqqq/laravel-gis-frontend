@extends('frontend.layouts.app')

@section('content')
    <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin-bottom: 30px;">
        <span style="font-size: 36px;">👤</span> Profile
    </h1>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <div class="profile-container">
        <!-- Left Column - Profile Picture -->
        <div class="card profile-picture-card">
            <div class="profile-picture-wrapper">
                <img src="/uploads/{{ $user->profile_picture }}" alt="Profile Picture" class="profile-picture"
                     onerror="this.src='/uploads/default/default-profile.svg'">
            </div>
            <button type="button" onclick="document.getElementById('profile_picture').click()" class="btn btn-outline">
                <span>📷</span> Change Picture
            </button>
        </div>

        <!-- Right Column - Form -->
        <div class="card profile-form-card">
            <form method="POST" action="/profile/update" enctype="multipart/form-data">
                @csrf
                <input type="file" id="profile_picture" name="profile_picture" accept="image/*" style="display: none;" onchange="this.form.submit()">
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="firstname">First Name</label>
                        <input type="text" id="firstname" name="firstname" value="{{ $user->firstname }}">
                    </div>

                    <div class="form-group">
                        <label for="lastname">Last Name</label>
                        <input type="text" id="lastname" name="lastname" value="{{ $user->lastname }}">
                    </div>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required value="{{ $user->username }}">
                    </div>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input type="email" id="email" name="email" required value="{{ $user->email }}">
                    </div>
                </div>

                <div class="form-group">
                    <label for="mobile_number">Mobile Number</label>
                    <input type="tel" id="mobile_number" name="mobile_number" value="{{ $user->mobile_number }}">
                </div>

                <button type="submit" class="btn btn-primary btn-full">
                    <span>✓</span> Update Profile
                </button>
            </form>
        </div>
    </div>

    <!-- API Token Section -->
    <div class="card api-token-card">
        <h4 class="api-token-title">
            <span>🔑</span> Your API Authentication Token
        </h4>
        <p class="api-token-description">Use this token for Postman or API requests:</p>
        <input type="text" readonly value="{{ $auth_token ?? '' }}" id="authToken" class="api-token-input"
               onclick="this.select()">
        <p class="api-token-usage">
            <strong>Usage:</strong> Add header <code class="api-token-code">Authorization: Bearer {{ $auth_token ?? '' }}</code>
        </p>
        <p class="api-token-note">
            ℹ️ Token is automatically saved to Local Storage (press F12 → Application → Local Storage)
        </p>
    </div>

    @push('styles')
    <style>
        .profile-container {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 30px;
            margin-bottom: 30px;
        }

        .profile-picture-card {
            text-align: center;
            height: fit-content;
        }

        .profile-picture-wrapper {
            margin-bottom: 24px;
        }

        .profile-picture {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto;
            display: block;
            border: 4px solid #0d6efd;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .btn-outline {
            background: white;
            border: 2px solid #0d6efd;
            color: #0d6efd;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin: 0 auto;
            width: 100%;
            max-width: 250px;
        }

        .btn-outline:hover {
            background: #f0f7ff;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .form-row .form-group {
            margin-bottom: 0;
        }

        .btn-full {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
        }

        .api-token-card {
            background: #e7f3ff;
            border: 1px solid #b6d7f5;
            margin-top: 30px;
        }

        .api-token-title {
            margin: 0 0 16px 0;
            color: #0a58ca;
            font-weight: 600;
            font-size: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .api-token-title span {
            font-size: 28px;
        }

        .api-token-description {
            margin: 8px 0 16px 0;
            font-size: 15px;
            color: #495057;
            font-weight: 400;
        }

        .api-token-input {
            width: 100%;
            padding: 14px 16px;
            background: #ffffff;
            border: 1px solid #b6d7f5;
            border-radius: 10px;
            font-family: monospace;
            font-size: 13px;
            color: #212529;
            cursor: text;
            word-break: break-all;
        }

        .api-token-usage {
            margin: 16px 0 0 0;
            font-size: 14px;
            color: #495057;
            font-weight: 400;
            line-height: 1.6;
        }

        .api-token-code {
            background: #d0e7ff;
            padding: 4px 10px;
            border-radius: 6px;
            color: #212529;
            font-family: monospace;
            font-size: 13px;
            word-break: break-all;
            display: inline-block;
            margin-top: 4px;
        }

        .api-token-note {
            margin: 12px 0 0 0;
            font-size: 13px;
            color: #6c757d;
            font-weight: 400;
        }

        @media screen and (max-width: 768px) {
            .profile-container {
                grid-template-columns: 1fr !important;
                gap: 24px !important;
            }

            .profile-picture {
                width: 160px !important;
                height: 160px !important;
            }

            .form-row {
                grid-template-columns: 1fr !important;
                gap: 0 !important;
                margin-bottom: 0 !important;
            }

            .form-row .form-group {
                margin-bottom: 20px !important;
            }

            .api-token-title {
                font-size: 18px !important;
            }

            .api-token-title span {
                font-size: 24px !important;
            }

            .api-token-input {
                font-size: 12px !important;
                padding: 12px 14px !important;
            }

            .api-token-code {
                font-size: 12px !important;
                display: block !important;
                margin-top: 8px !important;
            }
        }

        @media (max-width: 480px) {
            .profile-picture {
                width: 140px;
                height: 140px;
            }

            .api-token-input {
                font-size: 11px;
            }
        }
    </style>
    @endpush
@endsection

@push('scripts')
<script>
    // Save auth token to localStorage when profile page loads
    const authToken = "{{ $auth_token ?? '' }}";
    const username = "{{ $user->username ?? '' }}";
    const email = "{{ $user->email ?? '' }}";
    
    if (authToken) {
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('username', username);
        localStorage.setItem('email', email);
        console.log('Auth token saved to localStorage from profile page');
        console.log('Token:', authToken);
    }
</script>
@endpush

