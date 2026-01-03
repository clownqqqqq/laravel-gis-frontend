// Dashboard JavaScript
let currentLocations = [];
let currentSearch = '';

// Check authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    if (!isAuthenticated()) {
        window.location.href = 'login.html';
        return;
    }
    
    // Load user info
    loadUserInfo();
    
    // Load locations
    loadLocations();
    
    // Search on Enter key
    document.getElementById('search-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchLocations();
        }
    });
});

// Load user information
function loadUserInfo() {
    const userData = getUserData();
    if (userData) {
        document.getElementById('user-name').textContent = userData.name || userData.email;
    }
}

// Load all locations from API
async function loadLocations(searchTerm = '') {
    const loadingDiv = document.getElementById('loading');
    const container = document.getElementById('locations-container');
    const emptyState = document.getElementById('empty-state');
    
    loadingDiv.style.display = 'block';
    container.innerHTML = '';
    emptyState.style.display = 'none';
    
    try {
        let url = API_ENDPOINTS.GIS_INDEX;
        if (searchTerm) {
            url += `?search=${encodeURIComponent(searchTerm)}`;
        }
        
        const data = await apiRequest(url);
        currentLocations = data.locations || data.data || [];
        
        loadingDiv.style.display = 'none';
        
        if (currentLocations.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        renderLocations(currentLocations);
        
    } catch (error) {
        loadingDiv.style.display = 'none';
        showMessage('Error loading locations: ' + error.message, 'error');
        console.error('Error:', error);
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
        
        const statusBadge = getStatusBadge(location.status);
        
        return `
            <div class="location-card">
                ${imageUrl ? `<img src="${imageUrl}" alt="${location.location}" class="location-image" onerror="this.style.display='none'">` : ''}
                <h3 class="location-name">
                    ${location.location}
                    ${statusBadge}
                </h3>
                <p class="location-coords">
                    📍 Lat: ${location.latitude} | Lng: ${location.longitude}
                </p>
                ${location.category ? `<span class="location-category">${location.category}</span>` : ''}
                ${location.notes ? `<p class="location-notes">${location.notes.substring(0, 100)}${location.notes.length > 100 ? '...' : ''}</p>` : ''}
                <div class="location-actions">
                    ${(userRole === 'admin' || userRole === 'staff' || (location.user_id === userData?.id)) 
                        ? `<button onclick="editLocation(${location.id})" class="btn btn-small btn-edit">✏️ Edit</button>
                           <button onclick="deleteLocation(${location.id})" class="btn btn-small btn-delete">🗑️ Delete</button>`
                        : ''
                    }
                    <button onclick="viewLocation(${location.id})" class="btn btn-small btn-view">👁️ View</button>
                </div>
            </div>
        `;
    }).join('');
}

// Get status badge HTML
function getStatusBadge(status) {
    if (!status || status === 'approved') return '';
    
    const badges = {
        'pending': '<span class="status-badge status-pending">⏳ Pending</span>',
        'rejected': '<span class="status-badge status-rejected">✗ Rejected</span>'
    };
    
    return badges[status] || '';
}

// Search locations
function searchLocations() {
    const searchTerm = document.getElementById('search-input').value.trim();
    currentSearch = searchTerm;
    loadLocations(searchTerm);
}

// Clear search
function clearSearch() {
    document.getElementById('search-input').value = '';
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
    if (!confirm('Are you sure you want to delete this location?')) {
        return;
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

