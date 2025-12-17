const API_CONFIG = {
    // Your Hostinger backend URL
    BASE_URL: 'https://bytevortexz.com/geocrud',
    
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
        GIS_SHOW: '/api/gis/',     // Add ID: GIS_SHOW + id
        GIS_UPDATE: '/api/gis/',   // Add ID: GIS_UPDATE + id
        GIS_DELETE: '/api/gis/',   // Add ID: GIS_DELETE + id
        
        // Member
        MEMBER_LOCATIONS: '/api/member/locations',
        MEMBER_FAVORITES: '/api/member/favorites',
        MEMBER_ADD_FAVORITE: '/api/member/favorites/',  // Add ID
        MEMBER_REMOVE_FAVORITE: '/api/member/favorites/', // Add ID
        MEMBER_SEARCH: '/api/member/search',
        MEMBER_SUGGEST: '/api/member/suggest-place',
        
        // Admin
        ADMIN_DASHBOARD: '/api/admin/dashboard',
        ADMIN_USERS: '/api/admin/users',
        ADMIN_CREATE_USER: '/api/admin/users',
        ADMIN_PENDING: '/api/admin/pending-locations',
        ADMIN_REVIEW_LOCATION: '/api/admin/locations/',  // Add ID + /review
        
        // Staff
        STAFF_SUBMISSIONS: '/api/staff/submissions',
        STAFF_ADD_LOCATION: '/api/staff/locations',
        STAFF_UPDATE_LOCATION: '/api/staff/locations/',  // Add ID
        STAFF_DELETE_LOCATION: '/api/staff/locations/',  // Add ID
    }
};
