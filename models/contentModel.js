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

// Update existing content
async function updateContent(contentId, updateData) {
  try {
    const content = await Content.findOne({ id: parseInt(contentId) });
    
    if (!content) {
      throw new Error("Content not found");
    }

    // Update fields if provided
    if (updateData.name !== undefined) content.name = updateData.name;
    if (updateData.description !== undefined) content.description = updateData.description;
    if (updateData.genre !== undefined) content.genre = updateData.genre;
    if (updateData.type !== undefined) content.type = updateData.type;
    if (updateData.releaseYear !== undefined) content.releaseYear = updateData.releaseYear;
    if (updateData.rating !== undefined) content.rating = updateData.rating;
    if (updateData.thumbnailUrl !== undefined) content.thumbnailUrl = updateData.thumbnailUrl;
    if (updateData.videoUrl !== undefined) content.videoUrl = updateData.videoUrl;
    if (updateData.cast !== undefined) content.cast = updateData.cast;
    if (updateData.seasons !== undefined) content.seasons = updateData.seasons;

    await content.save();
    return content;
  } catch (error) {
    throw error;
  }
}

// Delete content
async function deleteContent(contentId) {
  try {
    const content = await Content.findOne({ id: parseInt(contentId) });
    
    if (!content) {
      throw new Error("Content not found");
    }

    await Content.deleteOne({ id: parseInt(contentId) });
    return content;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getContent,
  searchContent,
  addContent,
  updateContent,
  deleteContent
};
