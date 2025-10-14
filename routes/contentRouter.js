const { Router } = require('express');
const { toggleContentLike, searchContent, getContent, markContentAsWatched, getRecommendations, getGenreContent } = require('../controllers/feedController');

// Import authentication middleware
const { requireAuth } = require('../middleware/auth');

const contentRouter = Router();

// Protected routes - Apply to entire router
contentRouter.use(requireAuth);

// Content routes
contentRouter.get('/', getContent);
contentRouter.get('/recommendations/:userId/:profileId', getRecommendations);
contentRouter.post('/like', toggleContentLike);
contentRouter.post('/:contentName/watch', markContentAsWatched);
contentRouter.get('/search', searchContent);
contentRouter.get('/:genreName', getGenreContent);

module.exports = { contentRouter };