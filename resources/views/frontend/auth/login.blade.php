@extends('frontend.layouts.auth')

    @section('header_action')
    <a href="/auth/register" class="header-btn">
        <span>👤</span> Sign Up
    </a>
@endsection

@section('content')
    <div class="auth-icon">📍</div>
    <h1 class="auth-title">Welcome Back</h1>
    <p class="auth-subtitle">Sign in to manage your geographic locations</p>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    @if(session('intended_url'))
        <div class="alert alert-info" style="background: #e3f2fd; color: #1976d2; border: 1px solid #90caf9; padding: 12px; border-radius: 8px; margin-bottom: 20px;">
            <strong>Info:</strong> Please login to access the requested page.
        </div>
    @endif

    <form method="POST" action="/auth/login">
        @csrf
        <div class="form-group">
            <label for="username">Username</label>
            <div class="input-wrapper">
                <span class="input-icon">👤</span>
                <input type="text" id="username" name="username" required 
                       class="with-icon"
                       value="{{ old('username') }}" 
                       placeholder="Enter your username">
            </div>
        </div>

        <div class="form-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input type="password" id="password" name="password" required 
                       class="with-icon"
                       placeholder="Enter your password">
            </div>
        </div>

        <div class="forgot-link">
            <a href="/auth/forgot-password">
                <span>❓</span> Forgot Password?
            </a>
        </div>

        <button type="submit" class="btn-primary">
            <span>🚪</span> Sign In
        </button>
    </form>

    <div class="auth-footer">
        Don't have an account? <a href="/auth/register">Sign up here</a>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center;">
            <div style="display: inline-flex; align-items: center; gap: 8px; font-size: 12px; color: #94a3b8;">
                <span>Powered by</span>
                <a href="https://laravel.com" target="_blank" style="text-decoration: none; display: inline-flex; align-items: center; gap: 6px;" title="Laravel Framework">
                    <!-- Laravel Logo - Red "L" with vertical bars -->
                    <svg width="75" height="20" viewBox="0 0 75 20" fill="none" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; vertical-align: middle;">
                        <!-- Vertical bars forming the "L" -->
                        <rect x="0" y="3" width="2.5" height="14" fill="#ff2d20" rx="0.5"/>
                        <rect x="4" y="3" width="2.5" height="14" fill="#ff2d20" rx="0.5"/>
                        <rect x="8" y="3" width="2.5" height="14" fill="#ff2d20" rx="0.5"/>
                        <rect x="12" y="3" width="2.5" height="14" fill="#ff2d20" rx="0.5"/>
                        <rect x="16" y="3" width="2.5" height="14" fill="#ff2d20" rx="0.5"/>
                        <rect x="20" y="3" width="2.5" height="14" fill="#ff2d20" rx="0.5"/>
                        <rect x="24" y="3" width="2.5" height="14" fill="#ff2d20" rx="0.5"/>
                        <!-- Horizontal bar at bottom -->
                        <rect x="0" y="15" width="26" height="2.5" fill="#ff2d20" rx="0.5"/>
                        <!-- Laravel text -->
                        <text x="30" y="14" font-family="'Segoe UI', Arial, sans-serif" font-size="13" font-weight="bold" fill="#ff2d20">Laravel</text>
                    </svg>
                </a>
                <span style="color: #ff2d20; font-weight: 600;">Framework</span>
            </div>
        </div>
    </div>
@endsection

@push('scripts')
<script>
    // Clear localStorage on login page to ensure clean state
    localStorage.clear();
    console.log('localStorage cleared on login page');
</script>
@endpush

