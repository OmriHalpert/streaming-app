// Get app data from the page
const userId = document.body.getAttribute('data-user-id');
const maxProfiles = 5;

// DOM elements
let profileNameInput;
let addProfileBtn;
let addProfileMessage;
let profilesList;
let profileCount;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    profileNameInput = document.getElementById('profileNameInput');
    addProfileBtn = document.getElementById('addProfileBtn');
    addProfileMessage = document.getElementById('addProfileMessage');
    profilesList = document.getElementById('profilesList');
    profileCount = document.getElementById('profileCount');

    // Setup event listeners
    setupEventListeners();
    
    // Update UI state
    updateAddProfileButton();
});

function setupEventListeners() {
    // Enter key in input field
    profileNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addNewProfile();
        }
    });

    // Input validation on typing
    profileNameInput.addEventListener('input', function() {
        clearMessage();
        updateAddProfileButton();
    });
}

function updateAddProfileButton() {
    const currentProfileCount = getCurrentProfileCount();
    const profileName = profileNameInput.value.trim();
    
    // Disable button if max profiles reached or no name entered
    if (currentProfileCount >= maxProfiles || !profileName) {
        addProfileBtn.disabled = true;
    } else {
        addProfileBtn.disabled = false;
    }
}

function getCurrentProfileCount() {
    return profilesList.children.length;
}

async function addNewProfile() {
    const profileName = profileNameInput.value.trim();
    
    // Validate input
    if (!profileName) {
        showMessage('Please enter a profile name', 'error');
        return;
    }

    if (profileName.length > 12) {
        showMessage('Profile name must be 12 characters or less', 'error');
        return;
    }

    if (getCurrentProfileCount() >= maxProfiles) {
        showMessage(`Maximum number of profiles (${maxProfiles}) reached`, 'error');
        return;
    }

    // Disable button and show loading
    addProfileBtn.disabled = true;
    addProfileBtn.textContent = 'Adding...';
    clearMessage();

    try {
        const response = await fetch('/api/profiles/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                profileName: profileName
            })
        });

        const result = await response.json();

        if (result.success) {
            // Add new profile to the list
            addProfileToList(result.data.profile);
            
            // Clear input and show success message
            profileNameInput.value = '';
            showMessage('Profile added successfully!', 'success');
            
            // Update profile count
            updateProfileCount();
            
            // Clear success message after 3 seconds
            setTimeout(() => {
                clearMessage();
            }, 3000);
            
        } else {
            showMessage(result.error || 'Failed to add profile', 'error');
        }

    } catch (error) {
        console.error('Error adding profile:', error);
        showMessage('Network error. Please try again.', 'error');
    } finally {
        // Reset button
        addProfileBtn.disabled = false;
        addProfileBtn.textContent = 'Add Profile';
        updateAddProfileButton();
    }
}

function addProfileToList(profile) {
    const profileItem = document.createElement('li');
    profileItem.className = 'profile-item';
    profileItem.setAttribute('data-profile-id', profile.id);
    
    profileItem.innerHTML = `
        <img src="${profile.avatar}" alt="${profile.name}" class="profile-avatar">
        <span class="profile-name">${profile.name}</span>
    `;
    
    profilesList.appendChild(profileItem);
}

function updateProfileCount() {
    const count = getCurrentProfileCount();
    profileCount.textContent = count;
}

function showMessage(text, type) {
    addProfileMessage.textContent = text;
    addProfileMessage.className = `message ${type}`;
}

function clearMessage() {
    addProfileMessage.textContent = '';
    addProfileMessage.className = 'message';
}

function goBack() {
    // Go back to profiles page with current user
    window.location.href = `/profiles?userId=${userId}`;
}