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
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };
    
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers,
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

