// Imports
const Content = require("./Content"); // Import the Mongoose Content model

// Main functions
// Get all content from MongoDB
async function getContent() {
  try {
    return await Content.find({});
  } catch (error) {
    throw error;
  }
}

// Search content by name
async function searchContent(query) {
  try {
    if (!query || query.trim() === "") {
      return await getContent();
    }

    const searchTerm = query.toLowerCase().trim();

    // Use MongoDB text search with regex for flexible matching, sorted by popularity
    return await Content.find({
      name: { $regex: searchTerm, $options: "i" },
    }).sort({ likes: -1 }); // Most liked first for search results
  } catch (error) {
    throw error;
  }
}

// Add new content
async function addContent(contentData) {
  try {
    const newContent = new Content(contentData);
    await newContent.save();
    return newContent;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getContent,
  searchContent,
  addContent
};
