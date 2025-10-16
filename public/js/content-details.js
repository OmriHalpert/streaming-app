// Get data from body attributes
const userId = document.body.dataset.userId;
const profileId = document.body.dataset.profileId;
const contentId = document.body.dataset.contentId;
const contentType = document.body.dataset.contentType;

// State management
let currentSeason = 1;
let isLiked = false;

console.log("Content Details Page Loaded");
console.log("User ID:", userId);
console.log("Profile ID:", profileId);
console.log("Content ID:", contentId);
console.log("Content Type:", contentType);

// Initialize page
function init() {
  console.log("=== Initializing Content Details Page ===");
  console.log("Content Type:", contentType);
  console.log("Window seasonsData exists:", typeof window.seasonsData);
  console.log("Window seasonsData value:", window.seasonsData);
  
  setupPlayButton();
  setupLikeButton();
  loadUserProfile();
  
  if (contentType === 'show') {
    console.log("Setting up TV show components...");
    setupSeasonDropdown();
    loadEpisodes(currentSeason);
  }
  
  loadRecommendedContent();
  checkIfLiked();
}

// Setup play button click handler
function setupPlayButton() {
  const playButton = document.getElementById('play-button');
  if (!playButton) return;
  
  playButton.addEventListener('click', async () => {
    if (contentType === 'movie') {
      await handleMoviePlay();
    } else {
      // For shows, play first episode of current season
      await handleEpisodePlay(currentSeason, 1);
    }
  });
}

// Handle movie playback
async function handleMoviePlay() {
  const playButton = document.getElementById('play-button');
  playButton.disabled = true;
  playButton.textContent = '▶ Playing...';
  
  try {
    const result = await UserAPI.markContentAsWatched(userId, profileId, contentId);
    
    if (result) {
      console.log('Movie marked as watched:', result);
      showNotification('✓ Added to watch history');
      
      // In a real app, you would start video playback here
      setTimeout(() => {
        playButton.textContent = '▶ Play Again';
        playButton.disabled = false;
      }, 1000);
    } else {
      throw new Error('Failed to mark as watched');
    }
  } catch (error) {
    console.error('Error playing movie:', error);
    showNotification('✗ Error playing content', 'error');
    playButton.textContent = '▶ Play';
    playButton.disabled = false;
  }
}

// Handle episode playback
async function handleEpisodePlay(season, episode) {
  console.log(`Playing S${season}E${episode}`);
  
  try {
    const result = await UserAPI.markContentAsWatched(userId, profileId, contentId, season, episode);
    
    if (result) {
      console.log('Episode marked as watched:', result);
      showNotification(`✓ Watching S${season}E${episode}`);
      
      // Update episode UI to show as watched
      updateEpisodeWatchedStatus(season, episode);
    } else {
      throw new Error('Failed to mark episode as watched');
    }
  } catch (error) {
    console.error('Error playing episode:', error);
    showNotification('✗ Error playing episode', 'error');
  }
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

// Check if content is already liked
async function checkIfLiked() {
  // This would typically come from the server-rendered data
  // For now, we'll assume it's in a data attribute or we fetch it
  const likeStatus = document.body.dataset.isLiked;
  if (likeStatus === 'true') {
    isLiked = true;
    updateLikeButtonUI(true);
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
  console.log('Loading episodes for season:', season);
  console.log('Seasons data:', seasonsData);
  
  const seasonData = seasonsData.find(s => s.seasonNumber === season);
  console.log('Found season data:', seasonData);
  
  if (!seasonData || !seasonData.episodes) {
    episodesList.innerHTML = '<p style="color: white; padding: 20px;">No episodes found for this season</p>';
    return;
  }
  
  console.log('Episodes count:', seasonData.episodes.length);
  
  episodesList.innerHTML = seasonData.episodes.map(episode => `
    <div class="episode-card" data-season="${season}" data-episode="${episode.episodeNumber}">
      <div class="episode-number">Episode ${episode.episodeNumber}</div>
      <div class="episode-info">
        <h3 class="episode-title">${episode.title}</h3>
        <p class="episode-duration">${formatDuration(episode.durationSec)}</p>
      </div>
      <button class="episode-play-btn" onclick="handleEpisodePlay(${season}, ${episode.episodeNumber})">
        ▶ Play
      </button>
    </div>
  `).join('');
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
    console.log('Loading recommendations for genre:', genre);
    
    if (!genre) {
      console.log('No genre found');
      return;
    }
    
    const result = await UserAPI.fetchContentByGenre(genre, userId, profileId, 1, 6);
    console.log('Fetch result:', result);
    
    // Handle both array response and object response
    const contentArray = Array.isArray(result) ? result : (result.content || []);
    
    if (contentArray && contentArray.length > 0) {
      // Filter out current content
      const filtered = contentArray.filter(item => item.id !== parseInt(contentId));
      console.log('Filtered recommendations:', filtered.length);
      
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

