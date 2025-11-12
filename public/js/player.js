// Get elements from DOM
const video = document.getElementById('video-player');
const controlsOverlay = document.getElementById('controls-overlay');
const centerPlayPause = document.getElementById('center-play-pause');
const playPauseBtn = document.getElementById('play-pause-btn');
const rewindBtn = document.getElementById('rewind-btn');
const forwardBtn = document.getElementById('forward-btn');
const fullscreenBtn = document.getElementById('fullscreen-btn');
const progressBar = document.getElementById('progress-bar');
const progressFilled = document.getElementById('progress-filled');
const currentTimeDisplay = document.getElementById('current-time');
const durationDisplay = document.getElementById('duration');
const backButton = document.getElementById('back-button');

// Get data from body attributes
const userId = document.body.dataset.userId;
const profileId = document.body.dataset.profileId;
const contentId = document.body.dataset.contentId;
const contentType = document.body.dataset.contentType;
const season = document.body.dataset.season;
const episode = document.body.dataset.episode;

// State variables
let controlsTimeout;
let isPlaying = false;
let progressSaveInterval;

// Initialize player when page loads
document.addEventListener('DOMContentLoaded', init);

// Initializae page
function init() {
  setupEventListeners();
  setupKeyboardShortcuts();
  setupProgressTracking();
  
  // Resume from saved position
  if (window.startPosition && window.startPosition > 0) {
    video.currentTime = window.startPosition;
  }
  
  // If video metadata already loaded, update duration display immediately
  if (video.readyState >= 1) {
    updateDuration();
  }
}

// Sets up event listeners
function setupEventListeners() {
  // Play/Pause buttons
  centerPlayPause.addEventListener('click', togglePlayPause);
  playPauseBtn.addEventListener('click', togglePlayPause);
  video.addEventListener('click', togglePlayPause);

  // Video events
  video.addEventListener('play', onVideoPlay);
  video.addEventListener('pause', onVideoPause);
  video.addEventListener('timeupdate', updateProgress);
  video.addEventListener('loadedmetadata', updateDuration);
  video.addEventListener('durationchange', updateDuration);
  video.addEventListener('error', onVideoError);

  // Back button
  backButton.addEventListener('click', goBack);

  // Advanced controls
  rewindBtn.addEventListener('click', rewind);
  forwardBtn.addEventListener('click', forward);
  progressBar.addEventListener('click', seek);

  // Fullscreen
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Auto-hide controls
  setupAutoHideControls();

  // TV show specific
  if (contentType === 'show') {
    setupNextEpisodeButton();
    setupEpisodesSidebar();
  }
}

// Toggle play/pause
function togglePlayPause() {
  if (video.paused) {
    // If video is completed (at the end), restart from beginning
    if (video.currentTime >= video.duration - 1) {
      video.currentTime = 0;
    }
    video.play();
  } else {
    video.pause();
  }
}

// Update UI when video plays
function onVideoPlay() {
  isPlaying = true;
  updatePlayPauseIcons(true);
}

// Update UI when video pauses
function onVideoPause() {
  isPlaying = false;
  updatePlayPauseIcons(false);
}

// Handle video errors
function onVideoError() {
  const errorMessages = {
    1: 'Video loading aborted',
    2: 'Network error while loading video',
    3: 'Video decoding failed (corrupt or unsupported format)',
    4: 'Video source not found or unsupported format'
  };
  const errorMsg = errorMessages[video.error?.code] || 'Unknown video error';
  console.error('Video error:', errorMsg);
}

// Update play/pause button icons
function updatePlayPauseIcons(playing) {
  const buttons = [centerPlayPause, playPauseBtn];
  buttons.forEach(btn => {
    const playIcon = btn.querySelector('.play-icon');
    const pauseIcon = btn.querySelector('.pause-icon');
    if (playing) {
      playIcon.style.display = 'none';
      pauseIcon.style.display = 'inline';
    } else {
      playIcon.style.display = 'inline';
      pauseIcon.style.display = 'none';
    }
  });
}

// Rewind 10 seconds
function rewind() {
  video.currentTime = Math.max(0, video.currentTime - 10);

  // Save progress after rewind
  const isCompleted = calculateIsCompleted();
  saveProgress(isCompleted);
}

