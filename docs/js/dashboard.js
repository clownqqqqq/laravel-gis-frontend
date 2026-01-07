// Dashboard JavaScript
let currentLocations = [];
let currentSearch = '';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Mark page load time for auth error handling
    window.pageLoadTime = Date.now();
    
    // Check authentication
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
        // Wait a moment to ensure token is properly set, then load data
        setTimeout(() => {
            // Verify token is still there
            const verifyToken = getAuthToken();
            if (!verifyToken) {
                console.error('❌ No token found! Redirecting to login...');
                showMessage('⚠️ No authentication token found. Please log in.', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            // Verify token format
            if (verifyToken.length !== 64 || !/^[0-9a-f]{64}$/i.test(verifyToken)) {
                console.error('❌ Invalid token format!', {
                    length: verifyToken.length,
                    preview: verifyToken.substring(0, 20) + '...',
                    isHex: /^[0-9a-f]{64}$/i.test(verifyToken)
                });
                showMessage('⚠️ Invalid authentication token. Please log in again.', 'error');
                removeAuthToken();
                removeUserData();
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            }
            
            console.log('✅ Token verified on dashboard load:', {
                length: verifyToken.length,
                preview: verifyToken.substring(0, 20) + '...',
                isHex: /^[0-9a-f]{64}$/i.test(verifyToken)
            });
            
            // Load user info and locations
            loadUserInfo().catch(() => {}); // Non-critical
            loadLocations();
            
            // Search on Enter key
            const searchInput = document.getElementById('search');
            if (searchInput) {
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        searchLocations(e);
                    }
                });
            }
        }, 300); // Small delay to ensure everything is ready
});

// Load user information and profile
async function loadUserInfo() {
    const userData = getUserData();
    const token = getAuthToken();
    
    console.log('Loading user info - Token:', token ? 'Present' : 'Missing');
    console.log('Loading user info - User data:', userData);
    
    // Try to load full user profile from API to get latest role and data
    if (userData && userData.id && token) {
        try {
            console.log('Fetching user profile from API...');
            const profileData = await apiRequest(API_ENDPOINTS.PROFILE(userData.id));
            console.log('Profile data received:', profileData);
            
            if (profileData && profileData.user) {
                // Update user data with latest from server
                const updatedUser = {
                    ...userData,
                    ...profileData.user,
                    role: profileData.user.role || userData.role || 'member'
                };
                setUserData(updatedUser);
                updateUIWithUserData(updatedUser);
            } else {
                // Fallback to stored data
                console.log('Using stored user data (no profile data)');
                updateUIWithUserData(userData);
            }
        } catch (error) {
            console.warn('Could not load user profile (non-fatal):', error);
            // Don't fail completely - use stored data
            if (userData) {
                console.log('Using stored user data (API error)');
                updateUIWithUserData(userData);
            }
        }
    } else if (userData) {
        console.log('Using stored user data (no ID or token)');
        updateUIWithUserData(userData);
    } else {
        console.warn('No user data found');
    }
}

