// Dashboard JavaScript
let currentLocations = [];
let currentSearch = '';

// Global date formatting functions - must be available everywhere
// Function to format date input as user types (mm/dd/yyyy)
window.formatDateInput = function(input) {
    if (!input) return;
    let value = input.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 8) value = value.substring(0, 8);
    
    // Add slashes automatically
    if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    }
    if (value.length > 5) {
        value = value.substring(0, 5) + '/' + value.substring(5);
    }
    
    input.value = value;
};

// Function to sync text input (mm/dd/yyyy) to hidden input (YYYY-MM-DD)
window.syncDateInput = function(textInput, hiddenInputId) {
    if (!textInput) return;
    const hiddenInput = document.getElementById(hiddenInputId);
    if (!hiddenInput) return;
    
    const value = textInput.value.trim();
    if (!value) {
        hiddenInput.value = '';
        return;
    }
    
    // Parse mm/dd/yyyy format
    const parts = value.split('/');
    if (parts.length !== 3) {
        hiddenInput.value = '';
        return;
    }
    
    const month = parseInt(parts[0], 10);
    const day = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    
    if (isNaN(month) || isNaN(day) || isNaN(year) || month < 1 || month > 12 || day < 1 || day > 31) {
        hiddenInput.value = '';
        return;
    }
    
    // Convert to YYYY-MM-DD format
    const date = new Date(year, month - 1, day);
    if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
        hiddenInput.value = '';
        return;
    }
    
    const formattedDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    hiddenInput.value = formattedDate;
};

