const { Router } = require('express');
const { toggleContentLike, searchContent, getContent } = require('../controllers/feedController');

// Import authentication middleware
const { requireAuth } = require('../middleware/auth');

const contentRouter = Router();

// PROTECT ALL CONTENT ROUTES - Apply to entire router
contentRouter.use(requireAuth);

// All routes below this point require authentication
contentRouter.get('/', getContent);
contentRouter.post('/like', toggleContentLike);
contentRouter.get('/search', searchContent);

module.exports = { contentRouter };