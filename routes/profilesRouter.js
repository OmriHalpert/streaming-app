const { Router } = require('express');
const { addProfile, updateProfile, deleteProfile } = require('../controllers/profilesController');

const profilesRouter = Router();

// Adds a new profile
profilesRouter.post('/add', addProfile);

// Edits an existing profile
profilesRouter.put('/update', updateProfile);

// Delete a profile
profilesRouter.delete('/delete', deleteProfile);

module.exports = { profilesRouter };