// Update UI with user data
function updateUIWithUserData(userData) {
    // Update profile picture if exists
    const profileAvatar = document.getElementById('profile-avatar');
    const profilePlaceholder = document.getElementById('profile-avatar-placeholder');
    
    if (userData.profile_picture) {
        if (profileAvatar) {
            profileAvatar.src = `https://geocrud.bytevortexz.com/uploads/${userData.profile_picture}`;
            profileAvatar.style.display = 'block';
            if (profilePlaceholder) {
                profilePlaceholder.style.display = 'none';
            }
            profileAvatar.onerror = function() {
                this.style.display = 'none';
                if (profilePlaceholder) {
                    profilePlaceholder.style.display = 'flex';
                }
            };
        }
    }
    
    // Show admin button if user is admin
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn && userData.role === 'admin') {
        adminBtn.style.display = 'flex';
        adminBtn.onclick = function() {
            window.location.href = 'admin/dashboard.html';
        };
    }
    
    // Show admin access panel if user is admin
    const adminAccessPanel = document.getElementById('admin-access-panel');
    if (adminAccessPanel) {
        if (userData.role === 'admin') {
            adminAccessPanel.style.display = 'block';
        } else {
            adminAccessPanel.style.display = 'none';
        }
    }
    
    // Show Manage Users button if user is admin
    const manageUsersBtn = document.getElementById('manage-users-btn');
    if (manageUsersBtn) {
        if (userData.role === 'admin') {
            manageUsersBtn.style.display = 'inline-block';
        } else {
            manageUsersBtn.style.display = 'none';
        }
    }
    
    // Show Test Database Connection button if user is admin
    const databaseTestBtn = document.getElementById('database-test-btn');
    if (databaseTestBtn) {
        if (userData.role === 'admin') {
            databaseTestBtn.style.display = 'block';
        } else {
            databaseTestBtn.style.display = 'none';
        }
    }
    
    // Update add location button visibility based on role
    const addLocationBtn = document.querySelector('.btn-add-location');
    if (addLocationBtn) {
        // Only admin and staff can add locations
        if (userData.role !== 'admin' && userData.role !== 'staff') {
            addLocationBtn.style.display = 'none';
        } else {
            addLocationBtn.style.display = 'flex';
        }
    }
    
    // Show/hide staff dashboard
    const staffDashboard = document.getElementById('staff-dashboard');
    if (staffDashboard) {
        if (userData.role === 'staff') {
            staffDashboard.style.display = 'block';
            loadStaffStatistics();
        } else {
            staffDashboard.style.display = 'none';
        }
    }
    
    // Show/hide member features
    const memberFeatures = document.getElementById('member-features');
    if (memberFeatures) {
        if (userData.role === 'member') {
            memberFeatures.style.display = 'block';
        } else {
            memberFeatures.style.display = 'none';
        }
    }
}

// Load staff statistics
async function loadStaffStatistics() {
    try {
        const data = await apiRequest(`${API_BASE_URL}/staff/submissions`);
        if (data.success && data.data) {
            const locations = data.data;
            const pending = locations.filter(l => l.status === 'pending').length;
            const approved = locations.filter(l => l.status === 'approved').length;
            const rejected = locations.filter(l => l.status === 'rejected').length;
            
            const pendingEl = document.getElementById('staff-pending-count');
            const approvedEl = document.getElementById('staff-approved-count');
            const rejectedEl = document.getElementById('staff-rejected-count');
            
            if (pendingEl) pendingEl.textContent = pending;
            if (approvedEl) approvedEl.textContent = approved;
            if (rejectedEl) rejectedEl.textContent = rejected;
        }
    } catch (error) {
        console.error('Error loading staff statistics:', error);
    }
}

