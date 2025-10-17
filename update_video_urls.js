const fs = require('fs');

// Read the content.json file
const content = JSON.parse(fs.readFileSync('./data/content.json', 'utf8'));

// Process each item
content.forEach(item => {
  if (item.type === 'movie') {
    // Add videoUrl to movies (only if not already present)
    if (!item.videoUrl) {
      item.videoUrl = '/resources/mp4/the_dark_knight_trailer.mp4';
    }
  } else if (item.type === 'show' && item.seasons) {
    // Add videoUrl to all episodes in all seasons
    item.seasons.forEach(season => {
      if (season.episodes) {
        season.episodes.forEach(episode => {
          if (!episode.videoUrl) {
            episode.videoUrl = '/resources/mp4/game_of_thrones_trailer.mp4';
          }
        });
      }
    });
  }
});

// Write back to the file
fs.writeFileSync('./data/content.json', JSON.stringify(content, null, 2), 'utf8');

console.log('✅ Successfully updated all video URLs!');
console.log('- Added videoUrl to all movies: /resources/mp4/the_dark_knight_trailer.mp4');
console.log('- Added videoUrl to all TV show episodes: /resources/mp4/game_of_thrones_trailer.mp4');
