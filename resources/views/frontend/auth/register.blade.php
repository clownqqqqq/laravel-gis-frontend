@extends('frontend.layouts.auth')

@section('header_action')
    <a href="/auth/login" class="header-btn">
        <span>🚪</span> Login
    </a>
@endsection

@section('content')
    <div class="auth-icon">👤➕</div>
    <h1 class="auth-title">Create Account</h1>
    <p class="auth-subtitle">Join us to manage your geographic locations</p>

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <form method="POST" action="/auth/register" enctype="multipart/form-data">
        @csrf
        <div class="form-row">
            <div class="form-group">
                <label for="firstname">First Name</label>
                <input type="text" id="firstname" name="firstname" 
                       value="{{ old('firstname') }}" placeholder="">
            </div>

            <div class="form-group">
                <label for="lastname">Last Name</label>
                <input type="text" id="lastname" name="lastname" 
                       value="{{ old('lastname') }}" placeholder="">
            </div>
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" required 
                       value="{{ old('username') }}" placeholder="">
            </div>

            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" required 
                       value="{{ old('email') }}" placeholder="">
            </div>
        </div>

        <div class="form-group">
            <label for="mobilenum">Mobile Number</label>
            <input type="tel" id="mobilenum" name="mobilenum" 
                   value="{{ old('mobilenum') }}" placeholder="+1234567890">
        </div>

        <div class="form-row">
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" name="password" required 
                       placeholder="" minlength="6">
            </div>

            <div class="form-group">
                <label for="confirm_password">Confirm Password</label>
                <input type="password" id="confirm_password" name="confirm_password" required 
                       placeholder="" minlength="6">
            </div>
        </div>

        <div class="form-group">
            <label for="profile_picture">Profile Picture (Optional)</label>
            <div class="profile-preview">
                <img src="/uploads/default/default-profile.svg" 
                     alt="Default Profile" 
                     id="preview-image">
            </div>
            <input type="file" id="profile_picture" name="profile_picture" 
                   accept="image/*">
            <small>Upload a profile picture to personalize your account, or use the default</small>
        </div>

        <button type="submit" class="btn-primary">
            <span>👤➕</span> Create Account
        </button>
    </form>

    <div class="auth-footer">
        Already have an account? <a href="/auth/login">Sign in here</a>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                <span>Powered by</span>
                <a href="https://laravel.com" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 4px;" title="Laravel Framework">
                    <!-- Laravel Logo SVG -->
                    <svg width="65" height="18" viewBox="0 0 65 18" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block;">
                        <!-- Laravel "L" logo bars -->
                        <rect x="0" y="2" width="3" height="14" fill="#ff2d20"/>
                        <rect x="5" y="2" width="3" height="14" fill="#ff2d20"/>
                        <rect x="10" y="2" width="3" height="14" fill="#ff2d20"/>
                        <rect x="15" y="2" width="3" height="14" fill="#ff2d20"/>
                        <rect x="20" y="2" width="3" height="14" fill="#ff2d20"/>
                        <rect x="25" y="2" width="3" height="14" fill="#ff2d20"/>
                        <rect x="30" y="2" width="3" height="14" fill="#ff2d20"/>
                        <!-- Laravel text -->
                        <text x="36" y="13" font-family="Arial, sans-serif" font-size="12" font-weight="bold" fill="#ff2d20">Laravel</text>
                    </svg>
                </a>
                <span style="color: #ff2d20; font-weight: 600;">Framework</span>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
<script>
    // Clear localStorage on register page to ensure clean state
    localStorage.clear();
    console.log('localStorage cleared on register page');
    
    document.querySelector('form').addEventListener('submit', function(e) {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm_password').value;
        
        if (password !== confirmPassword) {
            e.preventDefault();
            alert('Passwords do not match!');
        }
    });
</script>
@endpush