// Function to update date display from date picker (YYYY-MM-DD to MM-DD-YYYY)
window.updateDateDisplayFromPicker = function(dateInput, displayId, hiddenInputId) {
    const displayElement = document.getElementById(displayId);
    const hiddenInput = document.getElementById(hiddenInputId);
    
    if (!dateInput || !dateInput.value) {
        if (displayElement) displayElement.textContent = '';
        if (hiddenInput) hiddenInput.value = '';
        return;
    }
    
    // Date input already has YYYY-MM-DD format, store it in hidden input
    if (hiddenInput) {
        hiddenInput.value = dateInput.value;
    }
    
    // Convert to MM-DD-YYYY for display
    const dateStr = dateInput.value.split('T')[0];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const month = parts[1].padStart(2, '0');
        const day = parts[2].padStart(2, '0');
        const year = parts[0]; // Full year
        
        if (displayElement) {
            displayElement.textContent = `${month}-${day}-${year}`;
        }
    } else {
        if (displayElement) displayElement.textContent = '';
    }
};

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
            
            // Check if a specific location ID is requested via URL parameter
            const urlParams = new URLSearchParams(window.location.search);
            const locationId = urlParams.get('location');
            if (locationId) {
                loadSingleLocation(locationId);
            } else {
            loadLocations();
            }
            
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
    
    // Hide admin pill button in the header (no longer used)
    const adminBtn = document.getElementById('admin-btn');
    if (adminBtn) {
        adminBtn.style.display = 'none';
    }
    
    // Show admin header buttons (beside Add Location) only for admin users
    const adminHeaderButtons = [
        document.getElementById('admin-dashboard-btn'),
        document.getElementById('admin-manage-users-btn'),
        document.getElementById('admin-manage-reservations-btn'),
    ];
    adminHeaderButtons.forEach(btn => {
        if (!btn) return;
        if (userData.role === 'admin') {
            btn.style.display = 'inline-flex';
            btn.style.visibility = 'visible';
        } else {
            btn.style.display = 'none';
            btn.style.visibility = 'hidden';
        }
    });
    
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
    
    // Show/hide staff dashboard (only show in locations section, not in profile section)
    const staffDashboard = document.getElementById('staff-dashboard');
    const profileSection = document.getElementById('profile-section');
    if (staffDashboard) {
        if (userData.role === 'staff') {
            // Check if profile is active via hash or display style
            const isProfileActive = window.location.hash === '#profile' || 
                                   (profileSection && profileSection.style.display === 'block');
            if (!isProfileActive) {
            staffDashboard.style.display = 'block';
            loadStaffStatistics();
            } else {
                staffDashboard.style.display = 'none';
            }
            
            // Set up a periodic check to ensure staff dashboard stays hidden when profile is active
            setInterval(() => {
                const profileActive = window.location.hash === '#profile' || 
                                    (profileSection && profileSection.style.display === 'block');
                if (profileActive && staffDashboard.style.display !== 'none') {
                    staffDashboard.style.display = 'none';
                }
            }, 100);
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

// Load a single location by ID
async function loadSingleLocation(locationId) {
    const loadingDiv = document.getElementById('loading');
    const container = document.getElementById('locations-container');
    const emptyState = document.getElementById('empty-state');
    const searchForm = document.getElementById('searchForm');
    const searchSection = searchForm ? searchForm.closest('.search-section') || searchForm.parentElement : null;
    
    // Hide search section when viewing a single location
    if (searchSection) {
        searchSection.style.display = 'none';
    }
    
    // Add a "Back to All Locations" button at the top
    const pageTitle = document.querySelector('h1');
    if (pageTitle && !document.getElementById('back-to-all-btn')) {
        const backBtn = document.createElement('button');
        backBtn.id = 'back-to-all-btn';
        backBtn.innerHTML = '← Back to All Locations';
        backBtn.className = 'btn';
        backBtn.style.cssText = 'margin-left: 20px; background: #6c757d; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer; font-weight: 600;';
        backBtn.onclick = () => {
            window.location.href = 'dashboard.html';
        };
        pageTitle.parentElement.insertBefore(backBtn, pageTitle.nextSibling);
    }
    
    // Verify token before making request
    const token = getAuthToken();
    if (!token) {
        console.error('No token found when loading location!');
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
        // Get user role to determine the correct endpoint
        const userData = getUserData();
        let url;
        
        if (userData && userData.role === 'member') {
            url = `${API_BASE_URL}/member/locations/${locationId}`;
        } else {
            // For admin/staff, try to get from member endpoint or use a general endpoint
            url = `${API_BASE_URL}/member/locations/${locationId}`;
        }
        
        const data = await apiRequest(url);
        
        console.log('📍 Single Location API response:', data);
        
        if (data.success && data.data) {
            const location = data.data;
            currentLocations = [location];
            
            // Check if it's a favorite (for members)
            if (userData && userData.role === 'member') {
                try {
                    const favoritesResponse = await apiRequest(`${API_BASE_URL}/member/favorites`);
                    if (favoritesResponse.success && Array.isArray(favoritesResponse.data)) {
                        const favoriteIds = favoritesResponse.data.map(f => f.id || f.location_id);
                        currentLocations[0].is_favorite = favoriteIds.includes(location.id);
                    }
                } catch (error) {
                    console.warn('Could not load favorites (non-fatal):', error);
                }
            }
            
            loadingDiv.style.display = 'none';
            
            if (currentLocations.length === 0) {
                emptyState.style.display = 'block';
                emptyState.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 48px; margin-bottom: 16px;">📍</div>
                        <p style="color: #6b7280; font-size: 16px;">Location not found.</p>
                        <button onclick="window.location.href='dashboard.html'" class="btn" style="margin-top: 16px; background: #0d6efd; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;">
                            ← Back to All Locations
                        </button>
                    </div>
                `;
                return;
            }
            
            console.log('🎨 Rendering single location...');
            renderLocations(currentLocations);
            console.log('✅ Location rendered successfully!');
            
            // Scroll to the location card
            setTimeout(() => {
                const locationCard = document.querySelector('.location-card');
                if (locationCard) {
                    locationCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }, 100);
        } else {
            loadingDiv.style.display = 'none';
            emptyState.style.display = 'block';
            emptyState.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <div style="font-size: 48px; margin-bottom: 16px;">📍</div>
                    <p style="color: #6b7280; font-size: 16px;">Location not found or you don't have permission to view it.</p>
                    <button onclick="window.location.href='dashboard.html'" class="btn" style="margin-top: 16px; background: #0d6efd; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;">
                        ← Back to All Locations
                    </button>
                </div>
            `;
        }
    } catch (error) {
        loadingDiv.style.display = 'none';
        console.error('Error loading single location:', error);
        emptyState.style.display = 'block';
        emptyState.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 48px; margin-bottom: 16px;">⚠️</div>
                <p style="color: #6b7280; font-size: 16px;">Error loading location: ${error.message || 'Unknown error'}</p>
                <button onclick="window.location.href='dashboard.html'" class="btn" style="margin-top: 16px; background: #0d6efd; color: white; padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;">
                    ← Back to All Locations
                </button>
            </div>
        `;
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
        // Members can reserve both pending AND approved locations
        const canReserve = (location.status === 'pending' || location.status === 'approved') && userRole === 'member';
        
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
            // Show reserve button if location is pending OR approved (both are allowed)
            if (location.status === 'pending' || location.status === 'approved') {
                modalContent += `
                            <button onclick="declareIntendedUse(${location.id})" class="btn" style="background: #0d6efd; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; margin-right: 10px;">
                                <span>📋</span> Declare Intended Use
                            </button>
                `;
            } else {
                modalContent += `
                            <p style="background: #fee2e2; color: #991b1b; padding: 12px; border-radius: 8px; margin-bottom: 15px;">
                                ⚠️ This location is not available for reservation. Only pending or approved locations can be reserved.
                            </p>
                `;
            }
            modalContent += `
                        <button onclick="viewIntendedUses(${location.id})" class="btn" style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer;">
                            <span>👁️</span> View Intended Uses
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

// Declare intended use for a location - shows form modal with calendar pickers
window.declareIntendedUse = async function(locationId) {
    // Get location details first to check status
    let location;
    let existingReservations = [];
    
    try {
        const locationData = await apiRequest(`${API_BASE_URL}/member/locations/${locationId}`);
        location = locationData.data;
        
        // Check if location is pending or approved (both are allowed for reservations)
        if (location.status !== 'pending' && location.status !== 'approved') {
            showMessage('This location is not available for reservation. Only pending or approved locations can be reserved.', 'error');
            return;
        }
        
        // Load existing reservations to check for conflicts
        try {
            const reservationsData = await apiRequest(`${API_BASE_URL}/member/locations/${locationId}/intended-uses`);
            if (reservationsData && reservationsData.success && reservationsData.data) {
                existingReservations = reservationsData.data.filter(r => 
                    r.status === 'approved' || r.status === 'pending'
                );
            }
        } catch (err) {
            console.warn('Could not load existing reservations:', err);
        }
        
        // Note: Multiple users CAN reserve the same location
        // Date+time conflicts will be checked on submit by the backend
    } catch (error) {
        showMessage('Error loading location: ' + (error.message || 'Unknown error'), 'error');
        return;
    }

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    // Create reservation form modal with better styling
    const formModal = `
        <div id="reservation-modal-overlay" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.6); z-index: 2000; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px);" onclick="closeReservationModal(event)">
            <div style="background: white; max-width: 550px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; border-radius: 16px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);" onclick="event.stopPropagation()">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%); padding: 24px; border-radius: 16px 16px 0 0; position: relative;">
                    <button onclick="closeReservationModal()" style="position: absolute; top: 16px; right: 16px; background: rgba(255,255,255,0.2); color: white; border: 2px solid rgba(255,255,255,0.3); border-radius: 50%; width: 36px; height: 36px; cursor: pointer; font-size: 20px; font-weight: bold; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
                    <h2 style="color: white; margin: 0; font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 32px;">📋</span> Reserve Location
                    </h2>
                    <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 14px;">${location.location || 'Location'}</p>
                </div>
                
                <!-- Form Content -->
                <div class="reservation-form-content" style="padding: 30px;">
                    <form id="reservation-form" onsubmit="submitReservation(event, ${locationId}); return false;">
                        <!-- Intended Purpose -->
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #1e293b; font-size: 15px;">
                                <span style="color: #ef4444;">*</span> Intended Purpose
                            </label>
                            <select id="intended-type" name="intended_type" required style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; background: white; color: #1e293b; transition: all 0.2s; cursor: pointer;" onfocus="this.style.borderColor='#0d6efd'; this.style.boxShadow='0 0 0 3px rgba(13, 110, 253, 0.1)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                <option value="">-- Select your intended purpose --</option>
                                <option value="event">🎉 Event (Wedding, Party, Gathering, etc.)</option>
                                <option value="business">💼 Business (Store, Office, Restaurant, etc.)</option>
                                <option value="personal">👤 Personal Use</option>
                                <option value="future_development">🏗️ Future Development (Construction, Building, etc.)</option>
                            </select>
                        </div>
                        
                        <!-- Description -->
                        <div style="margin-bottom: 24px;">
                            <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #1e293b; font-size: 15px;">
                                Description <span style="color: #64748b; font-weight: 400; font-size: 13px;">(Optional)</span>
                            </label>
                            <textarea id="description" name="description" rows="4" maxlength="1000" placeholder="Provide more details about your intended use..." style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; resize: vertical; font-family: inherit; transition: all 0.2s;" onfocus="this.style.borderColor='#0d6efd'; this.style.boxShadow='0 0 0 3px rgba(13, 110, 253, 0.1)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'"></textarea>
                            <small style="color: #64748b; display: block; margin-top: 6px; font-size: 13px;">Maximum 1000 characters</small>
                        </div>
                        
                        <!-- Date Selection Section -->
                        <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                            <h3 style="margin: 0 0 16px 0; color: #1e293b; font-size: 16px; font-weight: 600; display: flex; align-items: center; gap: 8px;">
                                <span style="font-size: 20px;">📅</span> Reservation Period
                            </h3>
                            
                            <!-- Start Date and Time -->
                            <div style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #1e293b; font-size: 15px;">
                                    <span style="color: #ef4444;">*</span> Start Date & Time
                                </label>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div style="position: relative;">
                                        <input type="hidden" id="start-date-hidden" name="intended_start_date">
                                        <input type="date" id="start-date" required min="${tomorrowStr}" style="width: 100%; padding: 14px 16px 14px 120px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; background: white; color: #1e293b; transition: all 0.2s;" onfocus="this.style.borderColor='#0d6efd'; this.style.boxShadow='0 0 0 3px rgba(13, 110, 253, 0.1)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';" onchange="updateDateDisplayFromPicker(this, 'start-date-display', 'start-date-hidden');">
                                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; pointer-events: none;">📅</span>
                                        <span id="start-date-display" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #0d6efd; pointer-events: none; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #e5e7eb; z-index: 10;"></span>
                                    </div>
                                    <div style="position: relative;">
                                        <input type="time" id="start-time" name="intended_start_time" style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; background: white; color: #1e293b; cursor: pointer; transition: all 0.2s;" onfocus="this.style.borderColor='#0d6efd'; this.style.boxShadow='0 0 0 3px rgba(13, 110, 253, 0.1)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                    </div>
                                </div>
                                <small style="color: #64748b; display: block; margin-top: 6px; font-size: 13px;">Select date (displays as MM-DD-YYYY). Time is optional, defaults to 12:00 AM</small>
                            </div>
                            
                            <!-- End Date and Time -->
                            <div>
                                <label style="display: block; margin-bottom: 10px; font-weight: 600; color: #1e293b; font-size: 15px;">
                                    End Date & Time <span style="color: #64748b; font-weight: 400; font-size: 13px;">(Optional)</span>
                                </label>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                    <div style="position: relative;">
                                        <input type="hidden" id="end-date-hidden" name="intended_end_date">
                                        <input type="date" id="end-date" style="width: 100%; padding: 14px 16px 14px 120px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; background: white; color: #1e293b; transition: all 0.2s;" onfocus="this.style.borderColor='#0d6efd'; this.style.boxShadow='0 0 0 3px rgba(13, 110, 253, 0.1)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none';" onchange="updateDateDisplayFromPicker(this, 'end-date-display', 'end-date-hidden');">
                                        <span style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); font-size: 20px; pointer-events: none;">📅</span>
                                        <span id="end-date-display" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 13px; font-weight: 600; color: #0d6efd; pointer-events: none; background: white; padding: 2px 6px; border-radius: 4px; border: 1px solid #e5e7eb; z-index: 10;"></span>
                                    </div>
                                    <div style="position: relative;">
                                        <input type="time" id="end-time" name="intended_end_time" style="width: 100%; padding: 14px 16px; border: 2px solid #e5e7eb; border-radius: 10px; font-size: 16px; background: white; color: #1e293b; cursor: pointer; transition: all 0.2s;" onfocus="this.style.borderColor='#0d6efd'; this.style.boxShadow='0 0 0 3px rgba(13, 110, 253, 0.1)'" onblur="this.style.borderColor='#e5e7eb'; this.style.boxShadow='none'">
                                    </div>
                                </div>
                                <small style="color: #64748b; display: block; margin-top: 6px; font-size: 13px;">Select date (displays as MM-DD-YYYY). Must be after start date/time. Time defaults to 11:59 PM if not specified</small>
                            </div>
                        </div>
                        
                        <!-- Action Buttons -->
                        <div style="display: flex; gap: 12px; margin-top: 30px;">
                            <button type="button" onclick="closeReservationModal()" style="flex: 1; padding: 14px 20px; background: #f3f4f6; color: #374151; border: 2px solid #e5e7eb; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.2s;" onmouseover="this.style.background='#e5e7eb'" onmouseout="this.style.background='#f3f4f6'">
                                Cancel
                            </button>
                            <button type="submit" id="submit-reservation-btn" style="flex: 1; padding: 14px 20px; background: linear-gradient(135deg, #0d6efd 0%, #0b5ed7 100%); color: white; border: none; border-radius: 10px; cursor: pointer; font-size: 16px; font-weight: 600; transition: all 0.2s; box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);" onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(13, 110, 253, 0.4)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(13, 110, 253, 0.3)'">
                                <span>✓</span> Submit Reservation
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <style>
            /* Text input styling for date fields */
            #start-date, #end-date {
                font-family: monospace;
            }
        </style>
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

    // Date formatting functions are now defined globally at the top of the file

    // Set minimum end date based on start date and validate date+time
    const startDateInput = document.getElementById('start-date');
    const startDateHidden = document.getElementById('start-date-hidden');
    const startTimeInput = document.getElementById('start-time');
    const endDateInput = document.getElementById('end-date');
    const endDateHidden = document.getElementById('end-date-hidden');
    const endTimeInput = document.getElementById('end-time');
    
    // Initialize date displays if values exist
    if (startDateInput && startDateInput.value) {
        updateDateDisplayFromPicker(startDateInput, 'start-date-display', 'start-date-hidden');
    }
    if (endDateInput && endDateInput.value) {
        updateDateDisplayFromPicker(endDateInput, 'end-date-display', 'end-date-hidden');
    }
    
    // Function to validate start date/time must be tomorrow or later
    function validateStartDateTime() {
        if (!startDateInput || !startDateInput.value) return true;
        
        const startDate = new Date(startDateInput.value + 'T00:00:00');
        if (isNaN(startDate.getTime())) {
            showMessage('Invalid date selected', 'error');
            return false;
        }
        
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        
        // Check if date is today or in the past (must be tomorrow or later)
        if (startDate < tomorrow) {
            const tomorrowStr = tomorrow.toISOString().split('T')[0];
            showMessage('Start date must be tomorrow or later. Reservations cannot be made for today.', 'error');
            startDateInput.value = tomorrowStr;
            updateDateDisplayFromPicker(startDateInput, 'start-date-display', 'start-date-hidden');
            startTimeInput.value = '';
            return false;
        }
        
        // Sync to hidden input
        updateDateDisplayFromPicker(startDateInput, 'start-date-display', 'start-date-hidden');
        return true;
    }
    
    // Update end date validation when start date changes
    startDateInput.addEventListener('change', function() {
        validateStartDateTime();
        if (this.value) {
            endDateInput.min = this.value;
        }
        if (endDateInput.value) {
            validateEndDateTime();
        }
    });
    
    endDateInput.addEventListener('change', function() {
        updateDateDisplayFromPicker(this, 'end-date-display', 'end-date-hidden');
        validateEndDateTime();
    });
    
    // When start time changes, validate it's not in the past
    startTimeInput.addEventListener('change', function() {
        validateStartDateTime();
    });
    
    // Validate end date/time when changed
    function validateEndDateTime() {
        if (!endDateInput.value && !endTimeInput.value) return true;
        
        if (!endDateInput.value) {
            return true; // End date is optional
        }
        
        if (!startDateInput.value) {
            showMessage('Please select a start date first', 'error');
            return false;
        }
        
        const startDate = new Date(startDateInput.value + 'T00:00:00');
        const endDate = new Date(endDateInput.value + 'T00:00:00');
        const startTime = startTimeInput.value || '00:00';
        const endTime = endTimeInput.value || '23:59';
        
        const startDateTime = new Date(startDate);
        const [startHour, startMin] = startTime.split(':').map(Number);
        startDateTime.setHours(startHour, startMin, 0, 0);
        
        const endDateTime = new Date(endDate);
        const [endHour, endMin] = endTime.split(':').map(Number);
        endDateTime.setHours(endHour, endMin, 59, 999);
        
        if (endDateTime <= startDateTime) {
            showMessage('End date/time must be after start date/time', 'error');
            return false;
        }
        
        return true;
    }
    
    endTimeInput.addEventListener('change', validateEndDateTime);
    startTimeInput.addEventListener('change', validateEndDateTime);
}

// Show prominent error message in the reservation modal
window.showModalError = function(message) {
    // Remove existing error if any
    const existingError = document.getElementById('reservation-modal-error');
    if (existingError) {
        existingError.remove();
    }
    
    // Find the form content container
    const formContent = document.querySelector('#reservation-modal .reservation-form-content');
    if (!formContent) {
        // Fallback: find the form itself
        const form = document.getElementById('reservation-form');
        if (!form) return;
        
        // Create error alert box
        const errorBox = document.createElement('div');
        errorBox.id = 'reservation-modal-error';
        errorBox.style.cssText = 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); position: relative; animation: slideDown 0.3s ease-out;';
        errorBox.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 24px; flex-shrink: 0;">⚠️</div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 6px;">Cannot Reserve This Location</div>
                    <div style="font-size: 14px; line-height: 1.5; opacity: 0.95;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 18px; font-weight: bold; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
            </div>
        `;
        
        // Insert before the form
        form.parentNode.insertBefore(errorBox, form);
        
        // Auto-scroll to error
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
        // Create error alert box
        const errorBox = document.createElement('div');
        errorBox.id = 'reservation-modal-error';
        errorBox.style.cssText = 'background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 20px; border-radius: 12px; margin-bottom: 24px; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); position: relative; animation: slideDown 0.3s ease-out;';
        errorBox.innerHTML = `
            <div style="display: flex; align-items: flex-start; gap: 12px;">
                <div style="font-size: 24px; flex-shrink: 0;">⚠️</div>
                <div style="flex: 1;">
                    <div style="font-weight: 700; font-size: 16px; margin-bottom: 6px;">Cannot Reserve This Location</div>
                    <div style="font-size: 14px; line-height: 1.5; opacity: 0.95;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" style="background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; font-size: 18px; font-weight: bold; flex-shrink: 0; transition: all 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.3)'" onmouseout="this.style.background='rgba(255,255,255,0.2)'">×</button>
            </div>
        `;
        
        // Insert at the top of form content
        formContent.insertBefore(errorBox, formContent.firstChild);
        
        // Auto-scroll to error
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Add animation style if not already added
    if (!document.getElementById('reservation-error-animation-style')) {
        const style = document.createElement('style');
        style.id = 'reservation-error-animation-style';
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        document.head.appendChild(style);
    }
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
    // Also close location details modal if open
    const locationModal = document.getElementById('location-modal');
    if (locationModal) {
        locationModal.remove();
    }
}

// Submit reservation form
window.submitReservation = async function(event, locationId) {
    event.preventDefault();
    
    // Sync date inputs to hidden inputs before submission
    const startDateInput = document.getElementById('start-date');
    const startDateHidden = document.getElementById('start-date-hidden');
    const endDateInput = document.getElementById('end-date');
    const endDateHidden = document.getElementById('end-date-hidden');
    
    if (startDateInput && startDateHidden && typeof window.updateDateDisplayFromPicker === 'function') {
        window.updateDateDisplayFromPicker(startDateInput, 'start-date-display', 'start-date-hidden');
    }
    if (endDateInput && endDateHidden && typeof window.updateDateDisplayFromPicker === 'function') {
        window.updateDateDisplayFromPicker(endDateInput, 'end-date-display', 'end-date-hidden');
    }
    
    // Get dates from hidden inputs (already in YYYY-MM-DD format)
    const startDate = startDateHidden ? startDateHidden.value : (startDateInput ? startDateInput.value : '');
    const endDate = endDateHidden ? endDateHidden.value : (endDateInput ? endDateInput.value : '');
    
    if (!startDate) {
        const errorMsg = 'Please select a valid start date';
        showModalError(errorMsg);
        showMessage(errorMsg, 'error');
        return;
    }
    
    const form = document.getElementById('reservation-form');
    const formData = new FormData(form);
    
    const startTime = formData.get('intended_start_time') || '00:00';
    const endTime = formData.get('intended_end_time') || '23:59';
    
    // Validate dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    if (startDate < tomorrowStr) {
        const errorMsg = 'Start date must be tomorrow or later. Reservations cannot be made for today.';
        showModalError(errorMsg);
        showMessage(errorMsg, 'error');
        return;
    }
    
    // Validate date+time
    const startDateTime = new Date(startDate + 'T' + startTime);
    const endDateTime = endDate ? new Date(endDate + 'T' + endTime) : new Date(startDate + 'T' + endTime);
    
    // Check if start date/time is in the past (for both today and past dates)
    const now = new Date();
    if (startDateTime < now) {
        const errorMsg = 'Start date and time cannot be in the past. Please select a future date and time.';
        showModalError(errorMsg);
        showMessage(errorMsg, 'error');
        return;
    }
    
    if (endDateTime <= startDateTime) {
        const errorMsg = 'End date/time must be after start date/time';
        showModalError(errorMsg);
        showMessage(errorMsg, 'error');
        return;
    }
    
    const submitBtn = document.getElementById('submit-reservation-btn');
    const originalHTML = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span> Submitting...';
    submitBtn.style.opacity = '0.7';
    
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
                intended_start_time: formData.get('intended_start_time') || null,
                intended_end_date: endDate || null,
                intended_end_time: formData.get('intended_end_time') || null
            })
        });

        // Check if response has error
        if (!response) {
            throw new Error('No response from server');
        }

        if (response.error || !response.success) {
            // Show detailed error message from backend (includes date conflicts)
            const errorMsg = response.message || response.error || 'Failed to submit reservation';
            
            // Show prominent error popup in the modal
            showModalError(errorMsg);
            
            // Also show toast message
            showMessage(errorMsg, 'error');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalHTML;
            submitBtn.style.opacity = '1';
            return;
        }

        if (response.success) {
            // Remove any error messages
            const existingError = document.getElementById('reservation-modal-error');
            if (existingError) {
                existingError.remove();
            }
            
            closeReservationModal();
            showMessage(response.message || 'Reservation request submitted successfully. Waiting for admin/staff approval.', 'success');
            // Reload locations to update status
            loadLocations(currentSearch);
        }
    } catch (error) {
        console.error('Error submitting reservation:', error);
        let errorMsg = error.message || 'Unknown error';
        
        // Handle specific error messages from backend
        if (errorMsg.includes('already approved')) {
            errorMsg = 'This location has been approved and can no longer be reserved.';
        } else if (errorMsg.includes('already reserved') || errorMsg.includes('Location already reserved')) {
            errorMsg = errorMsg; // Use the detailed message from backend
        } else if (errorMsg.includes('Date conflict') || errorMsg.includes('conflict') || errorMsg.includes('cannot be reserved')) {
            errorMsg = errorMsg; // Use the detailed message from backend
        }
        
        // Show prominent error popup in the modal
        showModalError('Error: ' + errorMsg);
        
        // Also show toast message
        showMessage('Error: ' + errorMsg, 'error');
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalHTML;
        submitBtn.style.opacity = '1';
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
                    <p style="margin: 5px 0; color: #64748b;"><strong>Start:</strong> ${typeof window.formatDisplayDate !== 'undefined' ? window.formatDisplayDate(use.intended_start_date) : (() => {
                        // Parse date explicitly to avoid timezone issues
                        const dateStr = use.intended_start_date.split('T')[0];
                        const parts = dateStr.split('-');
                        const date = parts.length === 3 
                            ? new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)))
                            : new Date(use.intended_start_date);
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const year = String(date.getFullYear()); // Full year
                        return `${month}-${day}-${year}`; // MM-DD-YYYY format
                    })()}${use.intended_start_time ? ' at ' + new Date('2000-01-01T' + use.intended_start_time).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : ''}</p>
                    ${use.intended_end_date ? `<p style="margin: 5px 0; color: #64748b;"><strong>End:</strong> ${typeof window.formatDisplayDate !== 'undefined' ? window.formatDisplayDate(use.intended_end_date) : (() => {
                        // Parse date explicitly to avoid timezone issues
                        const dateStr = use.intended_end_date.split('T')[0];
                        const parts = dateStr.split('-');
                        const date = parts.length === 3 
                            ? new Date(Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10)))
                            : new Date(use.intended_end_date);
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const year = String(date.getFullYear()); // Full year
                        return `${month}-${day}-${year}`; // MM-DD-YYYY format
                    })()}${use.intended_end_time ? ' at ' + new Date('2000-01-01T' + use.intended_end_time).toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'}) : ''}</p>` : ''}
                    <p style="margin: 5px 0; color: #64748b;"><strong>Reserved by:</strong> ${use.user ? use.user.username : 'Unknown'}</p>
                    <p style="margin: 5px 0; color: #64748b; font-size: 12px;"><strong>Submitted:</strong> ${typeof window.formatDisplayDate !== 'undefined' ? window.formatDisplayDate(use.created_at) : (() => {
                        const date = new Date(use.created_at);
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        const year = String(date.getFullYear()).slice(-2);
                        return `${month}-${day}-${year}`;
                    })()}</p>
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