// Load all locations from API
async function loadLocations(searchTerm = '') {
    const loadingDiv = document.getElementById('loading');
    const container = document.getElementById('locations-container');
    const emptyState = document.getElementById('empty-state');
    
    // Verify token before making request
    const token = getAuthToken();
    if (!token) {
        console.error('No token found when loading locations!');
        loadingDiv.style.display = 'none';
        showMessage('Authentication error. Please log in again.', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
        return;
    }
    
    loadingDiv.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    
    try {
        let url = API_ENDPOINTS.GIS_INDEX;
        if (searchTerm && searchTerm.trim()) {
            url += `?search=${encodeURIComponent(searchTerm.trim())}`;
        }
        
        const data = await apiRequest(url);
        
        console.log('📍 Locations API response:', data);
        
        // Handle API response format: {success: true, data: [...]}
        if (data.success && Array.isArray(data.data)) {
            currentLocations = data.data;
            console.log('✅ Locations loaded from data.data:', currentLocations.length, 'locations');
        } else if (Array.isArray(data.locations)) {
            currentLocations = data.locations;
            console.log('✅ Locations loaded from data.locations:', currentLocations.length, 'locations');
        } else if (Array.isArray(data)) {
            currentLocations = data;
            console.log('✅ Locations loaded from data array:', currentLocations.length, 'locations');
        } else {
            currentLocations = [];
            console.warn('⚠️ No locations found in response:', data);
        }
        
        // For members, check favorites for each location
        const userData = getUserData();
        if (userData && userData.role === 'member' && currentLocations.length > 0) {
            try {
                const favoritesResponse = await apiRequest(`${API_BASE_URL}/member/favorites`);
                if (favoritesResponse.success && Array.isArray(favoritesResponse.data)) {
                    const favoriteIds = favoritesResponse.data.map(f => f.id || f.location_id);
                    currentLocations = currentLocations.map(loc => ({
                        ...loc,
                        is_favorite: favoriteIds.includes(loc.id)
                    }));
                }
            } catch (error) {
                console.warn('Could not load favorites (non-fatal):', error);
            }
        }
        
        loadingDiv.style.display = 'none';
        
        if (currentLocations.length === 0) {
            console.log('ℹ️ No locations to display - showing empty state');
            emptyState.style.display = 'block';
            return;
        }
        
        console.log('🎨 Rendering', currentLocations.length, 'locations...');
        renderLocations(currentLocations);
        console.log('✅ Locations rendered successfully!');
        
    } catch (error) {
        loadingDiv.style.display = 'none';
        const errorContainer = document.getElementById('error-container');
        const locationsContainer = document.getElementById('locations-container');
        
        // Clear locations container
        if (locationsContainer) {
            locationsContainer.innerHTML = '';
        }
        
        // Check if it's an authentication error
        if (error.message && (error.message.includes('Authentication') || error.message.includes('401') || error.message.includes('Unauthorized'))) {
            const currentToken = getAuthToken();
            
            if (!currentToken) {
                showMessage('⚠️ Not logged in. Redirecting to login...', 'error');
                setTimeout(() => window.location.href = 'login.html', 2000);
                return;
            }
            
            // Token exists but was rejected - show detailed error
            const errorMsg = `⚠️ Authentication Error: ${error.message}\n\n` +
                           `This usually means:\n` +
                           `• Your session expired\n` +
                           `• Server cache needs to be cleared\n` +
                           `• Please try logging out and logging in again`;
            showMessage(errorMsg, 'error');
            
            // Add logout button
            if (errorContainer) {
                const logoutBtn = document.createElement('button');
                logoutBtn.textContent = '🚪 Logout and Login Again';
                logoutBtn.className = 'btn';
                logoutBtn.style.marginTop = '10px';
                logoutBtn.style.background = '#ef4444';
                logoutBtn.style.color = 'white';
                logoutBtn.style.padding = '12px 24px';
                logoutBtn.style.borderRadius = '8px';
                logoutBtn.style.cursor = 'pointer';
                logoutBtn.onclick = () => {
                    removeAuthToken();
                    removeUserData();
                    window.location.href = 'login.html';
                };
                errorContainer.appendChild(logoutBtn);
            }
            emptyState.style.display = 'block';
            return;
        }
        
        // Other errors
        showMessage('❌ Error loading locations: ' + (error.message || 'Unknown error. Please check your connection and try again.'), 'error');
        emptyState.style.display = 'block';
    }
}

function renderLocations(locations) {
    const container = document.getElementById('locations-container');
    const userData = getUserData();
    const userRole = userData?.role || 'member';
    
    console.log('🎨 renderLocations called with:', locations.length, 'locations');
    console.log('📍 Container element:', container);
    console.log('👤 User role:', userRole);
    
    if (!container) {
        console.error('❌ locations-container element not found!');
        return;
    }
    
    if (!Array.isArray(locations) || locations.length === 0) {
        console.log('ℹ️ No locations to render - showing empty state');
        const emptyState = document.getElementById('empty-state');
        if (emptyState) {
            emptyState.style.display = 'block';
        }
        container.innerHTML = '';
        return;
    }
    
    // Hide empty state
    const emptyState = document.getElementById('empty-state');
    if (emptyState) {
        emptyState.style.display = 'none';
    }
    
    console.log('🎨 Rendering', locations.length, 'location cards...');
    container.innerHTML = locations.map((location, index) => {
        // Handle location data - ensure we have required fields
        const locationName = location.location || location.name || 'Unnamed Location';
        const latitude = location.latitude || 0;
        const longitude = location.longitude || 0;
        const locationId = location.id || index;
        const imageUrl = location.image 
            ? `https://geocrud.bytevortexz.com/uploads/${location.image}`
            : null;
        
        const statusBadge = getStatusBadge(location.status, userRole);
        // Admin and staff can edit approved locations
        const canEdit = userRole === 'admin' || (userRole === 'staff' && location.status === 'approved');
        const isFavorited = location.is_favorite || false;
        
        // Build location actions based on role
        let locationActions = '';
        if (userRole === 'member') {
            // Members see favorite buttons
            if (isFavorited) {
                locationActions = `
                <div class="location-actions">
                    <button onclick="removeFavorite(${locationId})" class="btn" style="background: #ffc107; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                        <span>⭐</span> Remove Favorite
                    </button>
                </div>
                `;
            } else {
                locationActions = `
                <div class="location-actions">
                    <button onclick="addFavorite(${locationId})" class="btn" style="background: #6c757d; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                        <span>⭐</span> Add to Favorites
                    </button>
                </div>
                `;
            }
        } else if (canEdit) {
            // Admin and staff see edit/delete buttons
            locationActions = `
                <div class="location-actions">
                    <a href="edit-location.html?id=${locationId}" class="btn btn-edit">
                        <span>✏️</span> Edit
                    </a>
                    <form class="location-delete-form" onsubmit="deleteLocation(${locationId}); return false;">
                        <button type="submit" class="btn btn-delete">
                            <span>🗑️</span> Delete
                        </button>
                    </form>
                </div>
            `;
        }
        
        return `
            <div class="card location-card">
                <div class="location-content">
                    ${imageUrl ? `
                    <div class="location-image-wrapper">
                        <img src="${imageUrl}" alt="${locationName}" class="location-image" onerror="this.style.display='none'">
                    </div>
                    ` : ''}
                    <div class="location-details">
                        <h3 class="location-name">
                            ${locationName}
                            ${statusBadge}
                        </h3>
                        <p class="location-coords">
                            Lat: ${latitude} &nbsp;&nbsp;&nbsp;&nbsp; Lng: ${longitude}
                        </p>
                        ${location.category ? `<p style="margin: 5px 0; color: #64748b; font-size: 14px;">${location.category}</p>` : ''}
                        ${location.notes ? `<p style="margin: 10px 0; color: #475569; font-size: 14px;">${location.notes.length > 100 ? location.notes.substring(0, 100) + '...' : location.notes}</p>` : ''}
                    </div>
                </div>
                ${locationActions}
            </div>
        `;
    }).join('');
    
    console.log('✅ Location cards rendered:', container.children.length, 'cards');
    console.log('✅ Container HTML length:', container.innerHTML.length, 'characters');
}

// Get status badge HTML
function getStatusBadge(status, userRole) {
    if (!status || status === 'approved' || userRole !== 'admin') return '';
    
    const badges = {
        'pending': '<span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 10px; border: 1px solid #fde047;">⏳ Pending Approval</span>',
        'rejected': '<span style="background: #fee2e2; color: #991b1b; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 10px; border: 1px solid #fca5a5;">✗ Rejected</span>'
    };
    
    return badges[status] || '';
}

// Search locations
function searchLocations(event) {
    if (event) event.preventDefault();
    const searchTerm = document.getElementById('search').value.trim();
    currentSearch = searchTerm;
    loadLocations(searchTerm);
}

// Clear search (if needed in future)
function clearSearch() {
    document.getElementById('search').value = '';
    currentSearch = '';
    loadLocations();
}

// Edit location
function editLocation(id) {
    window.location.href = `edit-location.html?id=${id}`;
}

// View location
function viewLocation(id) {
    window.location.href = `view-location.html?id=${id}`;
}

// Delete location
async function deleteLocation(id) {
    const locationName = currentLocations.find(loc => loc.id === id)?.location || 'this location';
    if (!confirm(`Are you sure you want to delete ${locationName}? This action cannot be undone.`)) {
        return false;
    }
    
    try {
        await apiRequest(API_ENDPOINTS.GIS_DELETE(id), {
            method: 'DELETE'
        });
        
        showMessage('Location deleted successfully!', 'success');
        loadLocations(currentSearch);
        
    } catch (error) {
        showMessage('Error deleting location: ' + error.message, 'error');
    }
    return false;
}

// Show message
function showMessage(message, type = 'success') {
    const messagesDiv = document.getElementById('messages');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    
    messagesDiv.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    
    setTimeout(() => {
        messagesDiv.innerHTML = '';
    }, 5000);
}

// Logout function
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        removeAuthToken();
        window.location.href = 'index.html';
    }
}

