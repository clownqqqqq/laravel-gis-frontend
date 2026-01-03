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
                
                if (response.ok && data.success) {
                    // Save token and user data
                    if (data.auth_token) {
                        setAuthToken(data.auth_token);
                        if (data.user) {
                            setUserData(data.user);
                        }
                        
                        // Show success message
                        alertContainer.innerHTML = '<div class="alert alert-success">Login successful! Redirecting...</div>';
                        
                        // Redirect to dashboard
                        setTimeout(() => {
                            window.location.href = 'dashboard.html';
                        }, 1000);
                    } else {
                        throw new Error('No authentication token received');
                    }
                } else {
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
                    alertContainer.innerHTML = `<div class="alert alert-success">${data.message || 'Registration successful! Please check your email for OTP code.'}</div>`;
                    
                    // Clear form
                    registerForm.reset();
                    document.getElementById('preview-image').src = 'https://via.placeholder.com/80';
                    
                    // Redirect to login after 3 seconds
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 3000);
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