// Forward 10 seconds
function forward() {
  video.currentTime = Math.min(video.duration, video.currentTime + 10);

  // Save progress after forward
  const isCompleted = calculateIsCompleted();
  saveProgress(isCompleted);
}

// Seek to position on progress bar
function seek(e) {
  if (!video.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  video.currentTime = pos * video.duration;
  
  // Save progress after seeking
  const isCompleted = calculateIsCompleted();
  saveProgress(isCompleted);
}

// Update progress bar as video plays
function updateProgress() {
  if (!video.duration) return;
  const percent = (video.currentTime / video.duration) * 100;
  progressFilled.style.width = percent + '%';
  currentTimeDisplay.textContent = formatTime(video.currentTime);
}

// Update duration display when metadata loads
function updateDuration() {
  if (!durationDisplay) return;
  
  if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
    durationDisplay.textContent = formatTime(video.duration);
  } else {
    durationDisplay.textContent = '--:--';
  }
}

// Format seconds to MM:SS or HH:MM:SS
function formatTime(seconds) {
  if (isNaN(seconds)) return '0:00';
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${padZero(mins)}:${padZero(secs)}`;
  }
  return `${mins}:${padZero(secs)}`;
}

function padZero(num) {
  return num.toString().padStart(2, '0');
}

// Toggle fullscreen (supports old and new browsers)
function toggleFullscreen() {
  const container = document.querySelector('.video-container');
  
  if (!document.fullscreenElement) {
    // Enter fullscreen
    if (container.requestFullscreen) {
      container.requestFullscreen();
    } else if (container.webkitRequestFullscreen) {
      container.webkitRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
      container.mozRequestFullScreen();
    }
  } else {
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    }
  }
}

// Setup next episode button
function setupNextEpisodeButton() {
  const nextEpisodeBtn = document.getElementById('next-episode-btn');
  if (!nextEpisodeBtn || !window.nextEpisode) return;

  nextEpisodeBtn.addEventListener('click', goToNextEpisode);
}

function goToNextEpisode() {
  if (!window.nextEpisode) return;
  
  // Save progress before navigating to next episode
  saveProgressBeforeNavigation();
  
  const [nextSeason, nextEpisode] = window.nextEpisode;
  const url = `/player/${contentId}?userId=${userId}&profileId=${profileId}&season=${nextSeason}&episode=${nextEpisode}`;
  window.location.href = url;
}

// Setup episode sidebar
function setupEpisodesSidebar() {
  const episodesBtn = document.getElementById('episodes-btn');
  const sidebar = document.getElementById('episodes-sidebar');
  const closeSidebarBtn = document.getElementById('close-sidebar');
  const seasonDropdown = document.getElementById('season-dropdown');

  if (!episodesBtn || !sidebar) return;

  // Open sidebar
  episodesBtn.addEventListener('click', () => {
    sidebar.classList.add('open');
  });

  // Close sidebar
  closeSidebarBtn.addEventListener('click', () => {
    sidebar.classList.remove('open');
  });

  // Close sidebar when clicking outside
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') && 
        !sidebar.contains(e.target) && 
        !episodesBtn.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });

  // Season dropdown change
  seasonDropdown.addEventListener('change', (e) => {
    loadEpisodes(parseInt(e.target.value));
  });

  // Load initial episodes
  loadEpisodes(parseInt(season));
}

// Loads episodes
function loadEpisodes(seasonNumber) {
  const episodesList = document.getElementById('episodes-list');
  if (!episodesList || !window.seasonsData) return;

  const seasonData = window.seasonsData.find(s => s.seasonNumber === seasonNumber);
  if (!seasonData) {
    episodesList.innerHTML = '<p style="color: #999;">No episodes found</p>';
    return;
  }

  episodesList.innerHTML = seasonData.episodes.map(ep => {
    const isCurrent = (seasonNumber === parseInt(season) && ep.episodeNumber === parseInt(episode));
    return `
      <div class="episode-item ${isCurrent ? 'current' : ''}" 
           data-season="${seasonNumber}" 
           data-episode="${ep.episodeNumber}"
           onclick="playEpisode(${seasonNumber}, ${ep.episodeNumber})">
        <div class="episode-number">Episode ${ep.episodeNumber}</div>
        <div class="episode-title">${ep.title}</div>
        <div class="episode-duration">${formatTime(ep.durationSec)}</div>
      </div>
    `;
  }).join('');
}

// Global function to play episode (called from HTML onclick)
function playEpisode(seasonNum, episodeNum) {
  // Save progress before navigating to different episode
  saveProgressBeforeNavigation();
  
  const url = `/player/${contentId}?userId=${userId}&profileId=${profileId}&season=${seasonNum}&episode=${episodeNum}`;
  window.location.href = url;
}

// Make playEpisode global so it can be called from HTML onclick
window.playEpisode = playEpisode;


// Auto-Hide Controls
function setupAutoHideControls() {
  // Show controls on mouse move
  document.addEventListener('mousemove', showControls);
  
  // Keep controls visible when hovering over them
  controlsOverlay.addEventListener('mouseenter', () => {
    clearTimeout(controlsTimeout);
  });

  // Hide controls when leaving
  controlsOverlay.addEventListener('mouseleave', () => {
    if (isPlaying) {
      hideControlsAfterDelay();
    }
  });
}

// Shows play/pause controls
function showControls() {
  controlsOverlay.classList.remove('hidden');
  hideControlsAfterDelay();
}

// Hides play/pause controls
function hideControlsAfterDelay() {
  clearTimeout(controlsTimeout);
  if (isPlaying) {
    controlsTimeout = setTimeout(() => {
      controlsOverlay.classList.add('hidden');
    }, 3000);
  }
}

// Keyboard shortcuts
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignore if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch(e.key.toLowerCase()) {
      case ' ':
      case 'k':
        e.preventDefault();
        togglePlayPause();
        break;
      case 'arrowleft':
        e.preventDefault();
        rewind();
        break;
      case 'arrowright':
        e.preventDefault();
        forward();
        break;
      case 'f':
        e.preventDefault();
        toggleFullscreen();
        break;
      case 'escape':
        const sidebar = document.getElementById('episodes-sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebar.classList.remove('open');
        }
        break;
    }
  });
}

// Navigation
function goBack() {
  // Save progress before navigating back
  saveProgressBeforeNavigation();
  
  // Go back to content details page
  window.location.href = `/content/${contentId}?userId=${userId}&profileId=${profileId}`;
}

// Progress tracking
function setupProgressTracking() {
  // Start saving progress when video plays
  video.addEventListener('play', startProgressSaving);
  
  // Stop when video pauses
  video.addEventListener('pause', () => {
    stopProgressSaving();
    saveProgress(false);
  });
  
  // Mark as completed when video ends
  video.addEventListener('ended', () => {
    stopProgressSaving();
    saveProgress(true);
  });
}

// Starts progress saving
function startProgressSaving() {
  // Save progress every 10 seconds
  progressSaveInterval = setInterval(() => {
    // Mark as completed if reached 90% of video
    const isCompleted = calculateIsCompleted();
    saveProgress(isCompleted);
  }, 10000);
}

// Stops progress saving
function stopProgressSaving() {
  if (progressSaveInterval) {
    clearInterval(progressSaveInterval);
  }
}

// Helper function to calculate if video is completed (90% watched)
function calculateIsCompleted() {
  let isCompleted = false;
  if (video.duration && !isNaN(video.duration) && isFinite(video.duration)) {
    const percentWatched = (video.currentTime / video.duration) * 100;
    isCompleted = percentWatched >= 90;
  }
  return isCompleted;
}

// Helper function to save progress before navigation
function saveProgressBeforeNavigation() {
  if (video.currentTime > 0) {
    const isCompleted = calculateIsCompleted();
    saveProgress(isCompleted);
  }
}

// Uses API to save progress
async function saveProgress(isCompleted) {
  await UserAPI.saveProgress(
    parseInt(userId),
    parseInt(profileId),
    parseInt(contentId),
    contentType,
    Math.floor(video.currentTime),
    isCompleted,
    contentType === 'show' ? parseInt(season) : null,
    contentType === 'show' ? parseInt(episode) : null
  );
}

