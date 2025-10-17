// Player.js - Video Player Controls

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
let isSeeking = false;

console.log('Player loaded for content:', contentId, 'Type:', contentType);

// Initialize player when page loads
document.addEventListener('DOMContentLoaded', init);

function init() {
  setupEventListeners();
  setupKeyboardShortcuts();
  if (contentType === 'show') {
    setupEpisodesUI();
  }
}

// ===== Phase 3: Basic Playback Controls =====

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

  // Back button
  backButton.addEventListener('click', goBack);

  // Phase 4: Advanced controls
  rewindBtn.addEventListener('click', rewind);
  forwardBtn.addEventListener('click', forward);
  progressBar.addEventListener('click', seek);

  // Phase 5: Fullscreen
  fullscreenBtn.addEventListener('click', toggleFullscreen);

  // Phase 8: Auto-hide controls
  setupAutoHideControls();

  // Phase 6 & 7: TV show specific
  if (contentType === 'show') {
    setupNextEpisodeButton();
    setupEpisodesSidebar();
  }
}

// Toggle play/pause
function togglePlayPause() {
  if (video.paused) {
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

// ===== Phase 4: Advanced Controls =====

// Rewind 10 seconds
function rewind() {
  video.currentTime = Math.max(0, video.currentTime - 10);
}

// Forward 10 seconds
function forward() {
  video.currentTime = Math.min(video.duration, video.currentTime + 10);
}

// Seek to position on progress bar
function seek(e) {
  if (!video.duration) return;
  const rect = progressBar.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  video.currentTime = pos * video.duration;
}

// Update progress bar as video plays
function updateProgress() {
  if (!video.duration || isSeeking) return;
  const percent = (video.currentTime / video.duration) * 100;
  progressFilled.style.width = percent + '%';
  currentTimeDisplay.textContent = formatTime(video.currentTime);
}

// Update duration display when metadata loads
function updateDuration() {
  durationDisplay.textContent = formatTime(video.duration);
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

// ===== Phase 5: Fullscreen =====

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

// ===== Phase 6: Next Episode Button =====

function setupNextEpisodeButton() {
  const nextEpisodeBtn = document.getElementById('next-episode-btn');
  if (!nextEpisodeBtn || !window.nextEpisode) return;

  nextEpisodeBtn.addEventListener('click', goToNextEpisode);
}

function goToNextEpisode() {
  if (!window.nextEpisode) return;
  
  const [nextSeason, nextEpisode] = window.nextEpisode;
  const url = `/player/${contentId}?userId=${userId}&profileId=${profileId}&season=${nextSeason}&episode=${nextEpisode}`;
  window.location.href = url;
}

// ===== Phase 7: Episodes Sidebar =====

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

function setupEpisodesUI() {
  if (!window.seasonsData) return;
  // Will be loaded dynamically when sidebar opens
}

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
  const url = `/player/${contentId}?userId=${userId}&profileId=${profileId}&season=${seasonNum}&episode=${episodeNum}`;
  window.location.href = url;
}

// ===== Phase 8: Auto-Hide Controls =====

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

function showControls() {
  controlsOverlay.classList.remove('hidden');
  hideControlsAfterDelay();
}

function hideControlsAfterDelay() {
  clearTimeout(controlsTimeout);
  if (isPlaying) {
    controlsTimeout = setTimeout(() => {
      controlsOverlay.classList.add('hidden');
    }, 3000);
  }
}

// ===== Keyboard Shortcuts =====

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

// ===== Navigation =====

function goBack() {
  // Go back to content details page
  window.location.href = `/content/${contentId}?userId=${userId}&profileId=${profileId}`;
}

// Make playEpisode global so it can be called from HTML onclick
window.playEpisode = playEpisode;
