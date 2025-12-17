/**
 * API Configuration
 * This connects your frontend to your Hostinger backend
 */
const API_CONFIG = {
    // Your Hostinger backend URL
    BASE_URL: 'https://geocrud.bytevortexz.com',
    
    // API endpoints
    ENDPOINTS: {
        // Authentication
        LOGIN: '/api/auth/login',
        REGISTER: '/api/auth/register',
        LOGOUT: '/api/logout',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        RESET_PASSWORD: '/api/auth/reset-password',
        VERIFY_EMAIL: '/api/verify-email',
        RESEND_OTP: '/api/resend-otp',
        
        // GIS Locations
        GIS_LIST: '/api/gis',
        GIS_CREATE: '/api/gis',
        GIS_SHOW: '/api/gis/',
        GIS_UPDATE: '/api/gis/',
        GIS_DELETE: '/api/gis/',
        
        // Member
        MEMBER_LOCATIONS: '/api/member/locations',
        MEMBER_FAVORITES: '/api/member/favorites',
        MEMBER_ADD_FAVORITE: '/api/member/favorites/',
        MEMBER_REMOVE_FAVORITE: '/api/member/favorites/',
        MEMBER_SEARCH: '/api/member/search',
        MEMBER_SUGGEST: '/api/member/suggest-place',
        MEMBER_ANNOUNCEMENTS: '/api/member/announcements',
        MEMBER_CATEGORIES: '/api/member/categories',
        
        // Admin
        ADMIN_DASHBOARD: '/api/admin/dashboard',
        ADMIN_USERS: '/api/admin/users',
        ADMIN_CREATE_USER: '/api/admin/users',
        ADMIN_PENDING: '/api/admin/pending-locations',
        ADMIN_REVIEW_LOCATION: '/api/admin/locations/',
        ADMIN_APPROVE_LOCATION: '/api/admin/locations/',
        ADMIN_REJECT_LOCATION: '/api/admin/locations/',
        ADMIN_ACTIVITY_LOGS: '/api/admin/activity-logs',
        ADMIN_ANNOUNCEMENTS: '/api/admin/announcements',
        ADMIN_CREATE_ANNOUNCEMENT: '/api/admin/announcements',
        
        // Staff
        STAFF_SUBMISSIONS: '/api/staff/submissions',
        STAFF_ADD_LOCATION: '/api/staff/locations',
        STAFF_UPDATE_LOCATION: '/api/staff/locations/',
        STAFF_DELETE_LOCATION: '/api/staff/locations/',
        STAFF_NOTIFICATIONS: '/api/staff/notifications',
    }
};

