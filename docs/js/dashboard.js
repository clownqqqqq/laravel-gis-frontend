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
        const canReserve = location.status === 'pending' && userRole === 'member';
        
        // Build location actions based on role
        let locationActions = '';
        if (userRole === 'member') {
            // Members see favorite buttons
            if (isFavorited) {
                locationActions = `
                <div class="location-actions" onclick="event.stopPropagation()">
                    <button onclick="removeFavorite(${locationId})" class="btn" style="background: #ffc107; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                        <span>⭐</span> Remove Favorite
                    </button>
                </div>
                `;
            } else {
                locationActions = `
                <div class="location-actions" onclick="event.stopPropagation()">
                    <button onclick="addFavorite(${locationId})" class="btn" style="background: #6c757d; color: white; padding: 8px 16px; border: none; border-radius: 6px; cursor: pointer;">
                        <span>⭐</span> Add to Favorites
                    </button>
                </div>
                `;
            }
        } else if (canEdit) {
            // Admin and staff see edit/delete buttons
            locationActions = `
                <div class="location-actions" onclick="event.stopPropagation()">
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
            <div class="card location-card" onclick="viewLocationDetails(${locationId})" style="cursor: pointer;">
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
                            ${canReserve ? '<span style="background: #10b981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 10px;">✓ Available for Reservation</span>' : ''}
                            ${location.status === 'approved' && userRole === 'member' ? '<span style="background: #fef3c7; color: #92400e; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; margin-left: 10px;">⚠️ Not Available for Reservation</span>' : ''}
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

// View location details (opens modal or shows details) - globally accessible
window.viewLocationDetails = async function(id) {
    try {
        const userData = getUserData();
        if (!userData) {
            showMessage('Please log in to view location details', 'error');
            return;
        }

        // Get location details from API
        const locationData = await apiRequest(`${API_BASE_URL}/member/locations/${id}`);
        
        if (!locationData.success || !locationData.data) {
            showMessage('Location not found', 'error');
            return;
        }

        const location = locationData.data;
        const userRole = userData.role || 'member';

        // Create modal HTML
        let modalContent = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="closeLocationModal(event)">
                <div class="card" style="max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;" onclick="event.stopPropagation()">
                    <button onclick="closeLocationModal()" style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>
                    <h2 style="color: #0d6efd; margin-bottom: 20px;">${location.location || 'Location Details'}</h2>
                    ${location.image ? `<img src="https://geocrud.bytevortexz.com/uploads/${location.image}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;" onerror="this.style.display='none'">` : ''}
                    <p><strong>Coordinates:</strong> Lat: ${location.latitude}, Lng: ${location.longitude}</p>
                    ${location.category ? `<p><strong>Category:</strong> ${location.category}</p>` : ''}
                    ${location.notes ? `<p><strong>Notes:</strong> ${location.notes}</p>` : ''}
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
        `;

        // Add buttons based on user role
        if (userRole === 'member') {
            // Only show reserve button if location is pending
            if (location.status === 'pending') {
                modalContent += `
                            <button onclick="declareIntendedUse(${location.id})" class="btn" style="background: #0d6efd; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                                <span>📋</span> Reserve This Location
                            </button>
                `;
            } else {
                modalContent += `
                            <p style="background: #fef3c7; color: #92400e; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                                ⚠️ This location has been approved and can no longer be reserved.
                            </p>
                `;
            }
            modalContent += `
                        <button onclick="viewIntendedUses(${location.id})" class="btn" style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                            <span>👁️</span> View Reservations
                        </button>
            `;
        }

        modalContent += `
                    </div>
                </div>
            </div>
        `;

        // Remove existing modal if any
        const existingModal = document.getElementById('location-modal');
        if (existingModal) {
            existingModal.remove();
        }

        // Add modal to page
        const modal = document.createElement('div');
        modal.id = 'location-modal';
        modal.innerHTML = modalContent;
        document.body.appendChild(modal);

    } catch (error) {
        console.error('Error loading location details:', error);
        showMessage('Error loading location details: ' + (error.message || 'Unknown error'), 'error');
    }
}

// Close location modal - globally accessible
window.closeLocationModal = function(event) {
    if (event && event.target !== event.currentTarget) {
        return; // Don't close if clicking inside modal
    }
    const modal = document.getElementById('location-modal');
    if (modal) {
        modal.remove();
    }
}

