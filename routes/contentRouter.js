const { Router } = require('express');
const { toggleContentLike, searchContent } = require('../controllers/feedController');

const contentRouter = Router();

// Toggle like for content
contentRouter.post('/like', toggleContentLike);

// Search content
contentRouter.get('/search', searchContent);

module.exports = { contentRouter };