// Show profile section
function showProfileSection() {
    document.getElementById('profile-section').style.display = 'block';
    document.getElementById('locations-section').style.display = 'none';
    window.location.hash = 'profile';
    loadProfileData();
}

// Show locations section
function showLocationsSection() {
    document.getElementById('profile-section').style.display = 'none';
    document.getElementById('locations-section').style.display = 'block';
    window.location.hash = '';
}

// Load profile data
async function loadProfileData() {
    const userData = getUserData();
    if (!userData || !userData.id) {
        showProfileMessage('Error: User data not found', 'error');
        return;
    }

    try {
        const data = await apiRequest(API_ENDPOINTS.PROFILE(userData.id));
        const user = data.user || data;
        
        document.getElementById('profile-username').value = user.username || '';
        document.getElementById('profile-email').value = user.email || '';
        document.getElementById('profile-firstname').value = user.firstname || '';
        document.getElementById('profile-lastname').value = user.lastname || '';
        document.getElementById('profile-mobile').value = user.mobile_number || '';
        
        if (user.profile_picture) {
            const imageUrl = `https://geocrud.bytevortexz.com/uploads/${user.profile_picture}`;
            document.getElementById('current-profile-picture').innerHTML = `
                <small style="display: block; margin-bottom: 0.5rem; color: #6b7280;">Current profile picture:</small>
                <img src="${imageUrl}" style="max-width: 150px; border-radius: 50%; border: 2px solid #d1d5db;" 
                     onerror="this.style.display='none'">
            `;
        }
    } catch (error) {
        showProfileMessage('Error loading profile: ' + error.message, 'error');
    }
}

