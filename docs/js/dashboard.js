// Dashboard JavaScript
let currentLocations = [];
let currentSearch = '';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    // Mark page load time for auth error handling
    window.pageLoadTime = Date.now();
    
    // Check authentication
    const token = getAuthToken();
    console.log('Dashboard loaded - Token check:', token ? 'YES (' + token.substring(0, 20) + '...)' : 'NO');
    
    if (!token || !isAuthenticated()) {
        console.log('Not authenticated, redirecting to login...');
        window.location.href = 'login.html';
        return;
    }
    
    // Wait a moment to ensure token is properly set, then load data
    setTimeout(() => {
        // Verify token is still there
        const verifyToken = getAuthToken();
        if (!verifyToken) {
            console.error('Token lost! Redirecting to login...');
            window.location.href = 'login.html';
            return;
        }
        
        // Load user info first
        loadUserInfo().then(() => {
            // Then load locations after user info is loaded
            loadLocations();
        }).catch(error => {
            console.error('Error loading user info:', error);
            // Still try to load locations
            loadLocations();
        });
        
        // Search on Enter key
        const searchInput = document.getElementById('search');
        if (searchInput) {
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    searchLocations(e);
                }
            });
        }
    }, 300); // Small delay to ensure localStorage is ready
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
    
    console.log('Loading locations - Token:', token.substring(0, 20) + '...');
    
    loadingDiv.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    
    try {
        let url = API_ENDPOINTS.GIS_INDEX;
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        console.log('Fetching locations from:', url);
        const data = await apiRequest(url);
        console.log('Locations data received:', data);
        
        // Handle different response formats
        if (data.success && data.data) {
            currentLocations = Array.isArray(data.data) ? data.data : [];
        } else if (data.locations) {
            currentLocations = Array.isArray(data.locations) ? data.locations : [];
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
        
        // Check if it's an authentication error
        if (error.message && (error.message.includes('Authentication failed') || error.message.includes('Unauthorized') || error.message.includes('401'))) {
            console.error('Authentication error when loading locations');
            // Don't immediately redirect - check if token still exists
            const currentToken = getAuthToken();
            if (!currentToken) {
                // Token was removed, redirect to login
                showMessage('Your session has expired. Redirecting to login...', 'error');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2000);
                return;
            } else {
                // Token exists but API rejected it - might be backend issue
                showMessage('Authentication error. Please try refreshing the page or log in again.', 'error');
                console.error('Token exists but API rejected:', {
                    token: currentToken.substring(0, 20) + '...',
                    error: error.message
                });
            }
            return;
        }
        
        const errorMessage = error.message || 'Failed to load locations. Please try again.';
        showMessage('Error loading locations: ' + errorMessage, 'error');
        console.error('Error loading locations:', error);
        
        // Show empty state if there was an error
        container.innerHTML = '';
        emptyState.style.display = 'block';
    }
}

// Render locations in the grid
function renderLocations(locations) {
    const container = document.getElementById('locations-container');
    const userData = getUserData();
    const userRole = userData?.role || 'member';
    
    if (locations.length === 0) {
        document.getElementById('empty-state').style.display = 'block';
        return;
    }
    
    container.innerHTML = locations.map(location => {
        const imageUrl = location.image 
            ? `https://geocrud.bytevortexz.com/uploads/${location.image}`
            : '';
        
        const statusBadge = getStatusBadge(location.status, userRole);
        const canEdit = userRole === 'admin' || (userRole === 'staff' && location.status === 'approved');
        
        return `
            <div class="card location-card">
                <div class="location-content">
                    ${imageUrl ? `
                    <div class="location-image-wrapper">
                        <img src="${imageUrl}" alt="${location.location}" class="location-image" onerror="this.style.display='none'">
                    </div>
                    ` : ''}
                    <div class="location-details">
                        <h3 class="location-name">
                            ${location.location}
                            ${statusBadge}
                        </h3>
                        <p class="location-coords">
                            Lat: ${location.latitude} &nbsp;&nbsp;&nbsp;&nbsp; Lng: ${location.longitude}
                        </p>
                        ${location.category ? `<p style="margin: 5px 0; color: #64748b; font-size: 14px;">${location.category}</p>` : ''}
                        ${location.notes ? `<p style="margin: 10px 0; color: #475569; font-size: 14px;">${location.notes.length > 100 ? location.notes.substring(0, 100) + '...' : location.notes}</p>` : ''}
                    </div>
                </div>
                ${canEdit ? `
                <div class="location-actions">
                    <a href="edit-location.html?id=${location.id}" class="btn btn-edit">
                        <span>✏️</span> Edit
                    </a>
                    <form class="location-delete-form" onsubmit="deleteLocation(${location.id}); return false;">
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

