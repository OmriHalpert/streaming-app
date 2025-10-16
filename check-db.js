const mongoose = require('mongoose');
const Content = require('./models/Content');
const config = require('./config/database');

mongoose.connect(config.mongoUri)
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find a show to check its structure
    const show = await Content.findOne({ type: 'show' });
    
    if (show) {
      console.log('\nSample Show Found:');
      console.log('ID:', show.id);
      console.log('Name:', show.name);
      console.log('Type:', show.type);
      console.log('Has seasons field:', !!show.seasons);
      console.log('Seasons is array:', Array.isArray(show.seasons));
      if (show.seasons) {
        console.log('Number of seasons:', show.seasons.length);
        if (show.seasons.length > 0) {
          console.log('\nFirst Season Structure:');
          console.log(JSON.stringify(show.seasons[0], null, 2));
        }
      }
      console.log('\nHas cast field:', !!show.cast);
      console.log('Cast is array:', Array.isArray(show.cast));
      if (show.cast) {
        console.log('Number of cast members:', show.cast.length);
      }
    } else {
      console.log('No shows found in database');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
