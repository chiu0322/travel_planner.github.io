// Global variables
let map;
let geocoder;
let placesService;
let directionsService;
let directionsRenderer;
let markers = [];
let currentDayId = null;
let selectedDayId = null; // Track which day is currently selected for map display
let travelPlan = {
    title: 'My Travel Plan',
    startDate: '',
    endDate: '',
    days: []
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    loadTravelPlan();
});

// Initialize Google Maps (called by Google Maps API)
function initMap() {
    // Default location (New York City)
    const defaultLocation = { lat: 40.7128, lng: -74.0060 };
    
    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        center: defaultLocation,
        mapTypeControl: true,
        fullscreenControl: true,
        streetViewControl: true,
        styles: [
            {
                featureType: 'water',
                elementType: 'geometry',
                stylers: [{ color: '#e9e9e9' }, { lightness: 17 }]
            },
            {
                featureType: 'landscape',
                elementType: 'geometry',
                stylers: [{ color: '#f5f5f5' }, { lightness: 20 }]
            }
        ]
    });

    // Initialize services
    geocoder = new google.maps.Geocoder();
    placesService = new google.maps.places.PlacesService(map);
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        draggable: true,
        panel: null
    });
    directionsRenderer.setMap(map);

    // Try to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            const userLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };
            map.setCenter(userLocation);
        });
    }

    // Initialize traffic layer
    const trafficLayer = new google.maps.TrafficLayer();
    
    // Map controls
    document.getElementById('centerMapBtn').addEventListener('click', function() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                const userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                map.setCenter(userLocation);
                map.setZoom(15);
            });
        }
    });

    let trafficVisible = false;
    document.getElementById('toggleTrafficBtn').addEventListener('click', function() {
        if (trafficVisible) {
            trafficLayer.setMap(null);
            trafficVisible = false;
            this.style.backgroundColor = 'white';
        } else {
            trafficLayer.setMap(map);
            trafficVisible = true;
            this.style.backgroundColor = '#667eea';
            this.style.color = 'white';
        }
    });

    console.log('Google Maps initialized successfully');
}

// Initialize app event listeners
function initializeApp() {
    // Authentication event listeners
    initializeAuth();
    
    // Header buttons
    document.getElementById('newTripBtn').addEventListener('click', createNewTrip);
    
    // Sidebar buttons
    document.getElementById('addDayBtn').addEventListener('click', addNewDay);
    document.getElementById('exportBtn').addEventListener('click', exportTravelPlan);
    document.getElementById('clearBtn').addEventListener('click', clearAllData);
    
    // Date inputs
    document.getElementById('startDate').addEventListener('change', updateTravelDates);
    document.getElementById('endDate').addEventListener('change', updateTravelDates);
    
    // Location modal events
    const locationModal = document.getElementById('locationModal');
    const locationCloseBtn = locationModal.querySelector('.close');
    const locationCancelBtn = document.getElementById('cancelLocationBtn');
    const locationForm = document.getElementById('locationForm');
    
    locationCloseBtn.addEventListener('click', () => locationModal.style.display = 'none');
    locationCancelBtn.addEventListener('click', () => locationModal.style.display = 'none');
    locationForm.addEventListener('submit', handleLocationSubmit);
    
    // Note modal events
    const noteModal = document.getElementById('noteModal');
    const noteCloseBtn = noteModal.querySelector('.close');
    const noteCancelBtn = document.getElementById('cancelNoteBtn');
    const noteForm = document.getElementById('noteForm');
    
    noteCloseBtn.addEventListener('click', () => noteModal.style.display = 'none');
    noteCancelBtn.addEventListener('click', () => noteModal.style.display = 'none');
    noteForm.addEventListener('submit', handleNoteSubmit);
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target === locationModal) {
            locationModal.style.display = 'none';
        }
        if (event.target === noteModal) {
            noteModal.style.display = 'none';
        }
    });
}

// Create a new trip
function createNewTrip() {
    if (confirm('This will clear your current travel plan. Continue?')) {
        clearAllData();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('startDate').value = today;
        addNewDay();
    }
}

