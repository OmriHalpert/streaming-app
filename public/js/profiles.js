// Load profiles from API
async function loadProfiles() {
    const userId = document.body.getAttribute('data-user-id');
    const container = document.getElementById('profiles-container');
    
    try {
        // Show loading message
        container.innerHTML = '<div class="loading">Loading profiles...</div>';
        
        // Fetch profiles using our API
        const profiles = await UserAPI.fetchUserProfiles(userId);
        
        // Clear loading message
        container.innerHTML = '';
        
        // Check if we got profiles
        if (profiles && profiles.length > 0) {
            // Create HTML for each profile
            profiles.forEach(profile => {
                const profileDiv = document.createElement('div');
                profileDiv.className = 'profiles-container';
                profileDiv.setAttribute('data-profile-id', profile.id);
                profileDiv.setAttribute('data-profile-name', profile.name);
                profileDiv.setAttribute('data-profile-avatar', profile.avatar);
                
                profileDiv.innerHTML = `
                    <img src="${profile.avatar}" alt="${profile.name}" class="profile-image" />
                    <input class="name-input" type="text" value="${profile.name}" />
                `;
                
                container.appendChild(profileDiv);
            });
            
            // Set up click handlers for the profiles we just created
            setupProfileClickHandlers();
        } else {
            container.innerHTML = '<p>No profiles found. Please log in again.</p>';
        }
        
    } catch (error) {
        console.error('Error loading profiles:', error);
        container.innerHTML = '<p>Error loading profiles. Please try again.</p>';
    }
}

// Set up click handlers for profiles
function setupProfileClickHandlers() {
    const profileDivs = document.querySelectorAll('.profiles-container');
    const userId = document.body.getAttribute('data-user-id');
    
    profileDivs.forEach(profileDiv => {
        profileDiv.addEventListener('click', (e) => {
            // Get profile data from data attributes
            const selectedProfile = {
                id: profileDiv.getAttribute('data-profile-id'),
                name: profileDiv.getAttribute('data-profile-name'),
                avatar: profileDiv.getAttribute('data-profile-avatar')
            };
            
            localStorage.setItem('selectedProfile', JSON.stringify(selectedProfile));
            window.location.href = `/feed?profileId=${selectedProfile.id}&userId=${userId}`;
        });
    });
}

// Function to initialize the logout button
function initializeLogoutButton() {
    const logoutButton = document.querySelector('#logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            // Clear localStorage
            localStorage.clear();
            
            // Navigate to server logout endpoint
            window.location.href = '/logout';
        });
    }
}

// Initialize everything when the page loads
document.addEventListener('DOMContentLoaded', () => {
    loadProfiles();  // Fetch and display profiles
    initializeLogoutButton();
});
