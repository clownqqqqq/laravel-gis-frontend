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
        // Trim token to remove any whitespace
        const cleanToken = token.trim();
        headers['Authorization'] = `Bearer ${cleanToken}`;
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
            const existingToken = getAuthToken();
            
            const errorDetails = {
                url: url,
                tokenExists: !!existingToken,
                tokenPreview: existingToken ? existingToken.substring(0, 40) + '...' : 'NO TOKEN',
                tokenLength: existingToken ? existingToken.length : 0,
                responseMessage: data.message || data.error,
                fullResponse: data
            };
            
            console.error('⚠️ 401 Unauthorized Error:', errorDetails);
            
            // Create detailed error message for UI
            let errorMessage = 'Authentication failed: ';
            if (data.message) {
                errorMessage += data.message;
            } else if (data.error) {
                errorMessage += data.error;
            } else {
                errorMessage += 'Unauthorized access. Please log in again.';
            }
            
            if (!existingToken) {
                errorMessage += ' (No token found)';
            } else if (url.includes('/auth/login') === false) {
                errorMessage += ' (Token was rejected by server)';
            }
            
            // Don't auto-logout - let the calling function handle it
            throw new Error(errorMessage);
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