// Add a new day to the travel plan
function addNewDay() {
    const startDate = document.getElementById('startDate').value;
    if (!startDate) {
        alert('Please set a start date first');
        return;
    }
    
    const dayNumber = travelPlan.days.length + 1;
    const dayDate = new Date(startDate);
    dayDate.setDate(dayDate.getDate() + (dayNumber - 1));
    
    const newDay = {
        id: 'day_' + Date.now(),
        number: dayNumber,
        date: dayDate.toISOString().split('T')[0],
        locations: [],
        notes: [] // Initialize notes for new days
    };
    
    travelPlan.days.push(newDay);
    renderDays();
    saveTravelPlan();
}

// Render all days
function renderDays() {
    const daysList = document.getElementById('daysList');
    daysList.innerHTML = '';
    
    travelPlan.days.forEach(day => {
        const dayCard = createDayCard(day);
        daysList.appendChild(dayCard);
    });
    
    updateMapMarkers();
}

// Create a day card element
function createDayCard(day) {
    const isSelected = selectedDayId === day.id;
    const dayCard = document.createElement('div');
    dayCard.className = `day-card ${isSelected ? 'selected' : ''}`;
    dayCard.innerHTML = `
        <div class="day-header">
            <div>
                <div class="day-title">Day ${day.number}</div>
                <div class="day-date">${formatDate(day.date)}</div>
            </div>
            <div class="day-actions">
                <button class="control-btn day-view-btn ${isSelected ? 'active' : ''}" onclick="toggleDayView('${day.id}')" title="${isSelected ? 'Show All Days' : 'View This Day Only'}">
                    <i class="fas ${isSelected ? 'fa-eye-slash' : 'fa-eye'}"></i>
                </button>
                <button class="delete-location" onclick="deleteDay('${day.id}')" title="Delete Day">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="day-controls">
            <div class="add-location-btn" onclick="openLocationModal('${day.id}')">
                <i class="fas fa-map-marker-alt"></i> Add Location
            </div>
            <div class="add-note-btn" onclick="openNoteModal('${day.id}')">
                <i class="fas fa-sticky-note"></i> Add Note
            </div>
        </div>
        <div class="locations-list" id="locations_${day.id}">
            ${day.locations.map(location => createLocationHTML(location, day.id)).join('')}
            ${(day.notes || []).map(note => createNoteHTML(note, day.id)).join('')}
        </div>
    `;
    
    return dayCard;
}

// Create location HTML with click functionality
function createLocationHTML(location, dayId) {
    return `
        <div class="location-item clickable" data-location-id="${location.id}" onclick="focusLocationOnMap('${location.id}', ${location.lat}, ${location.lng})">
            <button class="delete-location" onclick="event.stopPropagation(); deleteLocation('${dayId}', '${location.id}')" title="Delete Location">
                <i class="fas fa-times"></i>
            </button>
            <div class="location-name">${location.name}</div>
            <div class="location-address">${location.address}</div>
            ${location.time ? `<div class="location-time"><i class="fas fa-clock"></i> ${location.time}</div>` : ''}
            ${location.notes ? `<div class="location-notes">${location.notes}</div>` : ''}
        </div>
    `;
}

// Create note HTML
function createNoteHTML(note, dayId) {
    return `
        <div class="note-item" data-note-id="${note.id}">
            <button class="delete-location" onclick="deleteNote('${dayId}', '${note.id}')" title="Delete Note">
                <i class="fas fa-times"></i>
            </button>
            <div class="note-content">${note.content}</div>
            <div class="note-timestamp">${formatTimestamp(note.timestamp)}</div>
        </div>
    `;
}

// Open location modal
function openLocationModal(dayId) {
    currentDayId = dayId;
    document.getElementById('locationModal').style.display = 'block';
    document.getElementById('locationForm').reset();
}

// Handle location form submission
function handleLocationSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('locationName').value;
    const address = document.getElementById('locationAddress').value;
    const time = document.getElementById('locationTime').value;
    const notes = document.getElementById('locationNotes').value;
    
    // Geocode the address
    geocoder.geocode({ address: address }, function(results, status) {
        if (status === 'OK') {
            const location = {
                id: 'loc_' + Date.now(),
                name: name,
                address: address,
                time: time,
                notes: notes,
                lat: results[0].geometry.location.lat(),
                lng: results[0].geometry.location.lng()
            };
            
            addLocationToDay(currentDayId, location);
            document.getElementById('locationModal').style.display = 'none';
        } else {
            alert('Could not find the address. Please try a more specific address.');
        }
    });
}

// Add location to a specific day
function addLocationToDay(dayId, location) {
    const day = travelPlan.days.find(d => d.id === dayId);
    if (day) {
        day.locations.push(location);
        renderDays();
        saveTravelPlan();
    }
}

