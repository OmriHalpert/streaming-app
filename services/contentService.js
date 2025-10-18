// Imports
const contentModel = require("../models/contentModel");
const profileInteractionService = require("./profileInteractionService");

// Helper functions
// Get next available content ID
async function getNextContentId() {
  const lastContent = await contentModel.getContent();
  if (!lastContent || lastContent.length === 0) {
    return 1;
  }
  const maxId = Math.max(...lastContent.map(c => c.id));
  return maxId + 1;
}

// Main functions
// Get all content with optional profile-specific like/watched status
async function getAllContent(userId = null, profileId = null) {
  // Fetch content list
  const content = await contentModel.getContent();

  // No content exists
  if (content.length === 0) {
    throw new Error("No content found");
  }

  // If userId and profileId provided, add isLiked and isWatched status
  if (userId && profileId) {
    const interactions = await profileInteractionService.getProfileInteractions(
      userId,
      profileId
    );

    const transformedContent = content.map((item) => ({
      ...item.toObject(), // Convert Mongoose document to plain object
      isLiked: interactions.likes.includes(item.id),
      isWatched: interactions.progress.some((p) => p.contentId === item.id),
    }));

    return transformedContent;
  }

  // Return plain content without interaction status
  const plainContent = content.map((item) => ({
    ...item.toObject(),
    isLiked: false,
    isWatched: false,
  }));

  return plainContent;
}

// Get content by name
async function getContentByName(contentName) {
  // Validate content name
  if (!contentName || contentName.trim() === "") {
    throw new Error("Content name is required");
  }

  // Fetch all content
  const content = await contentModel.getContent();
  const foundContent = content.find((item) => item.name === contentName.trim());

  if (!foundContent) {
    throw new Error("Content not found");
  }

  return foundContent;
}

// Get content by ID
async function getContentById(contentId) {
  // Validate content ID
  if (!contentId || isNaN(contentId) || contentId <=0) {
    throw new Error("Valid content ID is required")
  }

  // Fetch all content
  const content = await contentModel.getContent();
  const foundContent = content.find((item) => item.id === parseInt(contentId));

  if (!foundContent) {
    throw new Error("Content not found");
  }

  return foundContent;
}

// Get content by genre with pagination support
async function getContentByGenre(
  genreName,
  userId = null,
  profileId = null,
  page = 1,
  limit = null
) {
  // Validate genre name
  if (!genreName || genreName.trim() === "") {
    throw new Error("Genre name is required");
  }

  // Get pagination limit from environment variable or use provided limit
  const itemsPerPage = limit || parseInt(process.env.ITEMS_PER_PAGE) || 30;
  const pageNumber = Math.max(1, parseInt(page) || 1);

  // Fetch all content
  const content = await contentModel.getContent();

  // Filter by relevant genre
  const foundContent = content.filter((item) => item.genre.includes(genreName));

  if (!foundContent || foundContent.length === 0) {
    throw new Error("Content not found");
  }

  // Calculate pagination with cycling (repeat content when reaching end)
  const totalItems = foundContent.length;
  const startIndex = ((pageNumber - 1) * itemsPerPage) % totalItems;
  let paginatedContent = [];

  // Handle pagination with cycling
  for (let i = 0; i < itemsPerPage; i++) {
    const index = (startIndex + i) % totalItems;
    paginatedContent.push(foundContent[index]);
  }

  // If userId and profileId provided, add isLiked and isWatched status
  if (userId && profileId) {
    const interactions = await profileInteractionService.getProfileInteractions(
      userId,
      profileId
    );

    const transformedContent = paginatedContent.map((item) => ({
      ...item.toObject(), // Convert Mongoose document to plain object
      isLiked: interactions.likes.includes(item.id),
      isWatched: interactions.progress.some((p) => p.contentId === item.id),
    }));

    return {
      content: transformedContent,
      pagination: {
        page: pageNumber,
        limit: itemsPerPage,
        total: totalItems,
        hasMore: true, // Always true since we cycle content
      },
    };
  }

  // Return plain content without interaction status
  const plainContent = paginatedContent.map((item) => ({
    ...item.toObject(),
    isLiked: false,
    isWatched: false,
  }));

  return {
    content: plainContent,
    pagination: {
      page: pageNumber,
      limit: itemsPerPage,
      total: totalItems,
      hasMore: true, // Always true since we cycle content
    },
  };
}

// Search content
async function searchContent(query, userId = null, profileId = null) {
  // Validate search query
  if (!query || query.trim() === "") {
    // Return all content if no query
    return await getAllContent(userId, profileId);
  }

  // Query length validation
  if (query.trim().length < 2) {
    throw new Error("Search query must be at least 2 characters");
  }

  // Use model search function
  const searchResults = await contentModel.searchContent(query.trim());

  // Add profile-specific like/watched status if userId and profileId provided
  if (userId && profileId) {
    const interactions = await profileInteractionService.getProfileInteractions(
      userId,
      profileId
    );

    return searchResults.map((item) => ({
      ...item.toObject(), // Convert Mongoose document to plain object
      isLiked: interactions.likes.includes(item.id),
      isWatched: interactions.progress.some((p) => p.contentId === item.id),
    }));
  }

  // Convert all results to plain objects without interaction status
  return searchResults.map((item) => ({
    ...item.toObject(),
    isLiked: false,
    isWatched: false,
  }));
}

