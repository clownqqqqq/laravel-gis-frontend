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
        
        // Log token being sent (for debugging)
        console.log('🔑 Sending token:', {
            preview: cleanToken.substring(0, 40) + '...',
            length: cleanToken.length,
            url: url
        });
    } else {
        console.warn('⚠️ No token available for request to:', url);
    }
    
    try {
        console.log('📤 Making API request:', {
            method: options.method || 'GET',
            url: url,
            hasToken: !!token,
            headers: Object.keys(headers)
        });
        
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        console.log('📥 API Response:', {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            url: url
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
        
        // Handle authentication errors - DON'T AUTO-LOGOUT
        if (response.status === 401) {
            const existingToken = getAuthToken();
            
            console.error('⚠️ 401 Unauthorized Error:', {
                url: url,
                tokenExists: !!existingToken,
                tokenPreview: existingToken ? existingToken.substring(0, 30) + '...' : 'NO TOKEN',
                tokenLength: existingToken ? existingToken.length : 0,
                responseData: data,
                headersSent: {
                    'Authorization': existingToken ? `Bearer ${existingToken.substring(0, 30)}...` : 'NOT SENT'
                }
            });
            
            // DO NOT AUTO-LOGOUT - Let user see the error and decide
            // This prevents immediate logout after login
            throw new Error(data.message || data.error || 'Authentication failed. Please check your credentials or refresh the page.');
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

