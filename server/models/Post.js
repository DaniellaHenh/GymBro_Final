const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  text: String,
  userId: String,
  userName: String,
  userAvatar: String,
  groupId: String,
  likes: [String],
  comments: [
    {
      userName: String,
      text: String,
      createdAt: { type: Date, default: Date.now }
    }
  ],
  createdAt: { type: Date, default: Date.now },
  mediaUrls: [String] // Changed from mediaUrl: String to mediaUrls: [String] for multiple files
});

module.exports = mongoose.model('Post', postSchema);
