const { Router } = require('express');
const { toggleContentLike, searchContent, getContent, markContentAsWatched } = require('../controllers/feedController');

// Import authentication middleware
const { requireAuth } = require('../middleware/auth');

const contentRouter = Router();

// Protected routes - Apply to entire router
contentRouter.use(requireAuth);

// Content routes
contentRouter.get('/', getContent);
contentRouter.post('/like', toggleContentLike);
contentRouter.post('/:contentName/watch', markContentAsWatched);
contentRouter.get('/search', searchContent);

module.exports = { contentRouter };