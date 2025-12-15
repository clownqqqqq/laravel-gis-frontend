@extends('frontend.layouts.auth')

@section('header_action')
    <div style="display: flex; gap: 10px;">
        <a href="/auth/login" class="header-btn">
            <span>🚪</span> Login
        </a>
        <a href="/auth/register" class="header-btn">
            <span>👤</span> Sign Up
        </a>
    </div>
@endsection

@section('content')
    <div class="auth-icon">🔒</div>
    <h1 class="auth-title">Reset Password</h1>
    <p class="auth-subtitle">Choose a new password for your account</p>

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <form method="POST" action="/auth/reset-password">
        @csrf
        <input type="hidden" name="token" value="{{ $token ?? request('token') }}">

        <div class="form-group">
            <label for="password">New Password</label>
            <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input type="password" id="password" name="password" required 
                       class="with-icon"
                       placeholder="At least 6 characters" minlength="6">
            </div>
        </div>

        <div class="form-group">
            <label for="password_confirmation">Confirm New Password</label>
            <div class="input-wrapper">
                <span class="input-icon">🔒</span>
                <input type="password" id="password_confirmation" name="password_confirmation" required 
                       class="with-icon"
                       placeholder="Confirm your password" minlength="6">
            </div>
            <small>Passwords must match</small>
        </div>

        <button type="submit" class="btn-primary">
            <span>✓</span> Reset Password
        </button>
    </form>

    <div class="auth-footer">
        Remember your password? <a href="/auth/login">Back to login</a>
    </div>
@endsection

@push('scripts')
<script>
    document.querySelector('form').addEventListener('submit', function(e) {
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('password_confirmation').value;
        
        if (password !== confirmPassword) {
            e.preventDefault();
            alert('Passwords do not match!');
        }
    });
</script>
@endpush

