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
            alert('Admin panel - Would redirect to admin dashboard in full implementation');
        };
    }
    
    // Show admin access panel if user is admin
    const adminAccessPanel = document.getElementById('admin-access-panel');
    if (adminAccessPanel && userData.role === 'admin') {
        adminAccessPanel.style.display = 'block';
    }
    
    // Show Manage Users button if user is admin
    const manageUsersBtn = document.getElementById('manage-users-btn');
    if (manageUsersBtn && userData.role === 'admin') {
        manageUsersBtn.style.display = 'inline-block';
    }
    
    // Update add location button visibility based on role
    const addLocationBtn = document.querySelector('.btn-add-location');
    if (addLocationBtn) {
        // Only admin and staff can add locations
        if (userData.role !== 'admin' && userData.role !== 'staff') {
            addLocationBtn.style.display = 'none';
        }
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
        
        // Handle API response format: {success: true, data: [...]}
        if (data.success && Array.isArray(data.data)) {
            currentLocations = data.data;
        } else if (Array.isArray(data.locations)) {
            currentLocations = data.locations;
        } else if (Array.isArray(data)) {
            currentLocations = data;
        } else {
            currentLocations = [];
        }
        
        loadingDiv.style.display = 'none';
        
        if (currentLocations.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        renderLocations(currentLocations);
        
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
    
    if (!Array.isArray(locations) || locations.length === 0) {
        document.getElementById('empty-state').style.display = 'block';
        return;
    }
    
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
        
        return `
            <div class="card location-card">
                <div class="location-content">
                    ${imageUrl ? `
                    <div class="location-image-wrapper">
                        <img src="${imageUrl}" alt="${locationName}" class="location-image" onerror="this.style.display='none'">
                    </div>
                    ` : '<div class="location-image-wrapper" style="width: 200px; height: 200px; background: #f3f4f6; border-radius: 12px; display: flex; align-items: center; justify-content: center; border: 3px solid #0d6efd; flex-shrink: 0;"><span style="font-size: 48px;">📍</span></div>'}
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
                ${canEdit ? `
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
                ` : ''}
            </div>
        `;
    }).join('');
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

