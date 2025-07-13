const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: String,
  city: String,
  workoutTypes: [String],
  availableTimes: [String],
  age: Number,
  gender: String,
  experienceLevel: String,
  equipment: [String],
  profilePicture: String,
  description: String,
  workoutGoals: String,
  fitnessLevel: String,
  favoriteExercises: [String],
  workoutFrequency: String,
  bio: String,
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