// View location (legacy function for compatibility)
function viewLocation(id) {
    viewLocationDetails(id);
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

// Declare intended use for a location - shows form modal
window.declareIntendedUse = async function(locationId) {
    // Get location details first to check status
    try {
        const locationData = await apiRequest(`${API_BASE_URL}/member/locations/${locationId}`);
        const location = locationData.data;
        
        // Check if location is pending (only pending locations can be reserved)
        if (location.status !== 'pending') {
            showMessage('This location has been approved and can no longer be reserved. Only pending locations can be reserved.', 'error');
            return;
        }
    } catch (error) {
        showMessage('Error loading location: ' + (error.message || 'Unknown error'), 'error');
        return;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    // Create reservation form modal
    const formModal = `
        <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="closeReservationModal(event)">
            <div class="card" style="max-width: 500px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;" onclick="event.stopPropagation()">
                <button onclick="closeReservationModal()" style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>
                <h2 style="color: #0d6efd; margin-bottom: 20px;">📋 Reserve Location</h2>
                <form id="reservation-form" onsubmit="submitReservation(event, ${locationId}); return false;">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">Intended Purpose *</label>
                        <select id="intended-type" name="intended_type" required style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px;">
                            <option value="">Select purpose...</option>
                            <option value="event">Event</option>
                            <option value="business">Business</option>
                            <option value="personal">Personal</option>
                            <option value="future_development">Future Development</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">Description (Optional)</label>
                        <textarea id="description" name="description" rows="4" maxlength="1000" placeholder="Describe your intended use..." style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px; resize: vertical;"></textarea>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">Start Date *</label>
                        <input type="date" id="start-date" name="intended_start_date" required min="${today}" style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px;">
                        <small style="color: #64748b; display: block; margin-top: 4px;">Cannot select past dates</small>
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1e293b;">End Date (Optional)</label>
                        <input type="date" id="end-date" name="intended_end_date" style="width: 100%; padding: 12px; border: 2px solid #d1d5db; border-radius: 8px; font-size: 16px;">
                        <small style="color: #64748b; display: block; margin-top: 4px;">Must be after start date</small>
                    </div>
                    
                    <div style="display: flex; gap: 10px; margin-top: 30px;">
                        <button type="button" onclick="closeReservationModal()" style="flex: 1; padding: 12px; background: #6c757d; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">Cancel</button>
                        <button type="submit" style="flex: 1; padding: 12px; background: #0d6efd; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 600;">Submit Reservation</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    // Remove existing reservation modal if any
    const existingModal = document.getElementById('reservation-modal');
    if (existingModal) {
        existingModal.remove();
    }

    // Add modal to page
    const modal = document.createElement('div');
    modal.id = 'reservation-modal';
    modal.innerHTML = formModal;
    document.body.appendChild(modal);

    // Set minimum end date based on start date
    const startDateInput = document.getElementById('start-date');
    const endDateInput = document.getElementById('end-date');
    
    startDateInput.addEventListener('change', function() {
        if (this.value) {
            const startDate = new Date(this.value);
            startDate.setDate(startDate.getDate() + 1); // End date must be after start date
            endDateInput.min = startDate.toISOString().split('T')[0];
        }
    });
}

// Close reservation modal
window.closeReservationModal = function(event) {
    if (event && event.target !== event.currentTarget) {
        return;
    }
    const modal = document.getElementById('reservation-modal');
    if (modal) {
        modal.remove();
    }
}

// Submit reservation form
window.submitReservation = async function(event, locationId) {
    event.preventDefault();
    
    const form = document.getElementById('reservation-form');
    const formData = new FormData(form);
    
    const startDate = formData.get('intended_start_date');
    const endDate = formData.get('intended_end_date');
    
    // Validate dates
    const today = new Date().toISOString().split('T')[0];
    if (startDate < today) {
        showMessage('Start date cannot be in the past', 'error');
        return;
    }
    
    if (endDate && endDate <= startDate) {
        showMessage('End date must be after start date', 'error');
        return;
    }
    
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    
    try {
        const response = await apiRequest(`${API_BASE_URL}/member/locations/${locationId}/intended-use`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                intended_type: formData.get('intended_type'),
                description: formData.get('description') || null,
                intended_start_date: startDate,
                intended_end_date: endDate || null
            })
        });

        if (response.success) {
            closeReservationModal();
            showMessage(response.message || 'Reservation request submitted successfully. Waiting for admin/staff approval.', 'success');
            // Reload locations to update status
            loadLocations(currentSearch);
        } else {
            showMessage(response.message || 'Failed to submit reservation', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    } catch (error) {
        console.error('Error submitting reservation:', error);
        let errorMsg = error.message || 'Unknown error';
        
        // Handle specific error messages
        if (errorMsg.includes('already approved')) {
            errorMsg = 'This location has been approved and can no longer be reserved.';
        } else if (errorMsg.includes('already reserved')) {
            errorMsg = 'This location already has an approved reservation.';
        }
        
        showMessage('Error: ' + errorMsg, 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// View intended uses for a location - shows modal
window.viewIntendedUses = async function(locationId) {
    try {
        const response = await apiRequest(`${API_BASE_URL}/member/locations/${locationId}/intended-uses`);
        
        if (!response.success || !response.data || response.data.length === 0) {
            showMessage('No reservations found for this location', 'info');
            return;
        }

        const intendedUses = response.data;
        const statusColors = {
            'pending': '#fef3c7',
            'approved': '#d1f4e0',
            'rejected': '#fee2e2',
            'completed': '#e0e7ff',
            'cancelled': '#f3f4f6'
        };
        
        let usesList = '<h3 style="color: #0d6efd; margin-bottom: 20px;">📋 Reservations for This Location</h3>';
        
        intendedUses.forEach(use => {
            const statusColor = statusColors[use.status] || '#f9fafb';
            usesList += `
                <div style="background: ${statusColor}; padding: 15px; margin: 10px 0; border-radius: 8px; border-left: 4px solid #0d6efd;">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 10px;">
                        <strong style="text-transform: capitalize; color: #1e293b;">${use.intended_type.replace('_', ' ')}</strong>
                        <span style="background: ${use.status === 'approved' ? '#10b981' : use.status === 'rejected' ? '#ef4444' : '#f59e0b'}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600; text-transform: capitalize;">${use.status}</span>
                    </div>
                    ${use.description ? `<p style="margin: 8px 0; color: #475569;"><strong>Description:</strong> ${use.description}</p>` : ''}
                    <p style="margin: 5px 0; color: #64748b;"><strong>Start Date:</strong> ${use.intended_start_date}</p>
                    ${use.intended_end_date ? `<p style="margin: 5px 0; color: #64748b;"><strong>End Date:</strong> ${use.intended_end_date}</p>` : ''}
                    <p style="margin: 5px 0; color: #64748b;"><strong>Reserved by:</strong> ${use.user ? use.user.username : 'Unknown'}</p>
                    <p style="margin: 5px 0; color: #64748b; font-size: 12px;"><strong>Submitted:</strong> ${new Date(use.created_at).toLocaleDateString()}</p>
                </div>
            `;
        });
        
        // Create modal
        const modal = `
            <div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px;" onclick="closeReservationsViewModal(event)">
                <div class="card" style="max-width: 600px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative;" onclick="event.stopPropagation()">
                    <button onclick="closeReservationsViewModal()" style="position: absolute; top: 10px; right: 10px; background: #ef4444; color: white; border: none; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 18px;">×</button>
                    ${usesList}
                </div>
            </div>
        `;
        
        // Remove existing modal if any
        const existingModal = document.getElementById('reservations-view-modal');
        if (existingModal) {
            existingModal.remove();
        }
        
        // Add modal to page
        const modalDiv = document.createElement('div');
        modalDiv.id = 'reservations-view-modal';
        modalDiv.innerHTML = modal;
        document.body.appendChild(modalDiv);
        
    } catch (error) {
        console.error('Error loading intended uses:', error);
        showMessage('Error loading reservations: ' + (error.message || 'Unknown error'), 'error');
    }
}

// Close reservations view modal
window.closeReservationsViewModal = function(event) {
    if (event && event.target !== event.currentTarget) {
        return;
    }
    const modal = document.getElementById('reservations-view-modal');
    if (modal) {
        modal.remove();
    }
}

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

