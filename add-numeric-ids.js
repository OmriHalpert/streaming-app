// Migration script to add numeric IDs to content documents
const mongoose = require('mongoose');
require('dotenv').config();

async function addNumericIds() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to database');

    // Use raw collection to bypass schema validation
    const db = mongoose.connection.db;
    const collection = db.collection('content');

    // Get all content sorted by _id to have consistent ordering
    const allContent = await collection.find({}).sort({ _id: 1 }).toArray();
    console.log(`Found ${allContent.length} content documents`);

    // Add numeric ID and type to each document
    let counter = 1;
    const updatePromises = [];
    
    for (const content of allContent) {
      // Determine type based on name (this is a simple heuristic)
      // You can adjust this logic based on your data
      const type = 'movie'; // Default to movie for now
      
      const updatePromise = collection.updateOne(
        { _id: content._id },
        { 
          $set: { 
            id: counter,
            type: type
          } 
        }
      );
      
      updatePromises.push(updatePromise);
      console.log(`Adding ID ${counter} and type '${type}' to: ${content.name}`);
      counter++;
    }

    await Promise.all(updatePromises);

    console.log('\n✅ Successfully added numeric IDs and types to all content!');
    console.log(`Total documents updated: ${allContent.length}`);

    // Verify
    const withId = await collection.countDocuments({ id: { $exists: true, $ne: null } });
    const withType = await collection.countDocuments({ type: { $exists: true, $ne: null } });
    console.log(`\nVerification:`);
    console.log(`- ${withId} documents now have numeric IDs`);
    console.log(`- ${withType} documents now have type field`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

addNumericIds();
