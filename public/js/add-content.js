// Global variables
let seasonCount = 0;

// Helper function to generate Wikipedia URL
function generateWikiUrl(actorName) {
  // Replace spaces with underscores and encode special characters
  const formattedName = actorName.trim().replace(/\s+/g, '_');
  return `https://en.wikipedia.org/wiki/${encodeURIComponent(formattedName)}`;
}

// Helper function to get video duration from file
function getVideoDuration(file) {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = function() {
      window.URL.revokeObjectURL(video.src);
      const duration = Math.round(video.duration); // Duration in seconds
      resolve(duration);
    };
    
    video.onerror = function() {
      reject(new Error('Failed to load video metadata'));
    };
    
    video.src = URL.createObjectURL(file);
  });
}

// Helper function to show message
function showMessage(text, type = 'success') {
  const messageBox = document.getElementById('messageBox');
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
  messageBox.style.display = 'block';
  
  setTimeout(() => {
    messageBox.style.display = 'none';
  }, 5000);
}

// Toggle between movie and show sections
document.getElementById('contentType').addEventListener('change', function() {
  const movieSection = document.getElementById('movieSection');
  const showSection = document.getElementById('showSection');
  
  if (this.value === 'movie') {
    movieSection.style.display = 'block';
    showSection.style.display = 'none';
  } else {
    movieSection.style.display = 'none';
    showSection.style.display = 'block';
  }
});

// Add season button
document.getElementById('addSeasonBtn').addEventListener('click', function() {
  seasonCount++;
  const seasonsContainer = document.getElementById('seasonsContainer');
  
  const seasonCard = document.createElement('div');
  seasonCard.className = 'season-card';
  seasonCard.dataset.seasonNumber = seasonCount;
  seasonCard.innerHTML = `
    <div class="season-header">
      <h3 class="season-title">Season ${seasonCount}</h3>
      <button type="button" class="remove-season-btn" onclick="removeSeason(${seasonCount})">Remove Season</button>
    </div>
    <button type="button" class="add-episode-btn" onclick="addEpisode(${seasonCount})">+ Add Episode</button>
    <div class="episodes-container" id="episodes-${seasonCount}"></div>
  `;
  
  seasonsContainer.appendChild(seasonCard);
});

// Remove season
function removeSeason(seasonNumber) {
  const seasonCard = document.querySelector(`.season-card[data-season-number="${seasonNumber}"]`);
  if (seasonCard) {
    seasonCard.remove();
  }
}

// Add episode to season
function addEpisode(seasonNumber) {
  const episodesContainer = document.getElementById(`episodes-${seasonNumber}`);
  const episodeCount = episodesContainer.children.length + 1;
  
  const episodeItem = document.createElement('div');
  episodeItem.className = 'episode-item';
  episodeItem.innerHTML = `
    <div class="episode-header">
      <span class="episode-number">Episode ${episodeCount}</span>
      <button type="button" class="remove-episode-btn" onclick="this.parentElement.parentElement.remove()">×</button>
    </div>
    <div class="episode-fields">
      <input type="text" placeholder="Episode Title" class="episode-title" required />
      <input type="file" accept="video/mp4" class="episode-video" required />
    </div>
  `;
  
  episodesContainer.appendChild(episodeItem);
}

// Back button - logout and redirect to login
document.getElementById('backButton').addEventListener('click', function() {
  window.location.href = '/logout';
});

