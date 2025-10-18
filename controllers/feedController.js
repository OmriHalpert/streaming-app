// Imports
const {
  getContentForFeed,
  toggleContentLike: toggleLike,
  searchContent: searchContentService,
  markAsWatched,
  getContentByGenre,
  getContentById,
  addNewContent,
} = require("../services/contentService");
const {
  getRecommendations: getRecommendationsService,
} = require("../services/recommendationService");
const Content = require("../models/Content");
const { getVideoDuration } = require('../utils/videoProcessor');
const path = require('path');

// Main functions
// Renders feed page with content
async function renderFeedPage(req, res) {
  try {
    // Get profileId and userId from query parameters
    const profileId = req.query.profileId;
    const userId = req.query.userId;

    if (!profileId || !userId) {
      return res.status(400).render("error", {
        message: "Profile ID and user ID are required to access feed",
      });
    }

    // Renders feed page
    res.render("feed", {
      profileId,
      userId,
    });
  } catch (error) {
    console.error("Error rendering feed page:", error);
    res.status(500).render("error", {
      message: "Unable to load feed. Please try again.",
    });
  }
}

// Add new content
async function addContent(req, res) {
  try {
    // Extract form data
    const {
      name,
      year,
      type,
      genres,
      cast,
      director,
      summary
    } = req.body;

    // Parse genres (comma-separated string to array)
    const genreArray = genres.split(',').map(g => g.trim());

    // Parse cast (JSON string to array)
    const castArray = JSON.parse(cast);

    // Prepare content data
    const contentData = {
      name,
      year: parseInt(year),
      type,
      genre: genreArray,
      cast: castArray,
      director,
      summary
    };

    // Handle thumbnail
    if (req.files && req.files.thumbnail) {
      const thumbnailFile = req.files.thumbnail[0];
      contentData.thumbnail = `/resources/thumbnails/${thumbnailFile.filename}`;
    }

    // Handle movie or show
    if (type === 'movie') {
      // Movie: single video
      if (!req.files || !req.files.movieVideo) {
        return res.status(400).json({
          success: false,
          error: 'Movie video is required'
        });
      }

      const videoFile = req.files.movieVideo[0];
      const videoPath = path.join(__dirname, '../public/resources/mp4', videoFile.filename);

      // Extract duration from video
      const duration = await getVideoDuration(videoPath);

      contentData.durationSec = duration;
      contentData.videoUrl = `/resources/mp4/${videoFile.filename}`;

    } else {
      // TV Show: parse seasons
      const seasonsData = JSON.parse(req.body.seasonsData);
      const seasons = [];

      for (const season of seasonsData) {
        const episodes = [];

        for (const episode of season.episodes) {
          // Find corresponding video file
          const videoFieldName = `season${season.seasonNumber}_episode${episode.episodeNumber}`;
          const videoFile = req.files[videoFieldName] ? req.files[videoFieldName][0] : null;

          if (!videoFile) {
            return res.status(400).json({
              success: false,
              error: `Video missing for Season ${season.seasonNumber} Episode ${episode.episodeNumber}`
            });
          }

          const videoPath = path.join(__dirname, '../public/resources/mp4', videoFile.filename);
          const duration = await getVideoDuration(videoPath);

          episodes.push({
            episodeNumber: episode.episodeNumber,
            title: episode.title,
            durationSec: duration,
            videoUrl: `/resources/mp4/${videoFile.filename}`
          });
        }

        seasons.push({
          seasonNumber: season.seasonNumber,
          episodes
        });
      }

      contentData.seasons = seasons;
    }

    // Save content
    const newContent = await addNewContent(contentData);

    return res.status(201).json({
      success: true,
      message: 'Content added successfully',
      data: newContent
    });

  } catch (error) {
    console.error('Error adding content:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to add content'
    });
  }
}

// Get content data for API
async function getContent(req, res) {
  try {
    const { userId, profileId } = req.query;

    // Validate required parameters
    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "User ID and Profile ID are required",
      });
    }

    // Get content for feed with profile-specific data
    const feedData = await getContentForFeed(userId, profileId);

    res.json({
      success: true,
      data: feedData,
    });
  } catch (error) {
    console.error("Error fetching content:", error);

    res.status(500).json({
      success: false,
      error: "Unable to fetch content. Please try again.",
    });
  }
}

