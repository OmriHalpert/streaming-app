// Get app data from the page
const userId = document.body.getAttribute('data-user-id');
const maxProfiles = 5;

// DOM elements
let profileNameInput;
let addProfileBtn;
let addProfileMessage;
let profilesList;
let profileCount;
let backButton;

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    profileNameInput = document.getElementById('profileNameInput');
    addProfileBtn = document.getElementById('addProfileBtn');
    addProfileMessage = document.getElementById('addProfileMessage');
    profilesList = document.getElementById('profilesList');
    profileCount = document.getElementById('profileCount');
    backButton = document.getElementById('backButton');

    // Setup event listeners
    setupEventListeners();
    
    // Update UI state
    updateAddProfileButton();
});

function setupEventListeners() {
    // Back button
    backButton.addEventListener('click', goBack);
    
    // Add profile button
    addProfileBtn.addEventListener('click', addNewProfile);
    
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
    
    // Event delegation for edit and delete buttons (handles dynamically added buttons)
    profilesList.addEventListener('click', function(e) {
        if (e.target.classList.contains('edit-btn')) {
            const profileId = parseInt(e.target.getAttribute('data-profile-id'));
            const profileName = e.target.getAttribute('data-profile-name');
            editProfile(profileId, profileName);
        } else if (e.target.classList.contains('delete-btn')) {
            const profileId = parseInt(e.target.getAttribute('data-profile-id'));
            directDeleteProfile(profileId);
        }
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
        <div class="profile-actions">
            <button class="edit-btn" data-profile-id="${profile.id}" data-profile-name="${profile.name}">
                Edit
            </button>
            <button class="delete-btn" data-profile-id="${profile.id}">
                Delete
            </button>
        </div>
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

// Edit Profile
async function editProfile(profileId, profileName) {
    // Use browser's built-in prompt dialog
    const newName = prompt("Enter new profile name:", profileName);
    
    // If user clicked Cancel or entered empty name, do nothing
    if (!newName || newName.trim() === '') {
        return;
    }
    
    // Validate length
    if (newName.trim().length > 12) {
        alert('Profile name must be 12 characters or less');
        return;
    }
    
    // Make API call to update
    try {
        const response = await fetch('/api/profiles/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                profileId: profileId,
                profileName: newName.trim()
            })
        });

        const result = await response.json();

        if (result.success) {
            // Update the profile name in the UI
            updateProfileInList(profileId, result.data.profile);
            
            // Show success message
            showMessage('Profile updated successfully!', 'success');
            setTimeout(() => {
                clearMessage();
            }, 3000);
            
        } else {
            alert(result.error || 'Failed to update profile');
        }

    } catch (error) {
        console.error('Error updating profile:', error);
        alert('Network error. Please try again.');
    }
}

function updateProfileInList(profileId, updatedProfile) {
    const profileItem = document.querySelector(`[data-profile-id="${profileId}"]`);
    if (profileItem) {
        const profileNameSpan = profileItem.querySelector('.profile-name');
        if (profileNameSpan) {
            profileNameSpan.textContent = updatedProfile.name;
        }
        
        // Update edit button's data attribute with new name
        const editBtn = profileItem.querySelector('.edit-btn');
        if (editBtn) {
            editBtn.setAttribute('data-profile-name', updatedProfile.name);
        }
        
    }
}

// Delete Profile Function
async function directDeleteProfile(profileId) {
    try {
        const response = await fetch('/api/profiles/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                profileId: profileId
            })
        });

        const result = await response.json();

        if (result.success) {
            // Remove profile from the UI
            removeProfileFromList(profileId);
            
            // Update profile count
            updateProfileCount();
            
            // Show success message
            showMessage('Profile deleted successfully!', 'success');
            setTimeout(() => {
                clearMessage();
            }, 3000);
            
            // Update add button state
            updateAddProfileButton();
            
        } else {
            showMessage(result.error || 'Failed to delete profile', 'error');
        }

    } catch (error) {
        console.error('Error deleting profile:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

function removeProfileFromList(profileId) {
    const profileItem = document.querySelector(`[data-profile-id="${profileId}"]`);
    if (profileItem) {
        profileItem.remove();
    }
}