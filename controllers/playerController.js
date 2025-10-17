// Imports
const { getContentById } = require("../services/contentService");
const { getProgress } = require("../services/profileInteractionService");

// Main functions
async function playContent(req, res) {
    try {
        const { contentId } = req.params;
        const { userId, profileId } = req.query;
        const season = req.query.season ? parseInt(req.query.season) : null;
        const episode = req.query.episode ? parseInt(req.query.episode) : null;

        // Validate fields
        if (!userId || !profileId) {
            return res.status(400).render("error", {
                message: "Profile ID and user ID are required to play",
            });
        }

        if (!contentId) {
            return res.status(400).render("error", {
                message: "Content ID is required",
            });
        }

        // Fetch content 
        const content = await getContentById(parseInt(contentId));

        // Check if content is a show (and has a next episode)
        // nextEpisode is an array [season#, episode#]
        // If stays null, either its a movie or the last episode of a show
        let nextEpisode = null;
        const isShow = content.type === "show";
        
        if (isShow) {
            // Validate season and episode fields
            if (!season || !episode) {
                return res.status(400).render("error", {
                    message: "Season and episode numbers are required to play a show",
                });
            }

            // Check if season / episode exist
            const numOfSeasons = content.seasons.length;
            if (season <= 0 || season > numOfSeasons ||
                episode <= 0 || 
                episode > content.seasons[season - 1].episodes.length
            ) {
                return res.status(400).render("error", {
                    message: "Season and episode numbers are invalid (don't exist)",
                });
            }

            // Check if its the final season and episode
            const numOfEpisodes = content.seasons[season - 1].episodes.length;
            if (season === numOfSeasons && episode === numOfEpisodes) {
                console.log("This is the final episode, no next episode exists");
                // nextEpisode stays null
            } else if (episode === numOfEpisodes) {
                // Last episode of season, go to next season episode 1
                nextEpisode = [season + 1, 1];
            } else {
                // Go to next episode in same season
                nextEpisode = [season, episode + 1];
            }
        }

        // Fetch video URL (uses local path, in prod will use CDN URL)
        let videoUrl;
        if (isShow) {
          // Get episode video URL or fallback to default
          const episodeData = content.seasons[season - 1].episodes[episode - 1];
          videoUrl = episodeData.videoUrl || "/resources/mp4/game_of_thrones_trailer.mp4";
        } else {
          // Get movie video URL or fallback to default
          videoUrl = content.videoUrl || "/resources/mp4/the_dark_knight_trailer.mp4";
        }

        // Get saved progress
        const savedProgress = await getProgress(
          userId,
          profileId,
          parseInt(contentId),
          content.type,
          season,
          episode
        );

        // Render player page
        res.render("player", {
            content: content.toObject(),
            userId,
            profileId,
            season,
            episode,
            nextEpisode,
            hasNextEpisode: nextEpisode !== null,
            videoUrl,
            startPosition: savedProgress?.lastPositionSec || 0
        });

    } catch (error) {
        console.error("Error rendering player page:", error);
        res.status(500).render("error", {
            message: "Unable to load video player. Please try again.",
        });
    }
}

module.exports = {
    playContent,
}