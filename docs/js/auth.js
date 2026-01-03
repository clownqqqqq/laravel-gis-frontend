// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    
    // Check if already logged in - redirect to dashboard
    if (isAuthenticated() && window.location.pathname.includes('login.html')) {
        window.location.href = 'dashboard.html';
    }
    
    // Login Form
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const submitBtn = loginForm.querySelector('button[type="submit"]');
            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');
            
            // Hide previous messages
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Logging in...';
            
            try {
                const data = await apiRequest(API_ENDPOINTS.LOGIN, {
                    method: 'POST',
                    body: JSON.stringify({ email, password }),
                });
                
                // Save token and user data
                if (data.token) {
                    setAuthToken(data.token);
                    setUserData(data.user);
                    
                    successDiv.textContent = 'Login successful! Redirecting...';
                    successDiv.style.display = 'block';
                    
                    // Redirect to dashboard
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    throw new Error('No token received');
                }
                
            } catch (error) {
                errorDiv.textContent = error.message || 'Login failed. Please check your credentials.';
                errorDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Login';
            }
        });
    }
    
    // Register Form
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const password_confirmation = document.getElementById('password_confirmation').value;
            const submitBtn = registerForm.querySelector('button[type="submit"]');
            const errorDiv = document.getElementById('error-message');
            const successDiv = document.getElementById('success-message');
            
            // Hide previous messages
            errorDiv.style.display = 'none';
            successDiv.style.display = 'none';
            
            // Validate passwords match
            if (password !== password_confirmation) {
                errorDiv.textContent = 'Passwords do not match!';
                errorDiv.style.display = 'block';
                return;
            }
            
            // Disable submit button
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';
            
            try {
                const data = await apiRequest(API_ENDPOINTS.REGISTER, {
                    method: 'POST',
                    body: JSON.stringify({ name, email, password, password_confirmation }),
                });
                
                successDiv.textContent = 'Account created successfully! Please check your email to activate your account.';
                successDiv.style.display = 'block';
                
                // Clear form
                registerForm.reset();
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 3000);
                
            } catch (error) {
                errorDiv.textContent = error.message || 'Registration failed. Please try again.';
                errorDiv.style.display = 'block';
                submitBtn.disabled = false;
                submitBtn.textContent = 'Create Account';
            }
        });
    }
});

// Logout function
function logout() {
    removeAuthToken();
    window.location.href = 'index.html';
}

