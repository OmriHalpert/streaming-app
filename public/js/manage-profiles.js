// Get app data from the page
const userId = document.body.getAttribute("data-user-id");
const maxProfiles = 5;

// DOM element references - shared across functions
const profileNameInput = document.getElementById("profileNameInput");
const addProfileBtn = document.getElementById("addProfileBtn");
const addProfileMessage = document.getElementById("addProfileMessage");
const profilesList = document.getElementById("profilesList");
const profileCount = document.getElementById("profileCount");
const backButton = document.getElementById("backButton");

// Helper functions
// Returns the current profile count
function getCurrentProfileCount() {
  return profilesList.children.length;
}

// Creates and adds an html profile to the profiles list
function addProfileToList(profile) {
  const profileItem = document.createElement("li");
  profileItem.className = "profile-item";
  profileItem.setAttribute("data-profile-id", profile.id);

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

// Main functions
// Sets up event listerens
function setupEventListeners() {
  // Update UI state
  updateAddProfileButton();

  // Back button
  backButton.addEventListener("click", goBack);

  // Add profile button
  addProfileBtn.addEventListener("click", addNewProfile);

  // Enter key in input field
  profileNameInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      addNewProfile();
    }
  });

  // Input validation on typing
  profileNameInput.addEventListener("input", function () {
    clearMessage();
    updateAddProfileButton(); // Enable button while text is entered
  });

  // Event delegation for edit and delete buttons (handles dynamically added buttons)
  profilesList.addEventListener("click", function (e) {
    if (e.target.classList.contains("edit-btn")) {
      const profileId = parseInt(e.target.getAttribute("data-profile-id"));
      const profileName = e.target.getAttribute("data-profile-name");
      editProfile(profileId, profileName);
    } else if (e.target.classList.contains("delete-btn")) {
      const profileId = parseInt(e.target.getAttribute("data-profile-id"));
      directDeleteProfile(profileId);
    }
  });
}

// Enables 'add profile' button when text is entered in the input textbox
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

// Handles adding a new profile
async function addNewProfile() {
  // Extracted from input textbox
  const profileName = profileNameInput.value.trim();

  // Validate input
  if (!profileName) {
    showMessage("Please enter a profile name", "error");
    return;
  }

  if (profileName.length > 12) {
    showMessage("Profile name must be 12 characters or less", "error");
    return;
  }

  if (getCurrentProfileCount() >= maxProfiles) {
    showMessage(`Maximum number of profiles (${maxProfiles}) reached`, "error");
    return;
  }

  // Disable button and show loading
  addProfileBtn.disabled = true;
  addProfileBtn.textContent = "Adding...";
  clearMessage();

  try {
    // Use API service for adding profile
    const result = await UserAPI.addProfile(userId, profileName);

    if (result.success) {
      // Add new profile to the list
      addProfileToList(result.profile);

      // Clear input and show success message
      profileNameInput.value = "";
      showMessage("Profile added successfully!", "success");

      // Update profile count
      updateProfileCount();

      // Refresh statistics charts
      loadStatistics();

      // Clear success message after 3 seconds
      setTimeout(() => {
        clearMessage();
      }, 3000);
    } else {
      showMessage(result.error || "Failed to add profile", "error");
    }
  } catch (error) {
    console.error("Error adding profile:", error);
    showMessage("Network error. Please try again.", "error");
  } finally {
    // Reset button
    addProfileBtn.disabled = false;
    addProfileBtn.textContent = "Add Profile";
    updateAddProfileButton();
  }
}