// Update profile
async function updateProfile(e) {
    e.preventDefault();
    
    const userData = getUserData();
    if (!userData || !userData.id) {
        showProfileMessage('Error: User data not found', 'error');
        return;
    }

    const formData = new FormData();
    formData.append('username', document.getElementById('profile-username').value);
    formData.append('email', document.getElementById('profile-email').value);
    
    const firstname = document.getElementById('profile-firstname').value;
    if (firstname) formData.append('firstname', firstname);
    
    const lastname = document.getElementById('profile-lastname').value;
    if (lastname) formData.append('lastname', lastname);
    
    const mobile = document.getElementById('profile-mobile').value;
    if (mobile) formData.append('mobile_number', mobile);
    
    const profilePicture = document.getElementById('profile-picture').files[0];
    if (profilePicture) formData.append('profile_picture', profilePicture);
    
    formData.append('_method', 'PUT');
    
    const submitBtn = document.querySelector('#profile-form button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating...';
    
    try {
        const token = getAuthToken();
        const response = await fetch(API_ENDPOINTS.PROFILE_UPDATE(userData.id), {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            },
            body: formData
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to update profile');
        }
        
        // Update user data in localStorage
        if (data.user) {
            setUserData(data.user);
            updateUIWithUserData(data.user);
        }
        
        showProfileMessage('Profile updated successfully!', 'success');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Profile';
        
    } catch (error) {
        showProfileMessage('Error: ' + error.message, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'Update Profile';
    }
}

// Show profile message
function showProfileMessage(message, type) {
    const messagesDiv = document.getElementById('profile-messages');
    const alertClass = type === 'success' ? 'alert-success' : 'alert-error';
    messagesDiv.innerHTML = `<div class="alert ${alertClass}">${message}</div>`;
    
    setTimeout(() => {
        messagesDiv.innerHTML = '';
    }, 5000);
}

// Add favorite location - explicitly attach to window for global access
window.addFavorite = async function(locationId) {
    try {
        const response = await apiRequest(`${API_BASE_URL}/member/favorites/${locationId}`, {
            method: 'POST'
        });

        if (response.success) {
            showMessage(response.message || 'Location added to favorites', 'success');
            // Reload locations to update favorite status
            loadLocations(currentSearch);
        } else {
            showMessage(response.message || 'Failed to add favorite. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error adding favorite:', error);
        showMessage('Error adding favorite: ' + (error.message || 'Unknown error'), 'error');
    }
};

// Remove favorite location - explicitly attach to window for global access
window.removeFavorite = async function(locationId) {
    if (!confirm('Are you sure you want to remove this location from your favorites?')) {
        return;
    }

    try {
        const response = await apiRequest(`${API_BASE_URL}/member/favorites/${locationId}`, {
            method: 'DELETE'
        });

        if (response.success) {
            showMessage(response.message || 'Location removed from favorites', 'success');
            // Reload locations to update favorite status
            loadLocations(currentSearch);
        } else {
            showMessage(response.message || 'Failed to remove favorite. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error removing favorite:', error);
        showMessage('Error removing favorite: ' + (error.message || 'Unknown error'), 'error');
    }
};

// Check hash on load
document.addEventListener('DOMContentLoaded', function() {
    if (window.location.hash === '#profile') {
        showProfileSection();
    }
    
    // Add click handlers for profile links
    document.querySelectorAll('a[href="#profile"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showProfileSection();
        });
    });
});

