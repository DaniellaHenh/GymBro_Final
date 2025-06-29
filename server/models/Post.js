const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  text: String,
  userId: String,
  userName: String,
  groupId: String,
  likes: [String],
  comments: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', postSchema);
