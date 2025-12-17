/**
 * API Helper Functions
 * Makes it easy to call your backend API
 */

/**
 * Make an API call
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method (GET, POST, PUT, DELETE)
 * @param {object} data - Data to send (for POST/PUT)
 * @returns {Promise} API response
 */
async function apiCall(endpoint, method = 'GET', data = null) {
    const url = API_CONFIG.BASE_URL + endpoint;
    
    const options = {
        method: method,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        credentials: 'include', // Important for CORS with cookies
    };
    
    // Add Authorization header if token exists
    const token = localStorage.getItem('auth_token');
    if (token) {
        options.headers['Authorization'] = 'Bearer ' + token;
    }
    
    // Add body for POST/PUT requests
    if (data && (method === 'POST' || method === 'PUT')) {
        options.body = JSON.stringify(data);
    }
    
    try {
        const response = await fetch(url, options);
        const result = await response.json();
        
        // Handle errors
        if (!response.ok) {
            throw new Error(result.message || 'API request failed');
        }
        
        return result;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ==================== AUTHENTICATION ====================

/**
 * Login function
 */
async function login(username, password) {
    const result = await apiCall(API_CONFIG.ENDPOINTS.LOGIN, 'POST', {
        username: username,
        password: password
    });
    
    // Store user data and token
    if (result.success && result.user) {
        localStorage.setItem('user', JSON.stringify(result.user));
        // Backend returns 'auth_token', not 'token'
        if (result.auth_token) {
            localStorage.setItem('auth_token', result.auth_token);
        } else if (result.token) {
            // Fallback for compatibility
            localStorage.setItem('auth_token', result.token);
        }
    }
    
    return result;
}

/**
 * Register function
 */
async function register(userData) {
    return await apiCall(API_CONFIG.ENDPOINTS.REGISTER, 'POST', userData);
}

/**
 * Logout function
 */
async function logout() {
    const result = await apiCall(API_CONFIG.ENDPOINTS.LOGOUT, 'POST');
    
    // Clear stored data
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    
    return result;
}

/**
 * Forgot password
 */
async function forgotPassword(email) {
    return await apiCall(API_CONFIG.ENDPOINTS.FORGOT_PASSWORD, 'POST', { email });
}

/**
 * Reset password
 */
async function resetPassword(token, password) {
    return await apiCall(API_CONFIG.ENDPOINTS.RESET_PASSWORD, 'POST', { token, password });
}

// ==================== GIS LOCATIONS ====================

/**
 * Get all GIS locations
 */
async function getLocations() {
    return await apiCall(API_CONFIG.ENDPOINTS.GIS_LIST, 'GET');
}

/**
 * Get single location
 */
async function getLocation(id) {
    return await apiCall(API_CONFIG.ENDPOINTS.GIS_SHOW + id, 'GET');
}

/**
 * Create location
 */
async function createLocation(locationData) {
    return await apiCall(API_CONFIG.ENDPOINTS.GIS_CREATE, 'POST', locationData);
}

/**
 * Update location
 */
async function updateLocation(id, locationData) {
    return await apiCall(API_CONFIG.ENDPOINTS.GIS_UPDATE + id, 'PUT', locationData);
}

/**
 * Delete location
 */
async function deleteLocation(id) {
    return await apiCall(API_CONFIG.ENDPOINTS.GIS_DELETE + id, 'DELETE');
}

// ==================== MEMBER FUNCTIONS ====================

/**
 * Get member locations
 */
async function getMemberLocations() {
    return await apiCall(API_CONFIG.ENDPOINTS.MEMBER_LOCATIONS, 'GET');
}

/**
 * Get favorites
 */
async function getFavorites() {
    return await apiCall(API_CONFIG.ENDPOINTS.MEMBER_FAVORITES, 'GET');
}

/**
 * Add favorite
 */
async function addFavorite(locationId) {
    return await apiCall(API_CONFIG.ENDPOINTS.MEMBER_ADD_FAVORITE + locationId, 'POST');
}

/**
 * Remove favorite
 */
async function removeFavorite(locationId) {
    return await apiCall(API_CONFIG.ENDPOINTS.MEMBER_REMOVE_FAVORITE + locationId, 'DELETE');
}

/**
 * Search places
 */
async function searchPlaces(query, category = null) {
    const url = category 
        ? `${API_CONFIG.ENDPOINTS.MEMBER_SEARCH}?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
        : `${API_CONFIG.ENDPOINTS.MEMBER_SEARCH}?query=${encodeURIComponent(query)}`;
    return await apiCall(url, 'GET');
}

/**
 * Suggest place
 */
async function suggestPlace(data) {
    return await apiCall(API_CONFIG.ENDPOINTS.MEMBER_SUGGEST, 'POST', data);
}

// ==================== ADMIN FUNCTIONS ====================

/**
 * Get admin dashboard data
 */
async function getAdminDashboard() {
    return await apiCall(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD, 'GET');
}

/**
 * Get all users
 */
async function getAdminUsers() {
    return await apiCall(API_CONFIG.ENDPOINTS.ADMIN_USERS, 'GET');
}

/**
 * Create user
 */
async function createUser(userData) {
    return await apiCall(API_CONFIG.ENDPOINTS.ADMIN_CREATE_USER, 'POST', userData);
}

/**
 * Get pending locations
 */
async function getPendingLocations() {
    return await apiCall(API_CONFIG.ENDPOINTS.ADMIN_PENDING, 'GET');
}

/**
 * Approve location
 */
async function approveLocation(id) {
    return await apiCall(API_CONFIG.ENDPOINTS.ADMIN_APPROVE_LOCATION + id + '/approve', 'POST');
}

/**
 * Reject location
 */
async function rejectLocation(id) {
    return await apiCall(API_CONFIG.ENDPOINTS.ADMIN_REJECT_LOCATION + id + '/reject', 'POST');
}

// ==================== STAFF FUNCTIONS ====================

/**
 * Get staff submissions
 */
async function getStaffSubmissions() {
    return await apiCall(API_CONFIG.ENDPOINTS.STAFF_SUBMISSIONS, 'GET');
}

/**
 * Add location (staff)
 */
async function addLocationStaff(locationData) {
    return await apiCall(API_CONFIG.ENDPOINTS.STAFF_ADD_LOCATION, 'POST', locationData);
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Check if user is logged in
 */
function isLoggedIn() {
    const user = localStorage.getItem('user');
    return user !== null;
}

/**
 * Get current user
 */
function getCurrentUser() {
    const userJson = localStorage.getItem('user');
    return userJson ? JSON.parse(userJson) : null;
}

/**
 * Redirect based on user role
 */
function redirectByRole(user) {
    if (!user) return;
    
    switch(user.role) {
        case 'admin':
            window.location.href = 'admin-dashboard.html';
            break;
        case 'staff':
            window.location.href = 'staff-dashboard.html';
            break;
        case 'member':
            window.location.href = 'member-dashboard.html';
            break;
        default:
            window.location.href = 'dashboard.html';
    }
}

/**
 * Show alert message
 */
function showAlert(message, type = 'error', containerId = 'alert-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = `
        <span>${type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️'}</span>
        <span>${message}</span>
    `;
    
    // Clear previous alerts
    container.innerHTML = '';
    container.appendChild(alertDiv);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        alertDiv.remove();
    }, 5000);
}



