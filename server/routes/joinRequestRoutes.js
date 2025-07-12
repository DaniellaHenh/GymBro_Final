const express = require('express');
const router = express.Router();
const joinRequestController = require('../controllers/joinRequestController');

// Request to join a group
router.post('/request', joinRequestController.requestToJoin);

// Get pending requests for a group (for group creator)
router.get('/pending/:groupId', joinRequestController.getPendingRequests);

// Approve a join request
router.put('/approve/:requestId', joinRequestController.approveRequest);

// Reject a join request
router.put('/reject/:requestId', joinRequestController.rejectRequest);

// Get user's join requests
router.get('/user/:userId', joinRequestController.getUserRequests);

// Cancel a join request
router.delete('/cancel/:requestId/:userId', joinRequestController.cancelRequest);

module.exports = router; 