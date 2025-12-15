@extends('frontend.layouts.app')

@section('content')
    <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin-bottom: 30px;">
        <span style="font-size: 36px;">🔒</span> Change Password
    </h1>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <div class="card">
        <form method="POST" action="/profile/change-password">
            @csrf
            <div class="form-group">
                <label for="current_password">Current Password</label>
                <input type="password" id="current_password" name="current_password" required>
            </div>

            <div class="form-group">
                <label for="password">New Password</label>
                <input type="password" id="password" name="password" required minlength="6">
                <small style="display: block; margin-top: 5px; color: #6c757d; font-size: 13px;">Must be at least 6 characters</small>
            </div>

            <div class="form-group">
                <label for="password_confirmation">Confirm New Password</label>
                <input type="password" id="password_confirmation" name="password_confirmation" required minlength="6">
            </div>

            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button type="submit" class="btn" style="flex: 1; max-width: 200px;">Change Password</button>
                <a href="/profile" class="btn" style="flex: 1; max-width: 200px; display: flex; align-items: center; justify-content: center; text-decoration: none; background: #6c757d;">Cancel</a>
            </div>
        </form>
    </div>
@endsection

