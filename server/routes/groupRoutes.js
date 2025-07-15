const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create a group
router.post('/', groupController.createGroup);

// Get all groups
router.get('/', groupController.getGroups);

// Search groups (must come before :groupId route)
router.get('/search', groupController.searchGroups);

// Get group by ID
router.get('/:groupId', groupController.getGroupById);

// Join a group
router.post('/join/:groupId', groupController.joinGroup);

module.exports = router; 