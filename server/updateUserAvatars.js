const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');

// Replace with your MongoDB connection string
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://Inbarnadav123:u7WXs6HOB4wSZiqt@cluster0.rytl3y7.mongodb.net/myprojectdb?retryWrites=true&w=majority&appName=Cluster0';

async function updateUserAvatars(userId) {
  await mongoose.connect(MONGO_URI);
  const user = await User.findById(userId);
  if (!user) {
    console.error('User not found');
    process.exit(1);
  }
  const profilePicture = user.profilePicture || '';
  const result = await Post.updateMany(
    { userId: userId },
    { $set: { userAvatar: profilePicture } }
  );
  console.log(`Updated ${result.modifiedCount} posts for user ${userId}`);
  await mongoose.disconnect();
}

// Usage: node updateUserAvatars.js <userId>
if (require.main === module) {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: node updateUserAvatars.js <userId>');
    process.exit(1);
  }
  updateUserAvatars(userId).catch(err => {
    console.error('Error updating avatars:', err);
    process.exit(1);
  });
} 