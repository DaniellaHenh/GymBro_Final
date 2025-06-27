const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

// Create a group
router.post('/', groupController.createGroup);

// Get all groups
router.get('/', groupController.getGroups);

// Join a group
router.post('/join/:groupId', groupController.joinGroup);

// Get group by ID
router.get('/:groupId', groupController.getGroupById);

module.exports = router; 