// Focus on a specific location on the map
function focusLocationOnMap(locationId, lat, lng) {
    const position = { lat: lat, lng: lng };
    map.setCenter(position);
    map.setZoom(16);
    
    // Find and trigger the marker's info window
    const marker = markers.find(m => m.locationId === locationId);
    if (marker && marker.infoWindow) {
        marker.infoWindow.open(map, marker);
    }
}

// Toggle day view (show only selected day or all days)
function toggleDayView(dayId) {
    if (selectedDayId === dayId) {
        selectedDayId = null; // Show all days
    } else {
        selectedDayId = dayId; // Show only this day
    }
    renderDays();
    updateMapMarkers();
}

// Open note modal
function openNoteModal(dayId) {
    currentDayId = dayId;
    document.getElementById('noteModal').style.display = 'block';
    document.getElementById('noteForm').reset();
}

// Handle note form submission
function handleNoteSubmit(e) {
    e.preventDefault();
    
    const content = document.getElementById('noteContent').value;
    
    const note = {
        id: 'note_' + Date.now(),
        content: content,
        timestamp: new Date().toISOString()
    };
    
    addNoteToDay(currentDayId, note);
    document.getElementById('noteModal').style.display = 'none';
}

// Add note to a specific day
function addNoteToDay(dayId, note) {
    const day = travelPlan.days.find(d => d.id === dayId);
    if (day) {
        if (!day.notes) day.notes = [];
        day.notes.push(note);
        renderDays();
        saveTravelPlan();
    }
}

// Delete a note
function deleteNote(dayId, noteId) {
    const day = travelPlan.days.find(d => d.id === dayId);
    if (day && day.notes) {
        day.notes = day.notes.filter(note => note.id !== noteId);
        renderDays();
        saveTravelPlan();
    }
}

// Delete a location
function deleteLocation(dayId, locationId) {
    const day = travelPlan.days.find(d => d.id === dayId);
    if (day) {
        day.locations = day.locations.filter(loc => loc.id !== locationId);
        renderDays();
        saveTravelPlan();
    }
}

// Delete a day
function deleteDay(dayId) {
    if (confirm('Delete this day and all its locations?')) {
        travelPlan.days = travelPlan.days.filter(d => d.id !== dayId);
        // Renumber days
        travelPlan.days.forEach((day, index) => {
            day.number = index + 1;
        });
        renderDays();
        saveTravelPlan();
    }
}

