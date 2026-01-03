// API Configuration
const API_BASE_URL = 'https://geocrud.bytevortexz.com/api';

// API Endpoints
const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/logout`,
    GIS_INDEX: `${API_BASE_URL}/gis`,
    GIS_CREATE: `${API_BASE_URL}/gis`,
    GIS_SHOW: (id) => `${API_BASE_URL}/gis/${id}`,
    GIS_UPDATE: (id) => `${API_BASE_URL}/gis/${id}`,
    GIS_DELETE: (id) => `${API_BASE_URL}/gis/${id}`,
    PROFILE: (id) => `${API_BASE_URL}/profile/${id}`,
};

// Helper function to get auth token
function getAuthToken() {
    return localStorage.getItem('auth_token');
}

// Helper function to set auth token
function setAuthToken(token) {
    localStorage.setItem('auth_token', token);
}

// Helper function to remove auth token
function removeAuthToken() {
    localStorage.removeItem('auth_token');
}

// Helper function to remove user data
function removeUserData() {
    localStorage.removeItem('user_data');
}

// Helper function to get user data
function getUserData() {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
}

// Helper function to set user data
function setUserData(user) {
    localStorage.setItem('user_data', JSON.stringify(user));
}

// Check if user is authenticated
function isAuthenticated() {
    return !!getAuthToken();
}

// API request helper
async function apiRequest(url, options = {}) {
    const token = getAuthToken();
    
    // Default headers
    const headers = {
        'Accept': 'application/json',
        ...options.headers,
    };
    
    // Only set Content-Type if not FormData (FormData sets its own Content-Type with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    // Add authentication token
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        // Handle non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(text || 'Server error');
        }
        
        // Handle authentication errors
        if (response.status === 401) {
            // Only auto-logout if we're not already on login page
            const isLoginPage = window.location.pathname.includes('login.html') || window.location.pathname === '/login.html';
            
            if (!isLoginPage) {
                // Check if token exists - if not, don't show error (user already logged out)
                const existingToken = getAuthToken();
                if (existingToken) {
                    console.error('401 Error - Token rejected by backend:', {
                        url: url,
                        tokenPreview: existingToken.substring(0, 30) + '...',
                        tokenLength: existingToken.length,
                        responseData: data,
                        fullToken: existingToken // Log full token for debugging
                    });
                    
                    // Don't immediately logout - might be a timing issue
                    // Only logout after multiple failed attempts or explicit error message
                    const errorMsg = data.message || data.error || '';
                    
                    // Check if error explicitly says token is invalid/expired
                    if (errorMsg.toLowerCase().includes('expired') || 
                        errorMsg.toLowerCase().includes('invalid') ||
                        errorMsg.toLowerCase().includes('unauthorized')) {
                        
                        // Track failed attempts
                        if (!window.authFailCount) window.authFailCount = 0;
                        window.authFailCount++;
                        
                        // Only logout after 2 failed attempts (to avoid premature logout)
                        if (window.authFailCount >= 2) {
                            console.error('Multiple auth failures detected. Logging out...');
                            removeAuthToken();
                            removeUserData();
                            window.authFailCount = 0;
                            alert('Authentication failed. Please log in again.');
                            window.location.href = 'login.html';
                            throw new Error('Authentication failed. Please log in again.');
                        } else {
                            console.warn('Auth failure (attempt ' + window.authFailCount + '). Will retry...');
                            // Don't logout yet, just throw error
                        }
                    }
                }
            }
            throw new Error(data.message || data.error || 'Authentication failed. Please log in again.');
        }
        
        // Reset failure counter on successful request
        if (response.ok && window.authFailCount) {
            window.authFailCount = 0;
        }
        
        // Handle authorization errors
        if (response.status === 403) {
            throw new Error(data.message || data.error || 'Access denied. You do not have permission to perform this action.');
        }
        
        // Handle other errors
        if (!response.ok) {
            throw new Error(data.message || data.error || `Error: ${response.status} ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        // If it's already our error object, rethrow it
        if (error.message) {
            throw error;
        }
        // Otherwise wrap it
        console.error('API Error:', error);
        throw new Error(error.message || 'Network error. Please check your connection and try again.');
    }
}