// Toggle content like
async function toggleContentLike(req, res) {
  try {
    const { contentId, userId, profileId } = req.body;

    if (!contentId || !userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "Content ID, user ID, and profile ID are required",
      });
    }

    // Toggle like via content services
    const result = await toggleLike(contentId, userId, profileId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error toggling like:", error);

    res.status(500).json({
      success: false,
      error: "Unable to toggle like. Please try again.",
    });
  }
}

// Search content
async function searchContent(req, res) {
  try {
    const { q: query, userId, profileId } = req.query;

    // Convert to integers if provided
    const userIdInt = userId ? parseInt(userId) : null;
    const profileIdInt = profileId ? parseInt(profileId) : null;

    // Search via content services
    const results = await searchContentService(query, userIdInt, profileIdInt);

    res.json({
      success: true,
      data: results,
    });
  } catch (error) {
    console.error("Error searching content:", error);

    res.status(500).json({
      success: false,
      error: "Unable to search content. Please try again.",
    });
  }
}

// Mark content as watched
async function watchContent(req, res) {
  try {
    const { contentId } = req.params;
    const { userId, profileId, season, episode } = req.body;

    // Optional season and episode (if its a show)
    const seasonNum = season ? parseInt(season) : null;
    const episodeNum = episode ? parseInt(episode) : null;

    if (!contentId || !userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "Content ID, user ID, and profile ID are required",
      });
    }

    // Fetch content to get its type
    const content = await Content.findOne({ id: parseInt(contentId) });
    if (!content) {
      return res.status(404).json({
        success: false,
        error: "Content not found",
      });
    }

    // Marks content as watched via content services
    const result = await markAsWatched(
      parseInt(contentId),
      parseInt(userId),
      parseInt(profileId),
      content.type,
      seasonNum,
      episodeNum
    );

    res.json({
      success: true,
      message: result.message,
      alreadyWatched: result.alreadyWatched,
    });
  } catch (error) {
    console.error("Error marking content as watched:", error);

    res.status(500).json({
      success: false,
      error: "Unable to mark content as watched. Please try again.",
    });
  }
}

// Get recommendations
async function getRecommendations(req, res) {
  try {
    const { userId, profileId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    if (!userId || !profileId) {
      return res.status(400).json({
        success: false,
        error: "User ID and Profile ID are required",
      });
    }

    // Fetches recommendations via recommendations services
    const recommendations = await getRecommendationsService(
      parseInt(userId),
      parseInt(profileId),
      limit
    );

    res.json({
      success: true,
      data: recommendations,
    });
  } catch (error) {
    console.error("Error fetching recommendations:", error);

    res.status(500).json({
      success: false,
      error: "Unable to fetch recommendations right now.",
    });
  }
}

// Get content by genre name
async function getGenreContent(req, res) {
  try {
    const { genreName } = req.params;
    const { userId, profileId, page, limit } = req.query;

    if (!genreName) {
      return res.status(400).json({
        success: false,
        error: "Genre name is required",
      });
    }

    // Convert to integers if provided
    const userIdInt = userId ? parseInt(userId) : null;
    const profileIdInt = profileId ? parseInt(profileId) : null;
    const pageInt = page ? parseInt(page) : 1;
    const limitInt = limit ? parseInt(limit) : null;

    // Fetches content by genre name via content services
    const genreData = await getContentByGenre(
      genreName,
      userIdInt,
      profileIdInt,
      pageInt,
      limitInt
    );

    res.json({
      success: true,
      data: genreData.content,
      pagination: genreData.pagination,
    });
  } catch (error) {
    console.error("Error fetching content by genre", error);

    res.status(500).json({
      success: false,
      error: "Unable to fetch content right now",
    });
  }
}

// Get specific content by ID
async function getSingleContentById(req, res) {
  try {
    const contentId = req.query.contentId;

    // Validate content ID
    if (!contentId || isNaN(contentId) || contentId <= 0) {
        return res.status(400).json({
        success: false,
        error: "Valid content ID is required",
      });
    }

    const content = await getContentById(parseInt(contentId));

    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error("Error fetching content by ID", error);

    res.status(500).json({
      success: false,
      error: "Unable to fetch content right now",
    });
  }
}

module.exports = {
  renderFeedPage,
  getContent,
  toggleContentLike,
  searchContent,
  watchContent,
  getRecommendations,
  getGenreContent,
  getSingleContentById,
  addContent,
};