// Toggle like
async function toggleContentLike(contentId, userId, profileId) {
  // Validate inputs
  if (!contentId || isNaN(contentId) || contentId <= 0) {
    throw new Error("Valid content ID is required");
  }

  if (!userId || isNaN(userId) || userId <= 0) {
    throw new Error("Valid user ID is required");
  }

  if (!profileId || isNaN(profileId) || profileId <= 0) {
    throw new Error("Valid profile ID is required");
  }

  const result = await profileInteractionService.toggleContentLike(
    parseInt(userId),
    parseInt(profileId),
    parseInt(contentId)
  );

  return {
    contentId: parseInt(contentId),
    isLiked: result.isLiked,
    message: result.message,
  };
}

// Get content for feed page (with profile-specific data)
async function getContentForFeed(userId, profileId) {
  try {
    // Validate inputs
    if (!userId || isNaN(userId) || userId <= 0) {
      throw new Error("Valid user ID is required for feed");
    }

    if (!profileId || isNaN(profileId) || profileId <= 0) {
      throw new Error("Valid profile ID is required for feed");
    }

    // Get all content with profile-specific like/watched status
    const content = await getAllContent(parseInt(userId), parseInt(profileId));

    // Group content by genres
    const genreGroups = {};
    content.forEach((item) => {
      item.genre.forEach((genre) => {
        if (!genreGroups[genre]) {
          genreGroups[genre] = [];
        }
        // Avoid duplicates
        if (
          !genreGroups[genre].find((existing) => existing.name === item.name)
        ) {
          genreGroups[genre].push(item);
        }
      });
    });

    return {
      content: content,
      genreGroups: genreGroups,
      totalCount: content.length,
      userId: parseInt(userId),
      profileId: parseInt(profileId),
    };
  } catch (error) {
    // If no content found, return empty data structure instead of throwing
    if (error.message === "No content found") {
      return {
        content: [],
        genreGroups: {},
        totalCount: 0,
        userId: parseInt(userId),
        profileId: parseInt(profileId),
      };
    }
    throw error;
  }
}

// Mark content as watched
async function markAsWatched(contentId, userId, profileId, contentType, contentSeason, contentEpisode) {
  try {
    // Validate inputs
    if (!contentId || isNaN(contentId) || contentId <= 0) {
      throw new Error("Content ID is required");
    }

    if (!userId || isNaN(userId) || userId <= 0) {
      throw new Error("Valid user ID is required");
    }

    if (!profileId || isNaN(profileId) || profileId <= 0) {
      throw new Error("Valid profile ID is required");
    }

    if (!contentType) {
      throw new Error("Content type is required");
    }

    const result = await profileInteractionService.markContentAsWatched(
      parseInt(userId),
      parseInt(profileId),
      parseInt(contentId),
      contentType,
      contentSeason,
      contentEpisode
    );

    return result;
  } catch (error) {
    throw error;
  }
}

async function checkIfCompleted(contentId, userId, profileId) {
  try {
    // Validate inputs
    if (!contentId || isNaN(contentId) || contentId <= 0) {
      throw new Error("Content ID is required");
    }

    if (!userId || isNaN(userId) || userId <= 0) {
      throw new Error("Valid user ID is required");
    }

    if (!profileId || isNaN(profileId) || profileId <= 0) {
      throw new Error("Valid profile ID is required");
    }

    // Fetch content
    const content = await getContentById(contentId);
    const contentType = content.type;

    // Fetch profile interaction and progress
    const interactions = await profileInteractionService.getProfileInteractions(
      parseInt(userId),
      parseInt(profileId)
    );

    if (contentType === "movie") {
      // Find interaction and return true if completed
      const progressItem = interactions.progress.find(
        (p) => p.contentId === content.id
      );

      // If no progress item exists, movie hasn't been watched
      if (!progressItem) {
        return false;
      }

      return progressItem.isCompleted;
    } else if (contentType === "show") {
      // Check if latest episode has been watched (then completed)
      const lastSeasonNumber = content.seasons.length;
      const lastSeason = content.seasons[lastSeasonNumber - 1]; // Array is 0-indexed
      const lastEpisodeNumber = lastSeason.episodes.length;
      
      const lastEpisode = interactions.progress.find((item) => 
        item.contentId === contentId && 
        item.season === lastSeasonNumber &&
        item.episode === lastEpisodeNumber);

      // Didn't watch last episode
      if (!lastEpisode) {
        return false;
      }

      // Check if last episode is marked as completed
      return lastEpisode.isCompleted;
    }

    return false;
    
  } catch (error) {
    throw error;
  }
}

// Add new content
async function addNewContent(contentData) {
  try {
    // Validate required fields
    if (!contentData.name || !contentData.year || !contentData.type || 
        !contentData.genre || !contentData.director || !contentData.rating) {
      throw new Error('Missing required fields');
    }

    // Get next ID
    const nextId = await getNextContentId();

    // Prepare content object
    const newContent = {
      id: nextId,
      name: contentData.name,
      year: contentData.year,
      type: contentData.type,
      genre: contentData.genre,
      cast: contentData.cast || [],
      director: contentData.director,
      summary: contentData.summary || '',
      thumbnail: contentData.thumbnail || null,
      rating: contentData.rating,
      likes: 0
    };

    // Add type-specific fields
    if (contentData.type === 'movie') {
      newContent.durationSec = contentData.durationSec;
      newContent.videoUrl = contentData.videoUrl;
    } else {
      newContent.seasons = contentData.seasons;
    }

    // Save to database
    const savedContent = await contentModel.addContent(newContent);

    return savedContent;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  getAllContent,
  getContentByName,
  getContentById,
  getContentByGenre,
  toggleContentLike,
  getContentForFeed,
  searchContent,
  markAsWatched,
  checkIfCompleted,
  addNewContent,
};
