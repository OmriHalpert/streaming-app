// Script to update content.json to match new schema
const fs = require('fs');
const path = require('path');

// Read current content.json
const contentPath = path.join(__dirname, 'data', 'content.json');
const currentContent = JSON.parse(fs.readFileSync(contentPath, 'utf8'));

// List of known TV shows (the rest will be movies)
const tvShows = [
  'Breaking Bad', 'Stranger Things', 'The Office', 'Game of Thrones', 
  'Friends', 'The Crown', 'Sherlock', 'The Mandalorian', 'Black Mirror',
  'The Witcher', 'House of Cards', 'Wednesday', 'House of the Dragon',
  'The Bear', 'Euphoria', 'The Queen\'s Gambit', 'Squid Game', 'Money Heist',
  'The Last of Us', 'Ozark', 'Better Call Saul', 'Succession', 'Peaky Blinders',
  'The Boys', 'Bridgerton', 'Arcane', 'Ted Lasso', 'Planet Earth'
];

// Cast data for movies and shows (up to 3 actors each)
const castData = {
  'The Dark Knight': [
    { name: 'Christian Bale', wikiUrl: 'https://en.wikipedia.org/wiki/Christian_Bale' },
    { name: 'Heath Ledger', wikiUrl: 'https://en.wikipedia.org/wiki/Heath_Ledger' },
    { name: 'Aaron Eckhart', wikiUrl: 'https://en.wikipedia.org/wiki/Aaron_Eckhart' }
  ],
  'Deadpool': [
    { name: 'Ryan Reynolds', wikiUrl: 'https://en.wikipedia.org/wiki/Ryan_Reynolds' },
    { name: 'Morena Baccarin', wikiUrl: 'https://en.wikipedia.org/wiki/Morena_Baccarin' },
    { name: 'T.J. Miller', wikiUrl: 'https://en.wikipedia.org/wiki/T.J._Miller' }
  ],
  'The Shawshank Redemption': [
    { name: 'Tim Robbins', wikiUrl: 'https://en.wikipedia.org/wiki/Tim_Robbins' },
    { name: 'Morgan Freeman', wikiUrl: 'https://en.wikipedia.org/wiki/Morgan_Freeman' },
    { name: 'Bob Gunton', wikiUrl: 'https://en.wikipedia.org/wiki/Bob_Gunton' }
  ],
  'Inception': [
    { name: 'Leonardo DiCaprio', wikiUrl: 'https://en.wikipedia.org/wiki/Leonardo_DiCaprio' },
    { name: 'Joseph Gordon-Levitt', wikiUrl: 'https://en.wikipedia.org/wiki/Joseph_Gordon-Levitt' },
    { name: 'Ellen Page', wikiUrl: 'https://en.wikipedia.org/wiki/Elliot_Page' }
  ],
  'Interstellar': [
    { name: 'Matthew McConaughey', wikiUrl: 'https://en.wikipedia.org/wiki/Matthew_McConaughey' },
    { name: 'Anne Hathaway', wikiUrl: 'https://en.wikipedia.org/wiki/Anne_Hathaway' },
    { name: 'Jessica Chastain', wikiUrl: 'https://en.wikipedia.org/wiki/Jessica_Chastain' }
  ],
  'Breaking Bad': [
    { name: 'Bryan Cranston', wikiUrl: 'https://en.wikipedia.org/wiki/Bryan_Cranston' },
    { name: 'Aaron Paul', wikiUrl: 'https://en.wikipedia.org/wiki/Aaron_Paul' },
    { name: 'Anna Gunn', wikiUrl: 'https://en.wikipedia.org/wiki/Anna_Gunn' }
  ],
  'Stranger Things': [
    { name: 'Millie Bobby Brown', wikiUrl: 'https://en.wikipedia.org/wiki/Millie_Bobby_Brown' },
    { name: 'Finn Wolfhard', wikiUrl: 'https://en.wikipedia.org/wiki/Finn_Wolfhard' },
    { name: 'Winona Ryder', wikiUrl: 'https://en.wikipedia.org/wiki/Winona_Ryder' }
  ],
  'Game of Thrones': [
    { name: 'Emilia Clarke', wikiUrl: 'https://en.wikipedia.org/wiki/Emilia_Clarke' },
    { name: 'Kit Harington', wikiUrl: 'https://en.wikipedia.org/wiki/Kit_Harington' },
    { name: 'Peter Dinklage', wikiUrl: 'https://en.wikipedia.org/wiki/Peter_Dinklage' }
  ]
};

