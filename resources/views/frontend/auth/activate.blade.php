@extends('frontend.layouts.auth')

@section('header_action')
    <a href="/auth/login" class="header-btn">
        <span>🚪</span> Login
    </a>
@endsection

@section('content')
    <div class="auth-icon">🔐</div>
    <h1 class="auth-title">Activate Account</h1>
    <p class="auth-subtitle">Enter the OTP code sent to {{ $email ?? session('pending_activation_email') }}</p>

    @if(session('message'))
        <div class="alert alert-success">{{ session('message') }}</div>
    @endif

    @if($errors->any() || session('error'))
        <div class="alert alert-error">{{ $errors->first() ?? session('error') }}</div>
    @endif

    <form method="POST" action="/auth/activate">
        @csrf
        <div class="form-group">
            <label for="otp_code">OTP Code</label>
            <input type="text" id="otp_code" name="otp_code" required 
                   class="with-icon" maxlength="6" pattern="[0-9]{6}" 
                   placeholder="000000" autocomplete="off" style="text-align: center; font-size: 24px; letter-spacing: 8px;">
        </div>

        <button type="submit" class="btn-primary">Verify & Activate</button>
    </form>

    <div style="text-align: center; margin: 20px 0; color: #64748b;">Didn't receive the code?</div>
    <div style="text-align: center;">
        <button id="resendBtn" class="btn-primary" style="background: #6c757d;">Resend OTP</button>
    </div>

    <div style="text-align: center; margin-top: 20px;">
        <a href="/auth/login" style="color: #0d6efd; text-decoration: none;">Back to login</a>
    </div>
@endsection

@push('scripts')
<script>
    // Auto-focus OTP input
    document.getElementById('otp_code').focus();

    // Only allow numbers
    document.getElementById('otp_code').addEventListener('input', function(e) {
        this.value = this.value.replace(/[^0-9]/g, '');
    });

    // Resend OTP
    document.getElementById('resendBtn').addEventListener('click', function() {
        this.disabled = true;
        this.textContent = 'Sending...';

        fetch('/auth/resend-otp', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content || ''
            },
            body: JSON.stringify({
                email: '{{ $email ?? session('pending_activation_email') }}'
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert(data.message);
                let countdown = 60;
                this.textContent = `Resend OTP (${countdown}s)`;
                const interval = setInterval(() => {
                    countdown--;
                    this.textContent = `Resend OTP (${countdown}s)`;
                    if (countdown === 0) {
                        clearInterval(interval);
                        this.textContent = 'Resend OTP';
                        this.disabled = false;
                    }
                }, 1000);
            } else {
                alert(data.error || data.message);
                this.disabled = false;
                this.textContent = 'Resend OTP';
            }
        })
        .catch(error => {
            alert('Failed to resend OTP');
            this.disabled = false;
            this.textContent = 'Resend OTP';
        });
    });
</script>
@endpush

