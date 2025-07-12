const JoinRequest = require('../models/JoinRequest');
const Group = require('../models/Group');
const User = require('../models/User');

// Request to join a group
exports.requestToJoin = async (req, res) => {
  try {
    const { groupId, userId, message } = req.body;
    
    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Check if user is already a member
    if (group.members.includes(userId)) {
      return res.status(400).json({ error: 'User is already a member of this group' });
    }
    
    // Check if there's already a pending request
    const existingRequest = await JoinRequest.findOne({
      groupId,
      userId,
      status: 'pending'
    });
    
    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending request for this group' });
    }
    
    // Create new join request
    const joinRequest = new JoinRequest({
      groupId,
      userId,
      message: message || ''
    });
    
    await joinRequest.save();
    
    // Populate user details for response
    await joinRequest.populate('userId', 'firstName lastName');
    
    res.status(201).json(joinRequest);
  } catch (err) {
    console.error('Error creating join request:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get all pending requests for a group (for group creator)
exports.getPendingRequests = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    // Check if group exists
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }
    
    // Get all pending requests for this group
    const requests = await JoinRequest.find({
      groupId,
      status: 'pending'
    }).populate('userId', 'firstName lastName email');
    
    res.json(requests);
  } catch (err) {
    console.error('Error fetching pending requests:', err);
    res.status(500).json({ error: err.message });
  }
};

// Approve a join request
exports.approveRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }
    
    // Check if request is still pending
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }
    
    // Update request status
    joinRequest.status = 'approved';
    await joinRequest.save();
    
    // Add user to group members
    const group = await Group.findById(joinRequest.groupId);
    if (group && !group.members.includes(joinRequest.userId)) {
      group.members.push(joinRequest.userId);
      await group.save();
    }
    
    res.json({ message: 'Request approved successfully', joinRequest });
  } catch (err) {
    console.error('Error approving request:', err);
    res.status(500).json({ error: err.message });
  }
};

// Reject a join request
exports.rejectRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    
    const joinRequest = await JoinRequest.findById(requestId);
    if (!joinRequest) {
      return res.status(404).json({ error: 'Join request not found' });
    }
    
    // Check if request is still pending
    if (joinRequest.status !== 'pending') {
      return res.status(400).json({ error: 'Request has already been processed' });
    }
    
    // Update request status
    joinRequest.status = 'rejected';
    await joinRequest.save();
    
    res.json({ message: 'Request rejected successfully', joinRequest });
  } catch (err) {
    console.error('Error rejecting request:', err);
    res.status(500).json({ error: err.message });
  }
};

// Get user's join requests (for users to see their own requests)
exports.getUserRequests = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const requests = await JoinRequest.find({
      userId,
      status: { $in: ['pending', 'approved', 'rejected'] }
    }).populate('groupId', 'name description');
    
    res.json(requests);
  } catch (err) {
    console.error('Error fetching user requests:', err);
    res.status(500).json({ error: err.message });
  }
}; 

// Cancel (delete) a join request
exports.cancelRequest = async (req, res) => {
  try {
    const { requestId, userId } = req.params;
    const request = await JoinRequest.findOne({ _id: requestId, userId });
    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }
    if (request.status !== 'pending') {
      return res.status(400).json({ error: 'Only pending requests can be cancelled' });
    }
    await JoinRequest.deleteOne({ _id: requestId });
    res.json({ message: 'Request cancelled successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 