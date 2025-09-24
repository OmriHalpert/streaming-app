// Set up click handlers for server-rendered profiles
function setupProfileClickHandlers() {
    const profileDivs = document.querySelectorAll('.profiles-container');
    
    profileDivs.forEach(profileDiv => {
        profileDiv.addEventListener('click', (e) => {
            // Get profile data from data attributes
            const selectedProfile = {
                id: profileDiv.getAttribute('data-profile-id'),
                name: profileDiv.getAttribute('data-profile-name'),
                avatar: profileDiv.getAttribute('data-profile-avatar')
            };
            
            localStorage.setItem('selectedProfile', JSON.stringify(selectedProfile));
            window.location.href = '/html/feed.html';
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

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setupProfileClickHandlers();
    initializeLogoutButton();
});
