const { Router } = require('express');
const { addProfile } = require('../controllers/profilesController');

const profilesRouter = Router();

// Adds a new profile
profilesRouter.post('/add', addProfile);

module.exports = { profilesRouter };