// Update map markers with day filtering
function updateMapMarkers() {
    // Check if Google Maps is loaded
    if (!map || !google || !google.maps) {
        console.log('Google Maps not yet loaded, skipping marker update');
        return;
    }
    
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    
    const bounds = new google.maps.LatLngBounds();
    let hasLocations = false;
    
    // Filter days based on selection
    const daysToShow = selectedDayId ? 
        travelPlan.days.filter(day => day.id === selectedDayId) : 
        travelPlan.days;
    
    // Add markers for each location
    daysToShow.forEach((day, dayIndex) => {
        const originalDayIndex = travelPlan.days.findIndex(d => d.id === day.id);
        day.locations.forEach((location, locationIndex) => {
            const marker = new google.maps.Marker({
                position: { lat: location.lat, lng: location.lng },
                map: map,
                title: location.name,
                label: {
                    text: `${originalDayIndex + 1}`,
                    color: 'white',
                    fontWeight: 'bold'
                },
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 20,
                    fillColor: getColorForDay(originalDayIndex),
                    fillOpacity: 1,
                    strokeColor: 'white',
                    strokeWeight: 2
                }
            });
            
            // Store location ID for reference
            marker.locationId = location.id;
            
            // Info window
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="max-width: 200px;">
                        <h4 style="margin: 0 0 5px 0; color: #333;">${location.name}</h4>
                        <p style="margin: 0 0 5px 0; color: #666; font-size: 0.9em;">${location.address}</p>
                        ${location.time ? `<p style="margin: 0 0 5px 0; color: #667eea; font-size: 0.85em;"><i class="fas fa-clock"></i> ${location.time}</p>` : ''}
                        ${location.notes ? `<p style="margin: 0; color: #666; font-size: 0.85em; font-style: italic;">${location.notes}</p>` : ''}
                    </div>
                `
            });
            
            // Store info window reference
            marker.infoWindow = infoWindow;
            
            marker.addListener('click', function() {
                infoWindow.open(map, marker);
            });
            
            markers.push(marker);
            bounds.extend(marker.getPosition());
            hasLocations = true;
        });
    });
    
    // Fit map to show all markers
    if (hasLocations) {
        map.fitBounds(bounds);
        if (map.getZoom() > 15) {
            map.setZoom(15);
        }
    }
    
    // Draw routes between locations for each day
    drawDailyRoutes();
}

// Get color for day markers
function getColorForDay(dayIndex) {
    const colors = ['#667eea', '#f093fb', '#4facfe', '#43e97b', '#fa709a', '#ff9a9e', '#a8edea', '#ffecd2'];
    return colors[dayIndex % colors.length];
}

// Draw routes between locations for each day (updated for day filtering)
function drawDailyRoutes() {
    const daysToShow = selectedDayId ? 
        travelPlan.days.filter(day => day.id === selectedDayId) : 
        travelPlan.days;
        
    daysToShow.forEach(day => {
        if (day.locations.length > 1) {
            const waypoints = day.locations.slice(1, -1).map(location => ({
                location: { lat: location.lat, lng: location.lng },
                stopover: true
            }));
            
            const start = day.locations[0];
            const end = day.locations[day.locations.length - 1];
            
            directionsService.route({
                origin: { lat: start.lat, lng: start.lng },
                destination: { lat: end.lat, lng: end.lng },
                waypoints: waypoints,
                travelMode: google.maps.TravelMode.DRIVING
            }, function(result, status) {
                if (status === 'OK') {
                    const routeRenderer = new google.maps.DirectionsRenderer({
                        directions: result,
                        suppressMarkers: true,
                        polylineOptions: {
                            strokeColor: getColorForDay(day.number - 1),
                            strokeOpacity: 0.7,
                            strokeWeight: 4
                        }
                    });
                    routeRenderer.setMap(map);
                }
            });
        }
    });
}

// Update travel dates
function updateTravelDates() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    travelPlan.startDate = startDate;
    travelPlan.endDate = endDate;
    
    // Update day dates if start date changed
    if (startDate) {
        travelPlan.days.forEach((day, index) => {
            const dayDate = new Date(startDate);
            dayDate.setDate(dayDate.getDate() + index);
            day.date = dayDate.toISOString().split('T')[0];
        });
        renderDays();
    }
    
    saveTravelPlan();
}

// Export travel plan
function exportTravelPlan() {
    const dataStr = JSON.stringify(travelPlan, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'travel-plan.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Clear all data
function clearAllData() {
    if (confirm('This will delete all your travel plans. Are you sure?')) {
        travelPlan = {
            title: 'My Travel Plan',
            startDate: '',
            endDate: '',
            days: []
        };
        
        document.getElementById('startDate').value = '';
        document.getElementById('endDate').value = '';
        
        renderDays();
        saveTravelPlan();
    }
}

// Save travel plan to localStorage
function saveTravelPlan() {
    localStorage.setItem('travelPlan', JSON.stringify(travelPlan));
}

// Load travel plan from localStorage
function loadTravelPlan() {
    const saved = localStorage.getItem('travelPlan');
    if (saved) {
        try {
            travelPlan = JSON.parse(saved);
            document.getElementById('startDate').value = travelPlan.startDate || '';
            document.getElementById('endDate').value = travelPlan.endDate || '';
            renderDays();
        } catch (e) {
            console.error('Error loading travel plan:', e);
        }
    }
}

// Format date for display
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
    });
}

// Format timestamp for display
function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    });
}

// Error handling for Google Maps
window.gm_authFailure = function() {
    alert('Google Maps API authentication failed. Please check your API key.');
};

// Authentication functionality
function initializeAuth() {
    // Check if user is already logged in
    checkAuthStatus();
    
    // Login button
    document.getElementById('loginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'block';
    });
    
    // Register button
    document.getElementById('registerBtn').addEventListener('click', () => {
        document.getElementById('registerModal').style.display = 'block';
    });
    
    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', () => {
        logout();
    });
    
    // Login form
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // Register form
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // Modal close buttons
    document.querySelectorAll('.modal .close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            e.target.closest('.modal').style.display = 'none';
        });
    });
    
    // Cancel buttons
    document.getElementById('cancelLoginBtn').addEventListener('click', () => {
        document.getElementById('loginModal').style.display = 'none';
    });
    
    document.getElementById('cancelRegisterBtn').addEventListener('click', () => {
        document.getElementById('registerModal').style.display = 'none';
    });
    
    // Switch between login and register
    document.getElementById('switchToRegister').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('registerModal').style.display = 'block';
    });
    
    document.getElementById('switchToLogin').addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('registerModal').style.display = 'none';
        document.getElementById('loginModal').style.display = 'block';
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        const modals = ['loginModal', 'registerModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Check authentication status
function checkAuthStatus() {
    if (window.travelAPI && window.travelAPI.isAuthenticated()) {
        showUserSection();
        loadUserTravelPlans();
    } else {
        showAuthSection();
    }
}

// Show authenticated user section
function showUserSection() {
    document.getElementById('authSection').style.display = 'none';
    document.getElementById('userSection').style.display = 'flex';
    
    // Get user info if available
    const userInfo = localStorage.getItem('currentUser');
    if (userInfo) {
        const user = JSON.parse(userInfo);
        document.getElementById('userName').textContent = user.name || user.email;
    }
}

// Show authentication section
function showAuthSection() {
    document.getElementById('authSection').style.display = 'flex';
    document.getElementById('userSection').style.display = 'none';
}

// Handle login form submission
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await window.travelAPI.login({ email, password });
        
        if (response.success) {
            // Store user info
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            
            // Close modal and update UI
            document.getElementById('loginModal').style.display = 'none';
            showUserSection();
            
            // Sync any local data
            await window.travelAPI.syncLocalData();
            loadUserTravelPlans();
            
            alert('Login successful!');
        }
    } catch (error) {
        console.error('Login error:', error);
        alert('Login failed: ' + error.message);
    }
}

// Handle register form submission
async function handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }
    
    try {
        const response = await window.travelAPI.register({ name, email, password });
        
        if (response.success) {
            // Store user info
            localStorage.setItem('currentUser', JSON.stringify(response.data.user));
            
            // Close modal and update UI
            document.getElementById('registerModal').style.display = 'none';
            showUserSection();
            
            // Sync any local data
            await window.travelAPI.syncLocalData();
            
            alert('Registration successful! Welcome to Travel Planner!');
        }
    } catch (error) {
        console.error('Registration error:', error);
        alert('Registration failed: ' + error.message);
    }
}

// Handle logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        window.travelAPI.logout();
        showAuthSection();
        
        // Clear current travel plan or reload default
        clearAllData();
    }
}

// Load user's travel plans
async function loadUserTravelPlans() {
    if (!window.travelAPI.isAuthenticated()) return;
    
    try {
        const response = await window.travelAPI.getTravelPlans();
        if (response.success && response.data.travelPlans.length > 0) {
            // Load the most recent travel plan
            const latestPlan = response.data.travelPlans[0];
            loadTravelPlanFromServer(latestPlan);
        }
    } catch (error) {
        console.error('Error loading travel plans:', error);
        // Fallback to local storage
        loadTravelPlan();
    }
}

// Load travel plan from server data
function loadTravelPlanFromServer(planData) {
    travelPlan = {
        id: planData._id,
        title: planData.title || 'My Travel Plan',
        startDate: planData.startDate ? planData.startDate.split('T')[0] : '',
        endDate: planData.endDate ? planData.endDate.split('T')[0] : '',
        days: planData.days.map(day => ({
            id: day._id || 'day_' + Date.now(),
            number: day.dayNumber,
            date: day.date.split('T')[0],
            locations: day.locations.map(loc => ({
                id: loc._id || 'loc_' + Date.now(),
                name: loc.name,
                address: loc.address,
                time: loc.time || '',
                notes: loc.notes || '',
                lat: loc.coordinates.lat,
                lng: loc.coordinates.lng
            })),
            notes: day.notes || []
        }))
    };
    
    // Update UI
    document.getElementById('startDate').value = travelPlan.startDate;
    document.getElementById('endDate').value = travelPlan.endDate;
    document.getElementById('tripTitle').textContent = travelPlan.title;
    
    renderDays();
}

// Global functions (needed for onclick handlers)
window.openLocationModal = openLocationModal;
window.deleteLocation = deleteLocation;
window.deleteDay = deleteDay;
window.focusLocationOnMap = focusLocationOnMap;
window.toggleDayView = toggleDayView;
window.openNoteModal = openNoteModal;
window.deleteNote = deleteNote; 