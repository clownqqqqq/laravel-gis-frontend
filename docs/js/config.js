// API Configuration
// Use window.API_BASE_URL if already defined (from inline scripts), otherwise define it
if (typeof window.API_BASE_URL === 'undefined') {
    window.API_BASE_URL = 'https://geocrud.bytevortexz.com/api';
}
// Only declare if not already declared (prevents redeclaration error)
if (typeof API_BASE_URL === 'undefined') {
    var API_BASE_URL = window.API_BASE_URL;
}

// API Endpoints
const API_ENDPOINTS = {
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/logout`,
    FORGOT_PASSWORD: `${API_BASE_URL}/auth/forgot-password`,
    RESET_PASSWORD: `${API_BASE_URL}/auth/reset-password`,
    GIS_INDEX: `${API_BASE_URL}/gis`,
    GIS_CREATE: `${API_BASE_URL}/gis`,
    GIS_SHOW: (id) => `${API_BASE_URL}/gis/${id}`,
    GIS_UPDATE: (id) => `${API_BASE_URL}/gis/${id}`,
    GIS_DELETE: (id) => `${API_BASE_URL}/gis/${id}`,
    PROFILE: (id) => `${API_BASE_URL}/profile/${id}`,
    PROFILE_UPDATE: (id) => `${API_BASE_URL}/profile/${id}`,
    PROFILE_CHANGE_PASSWORD: (id) => `${API_BASE_URL}/profile/${id}/change-password`,
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
        
        // Verify token format before sending
        if (cleanToken.length !== 64 || !/^[0-9a-f]{64}$/i.test(cleanToken)) {
            console.error('⚠️ Invalid token format in apiRequest:', {
                length: cleanToken.length,
                preview: cleanToken.substring(0, 20) + '...',
                isHex: /^[0-9a-f]{64}$/i.test(cleanToken),
                url: url
            });
            // Still send it, but log the issue
        }
        
        headers['Authorization'] = `Bearer ${cleanToken}`;
        
        // Debug log for API requests
        console.log('📤 API Request:', {
            url: url,
            method: options.method || 'GET',
            tokenLength: cleanToken.length,
            tokenPreview: cleanToken.substring(0, 20) + '...'
        });
    } else {
        console.warn('⚠️ No token available for API request:', url);
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        // Handle non-JSON responses - read response body ONCE
        let data;
        const contentType = response.headers.get('content-type');
        console.log('📦 Response Content-Type:', contentType);
        console.log('📦 Response Status:', response.status);
        
        // Read response body once - clone if needed for multiple reads
        const responseText = await response.text();
        
        if (contentType && contentType.includes('application/json')) {
            console.log('📦 Raw JSON response text:', responseText.substring(0, 500)); // First 500 chars
            try {
                // Try to parse JSON - if it fails, try to extract JSON from the end (in case debug output is prepended)
                let jsonText = responseText.trim();
                
                // If response starts with non-JSON (like SMTP debug output), try to find JSON at the end
                if (!jsonText.startsWith('{') && !jsonText.startsWith('[')) {
                    // Look for JSON object at the end
                    const jsonMatch = jsonText.match(/\{[\s\S]*\}$/);
                    if (jsonMatch) {
                        jsonText = jsonMatch[0];
                        console.log('📦 Extracted JSON from response:', jsonText.substring(0, 200));
                    }
                }
                
                data = JSON.parse(jsonText);
                console.log('📦 Parsed JSON data:', data);
            } catch (parseError) {
                console.error('❌ JSON parse error:', parseError);
                console.error('❌ Response text:', responseText);
                // For 500 errors, the response might be HTML error page or have debug output
                if (response.status === 500) {
                    // Try to extract error message from response
                    const errorMatch = responseText.match(/"message"\s*:\s*"([^"]+)"/);
                    const errorMsg = errorMatch ? errorMatch[1] : 'Server error (500). Check Laravel logs for details.';
                    throw new Error(errorMsg);
                }
                throw new Error('Invalid JSON response from server: ' + responseText.substring(0, 100));
            }
        } else {
            console.error('❌ Non-JSON response:', responseText.substring(0, 500));
            // For 500 errors, provide more helpful message
            if (response.status === 500) {
                throw new Error('Server error (500). The server returned: ' + responseText.substring(0, 200));
            }
            throw new Error(responseText || 'Server error');
        }
        
        // Handle authentication errors
        if (response.status === 401) {
            const existingToken = getAuthToken();
            
            const errorDetails = {
                url: url,
                tokenExists: !!existingToken,
                tokenPreview: existingToken ? existingToken.substring(0, 40) + '...' : 'NO TOKEN',
                tokenLength: existingToken ? existingToken.length : 0,
                tokenFull: existingToken, // Include full token for debugging
                responseMessage: data.message || data.error,
                fullResponse: data
            };
            
            console.error('⚠️ 401 Unauthorized Error:', errorDetails);
            
            // Test if token is valid using debug endpoint
            if (existingToken && !url.includes('/debug/')) {
                console.log('🔍 Testing token with debug endpoint...');
                fetch('https://geocrud.bytevortexz.com/api/debug/auth-test', {
                    headers: {
                        'Authorization': `Bearer ${existingToken}`,
                        'Accept': 'application/json'
                    }
                })
                .then(r => r.json())
                .then(debugData => {
                    console.log('🔍 Debug endpoint result:', debugData);
                    if (debugData.user_found === 'YES') {
                        console.error('⚠️ Token is VALID in database but middleware rejected it!');
                        console.error('⚠️ This is an OPcache issue - touch middleware file or restart PHP-FPM');
                    } else {
                        console.error('⚠️ Token NOT found in database');
                        console.error('⚠️ Token in localStorage:', existingToken);
                        if (debugData.token_comparisons) {
                            console.error('⚠️ Database tokens:', debugData.token_comparisons);
                        }
                        console.error('⚠️ Solution: Clear localStorage and log in again');
                    }
                })
                .catch(err => console.error('Debug endpoint error:', err));
            }
            
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
        
        // Handle other errors (including 500)
        if (!response.ok) {
            // If we have data from JSON parsing, use it
            if (data && (data.message || data.error)) {
                throw new Error(data.message || data.error || `Error: ${response.status} ${response.statusText}`);
            }
            // Otherwise, create a generic error message
            throw new Error(`Server error: ${response.status} ${response.statusText}`);
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

