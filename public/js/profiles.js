// Renders profiles to the DOM
const renderProfiles = () => {
    let loggedUser = null;
    let profilesContainer = null;

    try {
        profilesContainer = document.getElementById('profiles-container');
        if (!profilesContainer) {
            console.error('profiles-container element not found');
            return;
        }

        // Fetch user session for parse
        const userSessionData = localStorage.getItem('userSession');
        
        // Fetch logged user 
        loggedUser = userSessionData ? JSON.parse(userSessionData) : null;
        console.log('Parsed loggedUser:', loggedUser);
        
        profilesContainer.innerHTML = '';

        // Verify a user is logged in
        if (!loggedUser || !loggedUser.isLoggedIn) {
            console.log('user is not logged in, redirecting to login page');
            window.location.href = 'login.html';
            return;
        }
    } catch (error) {
        console.error('Error in renderProfiles:', error);
        window.location.href = 'login.html';
        return;
    }

    // Use profiles from stored user session
    const userProfiles = loggedUser.profiles || [];
    
    userProfiles.forEach((profile, index) => {
        const profileDiv = document.createElement('div');
        profileDiv.className = 'profiles-container';
        
        profileDiv.innerHTML = `
            <img
                src="${profile.avatar}"
                alt="${profile.name}"
                class="profile-image"
            />
            <input
                class="name-input"
                type="text"
                value="${profile.name}"
            />
        `;

        profileDiv.addEventListener('click', (e) => {
            // Store selected profile data
            const selectedProfile = {
                id: profile.id,
                name: profile.name,
                avatar: profile.avatar
            };
            localStorage.setItem('selectedProfile', JSON.stringify(selectedProfile));
            window.location.href = 'feed.html';
        });
        
        profilesContainer.appendChild(profileDiv);
    });
};

// Function to initialize the logout button
function initializeLogoutButton() {
    const logoutButton = document.querySelector('#logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', function() {
            localStorage.clear();
            window.location.href = 'login.html';
        });
    }
}

// Initialize everything when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    renderProfiles();
    initializeLogoutButton();
});