// Edit Profile
async function editProfile(profileId, profileName) {
  // Use browser's built-in prompt dialog
  const newName = prompt("Enter new profile name:", profileName);

  // If user clicked Cancel or entered empty name, do nothing
  if (!newName || newName.trim() === "") {
    return;
  }

  // Validate length
  if (newName.trim().length > 12) {
    alert("Profile name must be 12 characters or less");
    return;
  }

  // Make API call to update
  try {
    // Use API service for updating profile
    const result = await UserAPI.updateProfile(
      userId,
      profileId,
      newName.trim()
    );

    if (result.success) {
      // Update the profile name in the UI directly
      updateProfileInList(profileId, { name: newName.trim() });

      // Show success message
      showMessage("Profile updated successfully!", "success");
      setTimeout(() => {
        clearMessage();
      }, 3000);

      // Refresh statistics charts
      loadStatistics();

    } else {
      alert(result.error || "Failed to update profile");
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    alert("Network error. Please try again.");
  }
}

// Delete Profile Function
async function directDeleteProfile(profileId) {
  try {
    // Use API service for deleting profile
    const result = await UserAPI.deleteProfile(userId, profileId);

    if (result.success) {
      // Remove profile from the UI
      removeProfileFromList(profileId);

      // Update profile count
      updateProfileCount();

      // Show success message
      showMessage("Profile deleted successfully!", "success");
      setTimeout(() => {
        clearMessage();
      }, 3000);

      // Update add button state
      updateAddProfileButton();

      // Refresh statistics charts
      loadStatistics();

    } else {
      showMessage(result.error || "Failed to delete profile", "error");
    }
  } catch (error) {
    console.error("Error deleting profile:", error);
    showMessage("Network error. Please try again.", "error");
  }
}

function updateProfileInList(profileId, updatedProfile) {
  const profileItem = document.querySelector(
    `[data-profile-id="${profileId}"]`
  );
  if (profileItem) {
    const profileNameSpan = profileItem.querySelector(".profile-name");
    if (profileNameSpan) {
      profileNameSpan.textContent = updatedProfile.name;
    }

    // Update edit button's data attribute with new name
    const editBtn = profileItem.querySelector(".edit-btn");
    if (editBtn) {
      editBtn.setAttribute("data-profile-name", updatedProfile.name);
    }
  }
}

function removeProfileFromList(profileId) {
  const profileItem = document.querySelector(
    `[data-profile-id="${profileId}"]`
  );
  if (profileItem) {
    profileItem.remove();
  }
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
  addProfileMessage.textContent = "";
  addProfileMessage.className = "message";
}

function goBack() {
  // Go back to profiles page with current user
  window.location.href = `/profiles?userId=${userId}`;
}

// Statistics functions
// Chart instances to track for cleanup
let dailyViewsChartInstance = null;
let genrePopularityChartInstance = null;

// Initialize daily views chart
async function initDailyViewsChart() {
  const canvas = document.getElementById('dailyViewsChart');
  const loading = document.getElementById('dailyViewsLoading');
  const errorDiv = document.getElementById('dailyViewsError');
  
  try {
    // Destroy existing chart if it exists
    if (dailyViewsChartInstance) {
      dailyViewsChartInstance.destroy();
      dailyViewsChartInstance = null;
    }

    // Reset display states
    loading.style.display = 'flex';
    canvas.style.display = 'none';
    errorDiv.style.display = 'none';

    // Fetch data from API
    const result = await UserAPI.getDailyViewsStats(userId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load statistics');
    }
    
    const chartData = result.data;
    
    // Hide loading, show canvas
    loading.style.display = 'none';
    canvas.style.display = 'block';
    
    // Check if there's any data
    const hasData = chartData.data && chartData.data.some(val => val > 0);
    
    if (!hasData) {
      // Show empty state message
      canvas.style.display = 'none';
      errorDiv.style.display = 'block';
      errorDiv.className = 'chart-empty';
      errorDiv.textContent = 'No views today yet. Start watching to see statistics!';
      return;
    }
    
    
    // Create the chart
    dailyViewsChartInstance = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: chartData.labels,
        datasets: [{
          label: "Today's Views",
          data: chartData.data,
          backgroundColor: 'rgba(229, 9, 20, 0.7)',
          borderColor: 'rgba(229, 9, 20, 0.7)',
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#e50914',
            borderWidth: 1,
            padding: 12,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return `Views: ${context.parsed.y}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)',
              stepSize: 1,
              precision: 0
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Number of Views',
              color: 'rgba(255, 255, 255, 0.8)',
              font: {
                size: 14
              }
            }
          },
          x: {
            ticks: {
              color: 'rgba(255, 255, 255, 0.7)'
            },
            grid: {
              display: false,
              drawBorder: false
            },
            title: {
              display: true,
              text: 'Profiles',
              color: 'rgba(255, 255, 255, 0.8)',
              font: {
                size: 14
              }
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error initializing daily views chart:', error);
    loading.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = `Failed to load statistics: ${error.message}`;
  }
}

// Initialize genre popularity pie chart
async function initGenrePopularityChart() {
  const canvas = document.getElementById('genrePopularityChart');
  const loading = document.getElementById('genrePopularityLoading');
  const errorDiv = document.getElementById('genrePopularityError');
  
  try {
    // Destroy existing chart if it exists
    if (genrePopularityChartInstance) {
      genrePopularityChartInstance.destroy();
      genrePopularityChartInstance = null;
    }

    // Reset display states
    loading.style.display = 'flex';
    canvas.style.display = 'none';
    errorDiv.style.display = 'none';

    // Fetch data from API
    const result = await UserAPI.getGenrePopularityStats(userId);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to load genre statistics');
    }
    
    const chartData = result.data;
    
    // Hide loading, show canvas
    loading.style.display = 'none';
    canvas.style.display = 'block';
    
    // Check if there's any data
    const hasData = chartData.data && chartData.data.length > 0;
    
    if (!hasData) {
      // Show empty state message
      canvas.style.display = 'none';
      errorDiv.style.display = 'block';
      errorDiv.className = 'chart-empty';
      errorDiv.textContent = 'No watch history yet. Start watching to see genre popularity!';
      return;
    }
    
    // Generate colors for each genre
    const colors = generatePieColors(chartData.labels.length);
    
    // Create the pie chart
    genrePopularityChartInstance = new Chart(canvas, {
      type: 'pie',
      data: {
        labels: chartData.labels,
        datasets: [{
          data: chartData.data,
          backgroundColor: colors,
          borderColor: '#1a1a1a',
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'rgba(255, 255, 255, 0.8)',
              padding: 15,
              font: {
                size: 12
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            titleColor: '#fff',
            bodyColor: '#fff',
            borderColor: '#e50914',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
    
  } catch (error) {
    console.error('Error initializing genre popularity chart:', error);
    loading.style.display = 'none';
    errorDiv.style.display = 'block';
    errorDiv.textContent = `Failed to load genre statistics: ${error.message}`;
  }
}

// Generate colors for pie chart
function generatePieColors(count) {
  const colors = [
    'rgba(229, 9, 20, 0.8)',    // Netflix red
    'rgba(14, 165, 233, 0.8)',  // Blue
    'rgba(34, 197, 94, 0.8)',   // Green
    'rgba(251, 146, 60, 0.8)',  // Orange
    'rgba(168, 85, 247, 0.8)',  // Purple
    'rgba(236, 72, 153, 0.8)',  // Pink
    'rgba(250, 204, 21, 0.8)',  // Yellow
    'rgba(20, 184, 166, 0.8)',  // Teal
    'rgba(239, 68, 68, 0.8)',   // Red
    'rgba(59, 130, 246, 0.8)',  // Light Blue
  ];
  
  const result = [];
  for (let i = 0; i < count; i++) {
    result.push(colors[i % colors.length]);
  }
  return result;
}

// Load all statistics
function loadStatistics() {
  initDailyViewsChart();
  initGenrePopularityChart();
}

// Initialize page when DOM is loaded
document.addEventListener("DOMContentLoaded", function () {
  // Setup event listeners
  setupEventListeners();
  
  // Load statistics
  loadStatistics();
});
