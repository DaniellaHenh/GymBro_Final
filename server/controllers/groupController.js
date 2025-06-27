const Group = require('../models/Group');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  console.log('Create group body:', req.body);
  try {
    const { name, description, createdBy } = req.body;
    // Check for duplicate group name
    const existingGroup = await Group.findOne({ name });
    if (existingGroup) {
      return res.status(400).json({ error: 'A group with this name already exists.' });
    }
    const group = new Group({ name, description, createdBy, members: [createdBy] });
    await group.save();
    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find()
      .populate('createdBy', 'firstName lastName')
      .populate('members');
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user ? req.user._id : req.body.userId; // Adjust as needed for your auth
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ error: 'Group not found' });
    if (!group.members.includes(userId)) {
      group.members.push(userId);
      await group.save();
    }
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getGroupById = async (req, res) => {
  try {
    const group = await Group.findById(req.params.groupId)
      .populate('createdBy', 'firstName lastName')
      .populate('members');
    if (!group) return res.status(404).json({ error: 'Group not found' });
    console.log('Group with populated members:', JSON.stringify(group, null, 2));
    res.json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 