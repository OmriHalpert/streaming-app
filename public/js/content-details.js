// Get data from body attributes
const userId = document.body.dataset.userId;
const profileId = document.body.dataset.profileId;
const contentId = document.body.dataset.contentId;
const contentType = document.body.dataset.contentType;

// State management
let currentSeason = 1;
let currentEpisode = 1;
let isLiked = false;
let isWatchd = false;
let isCompleted = false;
let userProgress = []; // Store user's progress for this content

// Initialize page
async function init() {
  // Setup header
  setupHamburgerMenu();
  
  // Setup buttons
  setupPlayButton();
  setupLikeButton();
  loadUserProfile();
  setupStartOverButton()
  
  // Load interactions (progress) for marking episodes as watched
  await loadInteractions();
  
  if (contentType === 'show') {
    setupSeasonDropdown();
    loadEpisodes(currentSeason);
  }
  
  loadRecommendedContent();
  checkIfLiked();
  checkIfWatched();
}

// Initialize hamburger menu
function setupHamburgerMenu() {
  const hamburgerBtn = document.querySelector(".hamburger-btn");
  const navMenu = document.querySelector(".nav-menu");

  if (hamburgerBtn && navMenu) {
    hamburgerBtn.addEventListener("click", () => {
      navMenu.classList.toggle("show");
    });

    navMenu.addEventListener("click", (e) => {
      if (e.target.classList.contains("nav-selection")) {
        navMenu.classList.remove("show");
      }
    });
  }
}

// Setup play button click handler
function setupPlayButton() {
  const playButton = document.getElementById('play-button');
  if (!playButton) return;
  
  playButton.addEventListener('click', async () => {
    // If content is completed, clear progress before playing again
    if (isCompleted) {
      await clearProgress();
    }
    
    if (contentType === 'movie') {
      handleMoviePlay();
    } else {
      // For shows, find the latest episode from progress (using updatedAt)
      if (userProgress.length > 0) {
        // Sort by updatedAt descending to get most recent
        const latestProgress = userProgress.sort((a, b) => 
          new Date(b.updatedAt) - new Date(a.updatedAt)
        )[0];
        
        // Continue from latest episode
        handleEpisodePlay(latestProgress.season, latestProgress.episode);
      } else {
        // No progress, start from first episode
        handleEpisodePlay(1, 1);
      }
    }
  });
}

// Setup start over button click handler
function setupStartOverButton() {
    const startOverButton = document.getElementById('start-over-button');
    if (!startOverButton) return;

    startOverButton.addEventListener('click', async () => {
        // Clear progress from database before starting over
        await clearProgress();
        
        if (contentType === 'movie') {
            // Start movie from beginning
            handleMoviePlay();
        } else {
            // Start watching from the first episode
            handleEpisodePlay(1, 1);
        }
    });
}

// Handle movie playback - Navigate to player page
function handleMoviePlay() {
  const url = `/player/${contentId}?userId=${userId}&profileId=${profileId}`;
  window.location.href = url;
}

// Handle episode playback - Navigate to player page
function handleEpisodePlay(season, episode) {
  const url = `/player/${contentId}?userId=${userId}&profileId=${profileId}&season=${season}&episode=${episode}`;
  window.location.href = url;
}

