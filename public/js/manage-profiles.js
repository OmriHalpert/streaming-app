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
        <div class="profile-actions">
            <button class="edit-btn" onclick="editProfile(${profile.id}, '${profile.name}')">
                Edit
            </button>
            <button class="delete-btn" onclick="deleteProfile(${profile.id}, '${profile.name}')">
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

// Edit Profile Functions
let currentEditProfileId = null;

function editProfile(profileId, profileName) {
    currentEditProfileId = profileId;
    const editModal = document.getElementById('editModal');
    const editProfileName = document.getElementById('editProfileName');
    const editProfileMessage = document.getElementById('editProfileMessage');
    
    // Set current name in input
    editProfileName.value = profileName;
    
    // Clear any previous messages
    editProfileMessage.textContent = '';
    editProfileMessage.className = 'message';
    
    // Show modal
    editModal.style.display = 'block';
    
    // Focus on input
    setTimeout(() => {
        editProfileName.focus();
        editProfileName.select();
    }, 100);
}

function closeEditModal() {
    const editModal = document.getElementById('editModal');
    editModal.style.display = 'none';
    currentEditProfileId = null;
}

async function saveProfileEdit() {
    const editProfileName = document.getElementById('editProfileName');
    const editProfileMessage = document.getElementById('editProfileMessage');
    const saveBtn = document.querySelector('.save-btn');
    
    const newProfileName = editProfileName.value.trim();
    
    // Validate input
    if (!newProfileName) {
        showEditMessage('Please enter a profile name', 'error');
        return;
    }

    if (newProfileName.length > 12) {
        showEditMessage('Profile name must be 12 characters or less', 'error');
        return;
    }

    // Show loading state
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';
    clearEditMessage();

    try {
        const response = await fetch('/api/profiles/update', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                profileId: currentEditProfileId,
                profileName: newProfileName
            })
        });

        const result = await response.json();

        if (result.success) {
            // Update the profile name in the UI
            updateProfileInList(currentEditProfileId, result.data.profile);
            
            // Close modal
            closeEditModal();
            
            // Show success message briefly
            showMessage('Profile updated successfully!', 'success');
            setTimeout(() => {
                clearMessage();
            }, 3000);
            
        } else {
            showEditMessage(result.error || 'Failed to update profile', 'error');
        }

    } catch (error) {
        console.error('Error updating profile:', error);
        showEditMessage('Network error. Please try again.', 'error');
    } finally {
        // Reset button
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save Changes';
    }
}

function updateProfileInList(profileId, updatedProfile) {
    const profileItem = document.querySelector(`[data-profile-id="${profileId}"]`);
    if (profileItem) {
        const profileNameSpan = profileItem.querySelector('.profile-name');
        if (profileNameSpan) {
            profileNameSpan.textContent = updatedProfile.name;
        }
        
        // Update onclick handlers with new name
        const editBtn = profileItem.querySelector('.edit-btn');
        const deleteBtn = profileItem.querySelector('.delete-btn');
        if (editBtn) {
            editBtn.setAttribute('onclick', `editProfile(${profileId}, '${updatedProfile.name}')`);
        }
        if (deleteBtn) {
            deleteBtn.setAttribute('onclick', `deleteProfile(${profileId}, '${updatedProfile.name}')`);
        }
    }
}

function showEditMessage(text, type) {
    const editProfileMessage = document.getElementById('editProfileMessage');
    editProfileMessage.textContent = text;
    editProfileMessage.className = `message ${type}`;
}

function clearEditMessage() {
    const editProfileMessage = document.getElementById('editProfileMessage');
    editProfileMessage.textContent = '';
    editProfileMessage.className = 'message';
}

// Delete Profile Functions
let currentDeleteProfileId = null;
let currentDeleteProfileName = null;

function deleteProfile(profileId, profileName) {
    currentDeleteProfileId = profileId;
    currentDeleteProfileName = profileName;
    
    const deleteModal = document.getElementById('deleteModal');
    const deleteConfirmText = document.getElementById('deleteConfirmText');
    const deleteProfileMessage = document.getElementById('deleteProfileMessage');
    
    // Set confirmation text
    deleteConfirmText.textContent = `Are you sure you want to delete the profile "${profileName}"? This action cannot be undone.`;
    
    // Clear any previous messages
    deleteProfileMessage.textContent = '';
    deleteProfileMessage.className = 'message';
    
    // Show modal
    deleteModal.style.display = 'block';
}

function closeDeleteModal() {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'none';
    currentDeleteProfileId = null;
    currentDeleteProfileName = null;
}

async function confirmDeleteProfile() {
    const deleteProfileMessage = document.getElementById('deleteProfileMessage');
    const deleteBtn = document.querySelector('.delete-btn-confirm');
    
    // Show loading state
    deleteBtn.disabled = true;
    deleteBtn.textContent = 'Deleting...';
    clearDeleteMessage();

    try {
        const response = await fetch('/api/profiles/delete', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                userId: userId,
                profileId: currentDeleteProfileId
            })
        });

        const result = await response.json();

        if (result.success) {
            // Remove profile from the UI
            removeProfileFromList(currentDeleteProfileId);
            
            // Update profile count
            updateProfileCount();
            
            // Close modal
            closeDeleteModal();
            
            // Show success message
            showMessage('Profile deleted successfully!', 'success');
            setTimeout(() => {
                clearMessage();
            }, 3000);
            
            // Update add button state
            updateAddProfileButton();
            
        } else {
            showDeleteMessage(result.error || 'Failed to delete profile', 'error');
        }

    } catch (error) {
        console.error('Error deleting profile:', error);
        showDeleteMessage('Network error. Please try again.', 'error');
    } finally {
        // Reset button
        deleteBtn.disabled = false;
        deleteBtn.textContent = 'Delete Profile';
    }
}

function removeProfileFromList(profileId) {
    const profileItem = document.querySelector(`[data-profile-id="${profileId}"]`);
    if (profileItem) {
        profileItem.remove();
    }
}

function showDeleteMessage(text, type) {
    const deleteProfileMessage = document.getElementById('deleteProfileMessage');
    deleteProfileMessage.textContent = text;
    deleteProfileMessage.className = `message ${type}`;
}

function clearDeleteMessage() {
    const deleteProfileMessage = document.getElementById('deleteProfileMessage');
    deleteProfileMessage.textContent = '';
    deleteProfileMessage.className = 'message';
}

// Close modals when clicking outside
window.onclick = function(event) {
    const editModal = document.getElementById('editModal');
    const deleteModal = document.getElementById('deleteModal');
    
    if (event.target === editModal) {
        closeEditModal();
    }
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
}

// Handle escape key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeEditModal();
        closeDeleteModal();
    }
});