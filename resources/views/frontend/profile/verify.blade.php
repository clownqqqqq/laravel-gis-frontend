@extends('frontend.layouts.app')

@section('content')
    <h1 style="color: #0d6efd; display: flex; align-items: center; gap: 10px; margin-bottom: 30px;">
        <span style="font-size: 36px;">✅</span> Verify Account
    </h1>

    @if(session('success'))
        <div class="alert alert-success">{{ session('success') }}</div>
    @endif

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <div class="card">
        <p style="margin-bottom: 20px; color: #64748b;">Enter the OTP code sent to your email to verify your account.</p>
        
        <form method="POST" action="/profile/verify">
            @csrf
            <div class="form-group">
                <label for="otp_code">OTP Code</label>
                <input type="text" id="otp_code" name="otp_code" required maxlength="6" pattern="[0-9]{6}" 
                       placeholder="000000" autocomplete="off" 
                       style="text-align: center; font-size: 24px; letter-spacing: 8px;">
            </div>

            <div style="display: flex; gap: 10px; margin-top: 30px;">
                <button type="submit" class="btn" style="flex: 1; max-width: 200px;">Verify Account</button>
                <a href="/profile/verify/request" class="btn" style="flex: 1; max-width: 200px; display: flex; align-items: center; justify-content: center; text-decoration: none; background: #6c757d;">Resend OTP</a>
            </div>
        </form>
    </div>
@endsection

@push('scripts')
<script>
    document.getElementById('otp_code').focus();
    document.getElementById('otp_code').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });
</script>
@endpush