// Setup like button toggle
function setupLikeButton() {
  const likeButton = document.getElementById('like-button');
  if (!likeButton) return;
  
  likeButton.addEventListener('click', async () => {
    likeButton.disabled = true;
    
    try {
      const result = await UserAPI.toggleContentLike(userId, profileId, contentId);
      
      if (result && result.success) {
        isLiked = result.data.isLiked;
        updateLikeButtonUI(isLiked);
        showNotification(isLiked ? '❤️ Liked!' : '💔 Unliked');
        console.log('Like toggled:', result);
      } else {
        throw new Error('Failed to toggle like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      showNotification('✗ Error updating like', 'error');
    } finally {
      likeButton.disabled = false;
    }
  });
}

// Update like button appearance
function updateLikeButtonUI(liked) {
  const likeButton = document.getElementById('like-button');
  if (!likeButton) return;
  
  if (liked) {
    likeButton.classList.add('liked');
    likeButton.innerHTML = '<span class="like-icon">❤️</span> Liked';
  } else {
    likeButton.classList.remove('liked');
    likeButton.innerHTML = '<span class="like-icon">👍</span> Like';
  }
}

// Update play button appearance if watched
function updateWatchButtonUI() {
  const playButton = document.getElementById('play-button');
  playButton.textContent = '▶ Play Again';
}

// Check if content is already liked
async function checkIfLiked() {
  const likeStatus = document.body.dataset.isLiked;
  if (likeStatus === 'true') {
    isLiked = true;
    updateLikeButtonUI(true);
  }
}

// Check if content is already watched
async function checkIfWatched() {
    const watchStatus = document.body.dataset.isWatched;
    const completedStatus = document.body.dataset.isCompleted;

    if (watchStatus === 'true' && completedStatus === 'true') {
        isWatchd = true;
        isCompleted = true;
        updateWatchButtonUI();
    }
}

// Load user's progress for this content
async function loadInteractions() {
  try {
    const result = await window.UserAPI.getProfileInteractions(
      parseInt(userId),
      parseInt(profileId)
    );
    
    if (result.success && result.data) {
      // Filter progress for this specific content
      userProgress = result.data.progress.filter(p => p.contentId === parseInt(contentId));
    }
  } catch (error) {
    console.error('Error loading interactions:', error);
  }
}

// Load user profile avatar
async function loadUserProfile() {
  const avatarContainer = document.getElementById("profile-avatar-container");
  if (!avatarContainer) return;

  try {
    // Show loading spinner
    avatarContainer.innerHTML = '<div class="profile-loading"></div>';

    // Fetch profiles via API
    const profiles = await UserAPI.fetchUserProfiles(userId);
    const currentProfile = profiles.find((p) => p.id === parseInt(profileId));

    if (currentProfile) {
      // Replace loading spinner with actual image
      avatarContainer.innerHTML = `
        <img src="${currentProfile.avatar}" 
             alt="Profile Icon" 
             class="icon"
             onload="this.style.opacity=1"
             style="opacity:0; transition: opacity 0.3s ease;" />
      `;
    } else {
      // Fallback to default image if profile not found
      avatarContainer.innerHTML = `
        <img src="/resources/profile_pics/profile1.jpg" 
             alt="Profile Icon" 
             class="icon"
             onload="this.style.opacity=1"
             style="opacity:0; transition: opacity 0.3s ease;" />
      `;
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
    // Fallback to default image on error
    avatarContainer.innerHTML = `
      <img src="/resources/profile_pics/profile1.jpg" 
           alt="Profile Icon" 
           class="icon"
           onload="this.style.opacity=1"
           style="opacity:0; transition: opacity 0.3s ease;" />
    `;
  }
}

// Setup season dropdown
function setupSeasonDropdown() {
  const dropdown = document.getElementById('season-dropdown');
  if (!dropdown) return;
  
  dropdown.addEventListener('change', (e) => {
    currentSeason = parseInt(e.target.value);
    loadEpisodes(currentSeason);
  });
}

// Load episodes for selected season
function loadEpisodes(season) {
  const episodesList = document.getElementById('episodes-list');
  if (!episodesList) {
    console.log('Episodes list element not found');
    return;
  }
  
  // Episodes data should be passed from server
  const seasonsData = window.seasonsData || [];
  const seasonData = seasonsData.find(s => s.seasonNumber === season);
  
  if (!seasonData || !seasonData.episodes) {
    episodesList.innerHTML = '<p style="color: white; padding: 20px;">No episodes found for this season</p>';
    return;
  }
  
  episodesList.innerHTML = seasonData.episodes.map(episode => {
    // Check if this episode has been watched (has progress entry)
    const hasProgress = userProgress.some(p => 
      p.type === 'show' && 
      p.season === season && 
      p.episode === episode.episodeNumber
    );
    
    // Apply green color if watched
    const titleColor = hasProgress ? 'color: #46d369;' : '';
    
    return `
      <div class="episode-card" data-season="${season}" data-episode="${episode.episodeNumber}">
        <div class="episode-number">Episode ${episode.episodeNumber}</div>
        <div class="episode-info">
          <h3 class="episode-title" style="${titleColor}">${episode.title}</h3>
          <p class="episode-duration">${formatDuration(episode.durationSec)}</p>
        </div>
        <button class="episode-play-btn" onclick="handleEpisodePlay(${season}, ${episode.episodeNumber})">
          ▶ Play
        </button>
      </div>
    `;
  }).join('');
}

// Update episode UI after watching
function updateEpisodeWatchedStatus(season, episode) {
  const episodeCard = document.querySelector(
    `.episode-card[data-season="${season}"][data-episode="${episode}"]`
  );
  
  if (episodeCard) {
    episodeCard.classList.add('watched');
  }
}

// Load recommended content
async function loadRecommendedContent() {
  const recommendedGrid = document.getElementById('recommended-content-grid');
  if (!recommendedGrid) {
    console.log('Recommended grid not found');
    return;
  }
  
  try {
    // Get genre from page
    const genre = document.body.dataset.genre;
    
    if (!genre) {
      console.log('No genre found');
      return;
    }
    
    // Fetch recommendations via API
    const result = await UserAPI.fetchContentByGenre(genre, userId, profileId, 1, 6);
    const contentArray = result.content;
    
    if (contentArray && contentArray.length > 0) {
      // Filter out current content
      const filtered = contentArray.filter(item => item.id !== parseInt(contentId));
      
      if (filtered.length === 0) {
        recommendedGrid.innerHTML = '<p style="color: white; padding: 20px;">No recommendations available</p>';
        return;
      }
      
      recommendedGrid.innerHTML = filtered.slice(0, 6).map(item => {
        const hasThumb = item.thumbnail;
        
        if (hasThumb) {
          return `
            <div class="file file-with-thumbnail" 
                 data-content-id="${item.id}"
                 data-content-name="${item.name}" 
                 data-content-year="${item.year}"
                 data-content-genre="${item.genre ? item.genre.join(", ") : ""}"
                 data-is-liked="${item.isLiked}"
                 style="background-image: url('${item.thumbnail}'); background-size: cover; background-position: center;"
                 onclick="window.location.href='/content/${item.id}?userId=${userId}&profileId=${profileId}'">
                <div class="file-overlay">
                    <div class="file-content">
                        <h3 title="${item.name}">${item.name} (${item.year})</h3>
                        <p>Genre: ${item.genre ? item.genre.join(", ") : "Unknown"}</p>
                    </div>
                </div>
            </div>
          `;
        } else {
          return `
            <div class="file" 
                 data-content-id="${item.id}"
                 data-content-name="${item.name}" 
                 data-content-year="${item.year}"
                 data-content-genre="${item.genre ? item.genre.join(", ") : ""}"
                 data-is-liked="${item.isLiked}"
                 onclick="window.location.href='/content/${item.id}?userId=${userId}&profileId=${profileId}'">
                <div class="file-text-content">
                    <h3 title="${item.name}">${item.name} (${item.year})</h3>
                    <p>Genre: ${item.genre ? item.genre.join(", ") : "Unknown"}</p>
                </div>
            </div>
          `;
        }
      }).join('');
    } else {
      console.log('No content found in result');
      recommendedGrid.innerHTML = '<p style="color: white; padding: 20px;">No recommendations available</p>';
    }
  } catch (error) {
    console.error('Error loading recommended content:', error);
    recommendedGrid.innerHTML = '<p style="color: white; padding: 20px;">Error loading recommendations</p>';
  }
}

// Format duration from seconds to readable format
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// Helper function to clear ALL progress from database (all episodes for shows)
async function clearProgress() {
  try {
    await window.UserAPI.clearProgress(
      parseInt(userId),
      parseInt(profileId),
      parseInt(contentId),
      contentType
    );
    
    // Reset local state after clearing progress
    userProgress = [];
    isCompleted = false;
    isWatchd = false;
  } catch (error) {
    console.error('Error clearing progress:', error);
  }
}

// Show notification toast
function showNotification(message, type = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Animate in
  setTimeout(() => notification.classList.add('show'), 10);
  
  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

// Make handleEpisodePlay globally available for inline onclick handlers
window.handleEpisodePlay = handleEpisodePlay;
