// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Check if already logged in - redirect to dashboard
    if (isAuthenticated && isAuthenticated() && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
    
    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const alertContainer = document.getElementById('alert-container');
            
            // Clear previous alerts
            alertContainer.innerHTML = '';
            
            // Disable submit button
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>⏳</span> Signing In...';
            
            try {
                const response = await fetch(API_ENDPOINTS.LOGIN, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    body: JSON.stringify({ username, password }),
                });
                
                const data = await response.json();
                
                // Check if account needs activation
                if (response.status === 403 && data.requires_activation) {
                    const email = data.email || username;
                    alertContainer.innerHTML = `<div class="alert alert-warning">Account not activated. Redirecting to activation page...</div>`;
                    setTimeout(() => {
                        window.location.href = `activate.html?email=${encodeURIComponent(email)}`;
                    }, 1500);
                    return;
                }
                
                if (response.ok && data.success && data.auth_token) {
                    // Save token - ensure it's clean
                    const token = data.auth_token.trim(); // Ensure no whitespace
                    
                    // Verify token format
                    if (token.length !== 64 || !/^[0-9a-f]{64}$/i.test(token)) {
                        console.error('Invalid token format:', {
                            length: token.length,
                            preview: token.substring(0, 20) + '...',
                            full: token
                        });
                        throw new Error('Invalid authentication token received from server');
                    }
                    
                    // Save token to localStorage
                    setAuthToken(token);
                    
                    // Verify it was saved
                    const savedToken = getAuthToken();
                    if (savedToken !== token) {
                        console.error('Token save verification failed!', {
                            expected: token,
                            actual: savedToken
                        });
                        throw new Error('Failed to save authentication token');
                    }
                    
                    console.log('✅ Token saved successfully:', {
                        length: savedToken.length,
                        preview: savedToken.substring(0, 20) + '...',
                        matches: savedToken === token
                    });
                    
                    // Save user data
                    if (data.user) {
                        const userData = {
                            id: data.user.id,
                            username: data.user.username || username,
                            email: data.user.email || null,
                            role: data.user.role || 'member',
                            profile_picture: data.user.profile_picture || null,
                            is_activated: data.user.is_activated || false
                        };
                        setUserData(userData);
                        console.log('✅ User data saved:', userData);
                    }
                    
                    // Show success and redirect
                    alertContainer.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
                    
                    // Wait a bit longer to ensure localStorage is persisted
                    setTimeout(() => {
                        // Double-check token before redirect
                        const verifyToken = getAuthToken();
                        if (!verifyToken) {
                            console.error('❌ Token lost before redirect!');
                            alertContainer.innerHTML = '<div class="alert alert-error">Authentication error. Please try again.</div>';
                            return;
                        }
                        console.log('✅ Token verified before redirect:', verifyToken.substring(0, 20) + '...');
                        window.location.href = 'dashboard.html';
                    }, 800);
                } else {
                    // Check if it's an activation required error
                    if (data.requires_activation && data.email) {
                        const email = data.email;
                        alertContainer.innerHTML = `<div class="alert alert-warning">Account not activated. Redirecting to activation page...</div>`;
                        setTimeout(() => {
                            window.location.href = `activate.html?email=${encodeURIComponent(email)}`;
                        }, 1500);
                        return;
                    }
                    throw new Error(data.message || data.error || 'Login failed. Please check your credentials.');
                }
                
            } catch (error) {
                alertContainer.innerHTML = `<div class="alert alert-error">${error.message || 'Login failed. Please check your credentials.'}</div>`;
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
    
    // Register Form
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            const firstname = document.getElementById('firstname').value;
            const lastname = document.getElementById('lastname').value;
            const mobilenum = document.getElementById('mobilenum').value;
            const profilePicture = document.getElementById('profile_picture').files[0];
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const alertContainer = document.getElementById('alert-container');
            
            // Clear previous alerts
            alertContainer.innerHTML = '';
            
            // Validate passwords match
            if (password !== confirmPassword) {
                alertContainer.innerHTML = '<div class="alert alert-error">Passwords do not match!</div>';
                return;
            }
            
            // Disable submit button
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<span>⏳</span> Creating Account...';
            
            try {
                // Use FormData for file upload
                const formData = new FormData();
                formData.append('username', username);
                formData.append('email', email);
                formData.append('password', password);
                if (firstname) formData.append('firstname', firstname);
                if (lastname) formData.append('lastname', lastname);
                if (mobilenum) formData.append('mobilenum', mobilenum);
                if (profilePicture) formData.append('profile_picture', profilePicture);
                
                const response = await fetch(API_ENDPOINTS.REGISTER, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                    },
                    body: formData,
                });
                
                const data = await response.json();
                
                if (response.ok && data.success) {
                    // Show success message
                    const message = data.message || 'Registration successful! Please check your email for OTP code.';
                    const alertClass = data.emailError ? 'alert-warning' : 'alert-success';
                    alertContainer.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
                    
                    // Clear form
                    registerForm.reset();
                    document.getElementById('preview-image').src = 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'80\' height=\'80\'%3E%3Crect fill=\'%23e0e0e0\' width=\'80\' height=\'80\'/%3E%3Ctext x=\'50%25\' y=\'50%25\' font-size=\'32\' text-anchor=\'middle\' dy=\'.3em\' fill=\'%23999\'%3E👤%3C/text%3E%3C/svg%3E';
                    
                    // Always redirect to activation page for new registrations
                    // New accounts always require OTP verification
                    const email = data.email || document.getElementById('email').value;
                    setTimeout(() => {
                        window.location.href = `activate.html?email=${encodeURIComponent(email)}`;
                    }, 2000);
                } else {
                    throw new Error(data.message || data.error || 'Registration failed. Please try again.');
                }
                
            } catch (error) {
                alertContainer.innerHTML = `<div class="alert alert-error">${error.message || 'Registration failed. Please try again.'}</div>`;
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }
});

// Logout function
function logout() {
    removeAuthToken();
    removeUserData();
    window.location.href = 'login.html';
}