// Summary data for content
const summaries = {
  'The Dark Knight': 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
  'Deadpool': 'A wisecracking mercenary gets experimented on and becomes immortal but ugly, and sets out to track down the man who ruined his looks.',
  'The Shawshank Redemption': 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
  'Inception': 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
  'Breaking Bad': 'A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family\'s future.',
  'Stranger Things': 'When a young boy disappears, his mother, a police chief and his friends must confront terrifying supernatural forces in order to get him back.',
  'Game of Thrones': 'Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns after being dormant for millennia.',
  'Interstellar': 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.'
};

// Rating data (IMDb-style 0-10)
const ratings = {
  'The Dark Knight': 9.0,
  'The Shawshank Redemption': 9.3,
  'Inception': 8.8,
  'Interstellar': 8.6,
  'Breaking Bad': 9.5,
  'Game of Thrones': 9.2,
  'Stranger Things': 8.7,
  'The Godfather': 9.2,
  'Pulp Fiction': 8.9,
  'The Matrix': 8.7
};

// Transform content
const updatedContent = currentContent.map((item, index) => {
  const isShow = tvShows.includes(item.name);
  const newItem = {
    id: index + 1,
    name: item.name,
    year: item.year,
    type: isShow ? 'show' : 'movie',
    rating: ratings[item.name] || (7.0 + Math.random() * 2), // Default random rating 7-9
    summary: summaries[item.name] || `${item.name} is a ${isShow ? 'television series' : 'film'} from ${item.year}.`,
    genre: item.genre,
    cast: castData[item.name] || [
      { name: 'Actor 1', wikiUrl: '' },
      { name: 'Actor 2', wikiUrl: '' },
      { name: 'Actor 3', wikiUrl: '' }
    ],
    likes: item.likes,
    thumbnail: item.thumbnail
  };

  // Add durationSec for movies (typical 90-180 minutes)
  if (!isShow) {
    newItem.durationSec = 5400 + Math.floor(Math.random() * 5400); // 90-180 minutes in seconds
  }

  // Add seasons for TV shows
  if (isShow) {
    const numSeasons = item.name === 'Game of Thrones' ? 8 : 
                       item.name === 'Breaking Bad' ? 5 :
                       item.name === 'Stranger Things' ? 4 :
                       Math.floor(Math.random() * 5) + 1; // 1-5 seasons
    
    newItem.seasons = [];
    for (let s = 1; s <= numSeasons; s++) {
      const numEpisodes = 8 + Math.floor(Math.random() * 5); // 8-12 episodes
      const episodes = [];
      for (let e = 1; e <= numEpisodes; e++) {
        episodes.push({
          episodeNumber: e,
          title: `Episode ${e}`,
          durationSec: 2400 + Math.floor(Math.random() * 1200) // 40-60 minutes
        });
      }
      newItem.seasons.push({
        seasonNumber: s,
        episodes: episodes
      });
    }
  }

  return newItem;
});

// Write updated content to file
const outputPath = path.join(__dirname, 'data', 'content_updated.json');
fs.writeFileSync(outputPath, JSON.stringify(updatedContent, null, 2));

console.log(`✅ Successfully updated ${updatedContent.length} content items!`);
console.log(`📝 Output written to: ${outputPath}`);
console.log(`\nSummary:`);
console.log(`- Total items: ${updatedContent.length}`);
console.log(`- Movies: ${updatedContent.filter(i => i.type === 'movie').length}`);
console.log(`- TV Shows: ${updatedContent.filter(i => i.type === 'show').length}`);
console.log(`\nFields added to each item:`);
console.log(`- id (numeric)`);
console.log(`- type (movie/show)`);
console.log(`- rating (0-10)`);
console.log(`- summary (description)`);
console.log(`- cast (up to 3 actors with wiki URLs)`);
console.log(`- durationSec (for movies)`);
console.log(`- seasons with episodes (for TV shows)`);