// Submit form
document.getElementById('submitBtn').addEventListener('click', async function() {
  const submitBtn = this;
  const originalText = submitBtn.textContent;
  
  try {
    // Disable button
    submitBtn.disabled = true;
    submitBtn.textContent = 'Adding Content...';
    
    // Get basic info
    const contentName = document.getElementById('contentName').value.trim();
    const releaseYear = parseInt(document.getElementById('releaseYear').value);
    const genresInput = document.getElementById('genres').value.trim();
    const castInput = document.getElementById('cast').value.trim();
    const director = document.getElementById('director').value.trim();
    const summary = document.getElementById('summary').value.trim();
    const contentType = document.getElementById('contentType').value;
    
    // Validate basic fields
    if (!contentName || !releaseYear || !genresInput || !castInput || !director || !summary) {
      showMessage('Please fill in all required fields', 'error');
      return;
    }
    
    // Parse genres
    const genres = genresInput.split(',').map(g => g.trim()).filter(g => g.length > 0);
    if (genres.length === 0) {
      showMessage('Please enter at least one genre', 'error');
      return;
    }
    
    // Parse cast and generate Wikipedia URLs
    const castNames = castInput.split(',').map(c => c.trim()).filter(c => c.length > 0);
    const cast = castNames.map(name => ({
      name: name,
      wikiUrl: generateWikiUrl(name)
    }));
    
    // Prepare content data
    const contentData = {
      name: contentName,
      year: releaseYear,
      type: contentType,
      genre: genres,
      cast: cast,
      director: director,
      summary: summary
    };
    
    // Handle movie or show specific data
    if (contentType === 'movie') {
      const movieVideo = document.getElementById('movieVideo').files[0];
      
      if (!movieVideo) {
        showMessage('Please upload a video file for the movie', 'error');
        return;
      }
      
      // Extract video duration
      try {
        showMessage('Extracting video duration...', 'success');
        const durationSec = await getVideoDuration(movieVideo);
        contentData.durationSec = durationSec;
        
        console.log('Movie video:', movieVideo);
        console.log('Duration (seconds):', durationSec);
        showMessage(`Movie ready! Duration: ${Math.round(durationSec / 60)} minutes`, 'success');
      } catch (error) {
        showMessage('Failed to extract video duration', 'error');
        console.error('Duration extraction error:', error);
        return;
      }
      
    } else {
      // Collect seasons data
      const seasons = [];
      const seasonCards = document.querySelectorAll('.season-card');
      
      if (seasonCards.length === 0) {
        showMessage('Please add at least one season', 'error');
        return;
      }
      
      // Process seasons sequentially
      for (let seasonIndex = 0; seasonIndex < seasonCards.length; seasonIndex++) {
        const seasonCard = seasonCards[seasonIndex];
        const seasonNumber = seasonIndex + 1;
        const episodes = [];
        const episodeItems = seasonCard.querySelectorAll('.episode-item');
        
        if (episodeItems.length === 0) {
          showMessage(`Please add at least one episode to Season ${seasonNumber}`, 'error');
          throw new Error('Missing episodes');
        }
        
        // Process episodes sequentially to extract durations
        for (let episodeIndex = 0; episodeIndex < episodeItems.length; episodeIndex++) {
          const episodeItem = episodeItems[episodeIndex];
          const episodeNumber = episodeIndex + 1;
          const title = episodeItem.querySelector('.episode-title').value.trim();
          const video = episodeItem.querySelector('.episode-video').files[0];
          
          if (!title) {
            showMessage(`Please enter title for Season ${seasonNumber} Episode ${episodeNumber}`, 'error');
            throw new Error('Missing episode title');
          }
          
          if (!video) {
            showMessage(`Please upload video for Season ${seasonNumber} Episode ${episodeNumber}`, 'error');
            throw new Error('Missing episode video');
          }
          
          // Extract video duration
          try {
            showMessage(`Extracting duration for S${seasonNumber}E${episodeNumber}...`, 'success');
            const durationSec = await getVideoDuration(video);
            
            episodes.push({
              episodeNumber: episodeNumber,
              title: title,
              durationSec: durationSec,
              videoFile: video
            });
          } catch (error) {
            showMessage(`Failed to extract duration for S${seasonNumber}E${episodeNumber}`, 'error');
            throw new Error('Duration extraction failed');
          }
        }
        
        seasons.push({
          seasonNumber: seasonNumber,
          episodes: episodes
        });
      }
      
      contentData.seasons = seasons;
      showMessage('TV Show content prepared (video upload to be implemented)', 'success');
    }
    
    // Log the content data for now
    console.log('Content data to be submitted:', contentData);
    
    // Prepare FormData for file upload
    const formData = new FormData();

    // Add basic fields
    formData.append('name', contentData.name);
    formData.append('year', contentData.year);
    formData.append('type', contentData.type);
    formData.append('genres', contentData.genre.join(','));
    formData.append('cast', JSON.stringify(contentData.cast));
    formData.append('director', contentData.director);
    formData.append('summary', contentData.summary);

    // Add thumbnail if exists
    const thumbnailFile = document.getElementById('thumbnail').files[0];
    if (thumbnailFile) {
    formData.append('thumbnail', thumbnailFile);
    }

    if (contentType === 'movie') {
    // Add movie video
    const movieVideo = document.getElementById('movieVideo').files[0];
    formData.append('movieVideo', movieVideo);
    } else {
    // Add seasons data and episode videos
    formData.append('seasonsData', JSON.stringify(contentData.seasons));

    // Add each episode video
    const seasonCards = document.querySelectorAll('.season-card');
    seasonCards.forEach((seasonCard, seasonIndex) => {
        const seasonNumber = seasonIndex + 1;
        const episodeItems = seasonCard.querySelectorAll('.episode-item');

        episodeItems.forEach((episodeItem, episodeIndex) => {
        const episodeNumber = episodeIndex + 1;
        const video = episodeItem.querySelector('.episode-video').files[0];
        const fieldName = `season${seasonNumber}_episode${episodeNumber}`;
        formData.append(fieldName, video);
        });
    });
    }

    // Send to backend
    showMessage('Uploading content...', 'success');
    const result = await UserAPI.addContent(formData);

    if (result.success) {
    showMessage('Content added successfully!', 'success');
    // Reset form or redirect
    setTimeout(() => {
        window.location.reload();
    }, 2000);
    } else {
    showMessage(result.error || 'Failed to add content', 'error');
    }
    
  } catch (error) {
    console.error('Error adding content:', error);
    if (error.message !== 'Missing episodes' && error.message !== 'Missing episode title' && error.message !== 'Missing episode video') {
      showMessage('Error adding content. Please check the console.', 'error');
    }
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
});

// Make functions globally available
window.removeSeason = removeSeason;
window.addEpisode = addEpisode;
