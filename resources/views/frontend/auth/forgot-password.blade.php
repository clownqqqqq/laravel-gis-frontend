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
    <div class="auth-icon">🔑</div>
    <h1 class="auth-title">Forgot Password?</h1>
    <p class="auth-subtitle">Enter your email address and we'll send you a reset link</p>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <form method="POST" action="/auth/forgot-password">
        @csrf
        <div class="form-group">
            <label for="email">Email Address</label>
            <div class="input-wrapper">
                <span class="input-icon">📧</span>
                <input type="email" id="email" name="email" required 
                       class="with-icon"
                       value="{{ old('email') }}" 
                       placeholder="Enter your email address">
            </div>
        </div>

        <button type="submit" class="btn-primary">
            <span>📨</span> Send Reset Link
        </button>
    </form>

    <div class="auth-footer">
        Remember your password? <a href="/auth/login">Back to Login</a>
    </div>
@endsection

