const User = require('../models/User');

// שליטה בפעולות CRUD כלליות
exports.handleUserCommand = async (req, res) => {
  const { command, data } = req.body;

  try {
    switch (command) {
      case 'insert': {
        const newUser = new User(data);
        await newUser.save();
        return res.json({ message: 'User inserted successfully', user: newUser });
      }

      case 'select': {
        const users = await User.find({});
        return res.json({ message: 'Users fetched', users });
      }

      case 'update': {
        const updatedUser = await User.findByIdAndUpdate(
          data.userId,
          { email: data.newEmail },
          { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        return res.json({ message: 'User updated', user: updatedUser });
      }

      case 'delete': {
        const deletedUser = await User.findByIdAndDelete(data.userId);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        return res.json({ message: 'User deleted' });
      }

      case 'login': {
        const { email, password } = data;
        if (!email || !password) {
          return res.status(400).json({ message: 'Missing email or password' });
        }
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
          return res.status(401).json({ message: 'Email not found' });
        }
        if (existingUser.password !== password) {
          return res.status(401).json({ message: 'Incorrect password' });
        }
        return res.json({ message: 'Login successful', user: existingUser });
      }

      default:
        return res.status(400).json({ message: 'Unknown command' });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// שליפה לפי ID
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// עדכון לפי ID
exports.updateUserById = async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    return res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// חיפוש כללי עם טקסט
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const currentUserId = req.query.currentUserId;

    if (!query || query.trim() === '') {
      return res.json({ users: [] });
    }

    const searchRegex = new RegExp(query, 'i');

    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } },
        {
          $or: [
            { firstName: searchRegex },
            { lastName: searchRegex },
            { email: searchRegex },
            { city: searchRegex },
            { workoutTypes: searchRegex },
            { experienceLevel: searchRegex }
          ]
        }
      ]
    }).select('firstName lastName email city workoutTypes experienceLevel profilePicture');

    return res.json({ users });
  } catch (err) {
    console.error('Error searching users:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// חיפוש לפי פילטרים
exports.searchByFilters = async (req, res) => {
  try {
    const { city, workoutType, availableTimes, experienceLevel } = req.body;
    const filter = {};

    if (city) filter.city = new RegExp(city, 'i');
    if (workoutType) filter.workoutTypes = { $in: [workoutType] };
    if (availableTimes) filter.availableTimes = { $in: [availableTimes] };
    if (experienceLevel) filter.experienceLevel = experienceLevel;

    const users = await User.find(filter).select(
      '_id firstName lastName city workoutTypes availableTimes profilePicture experienceLevel'
    );

    return res.json(users);
  } catch (err) {
    console.error('Error filtering users:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// שליפה של כל המשתמשים
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// מעקב אחרי משתמש
exports.followUser = async (req, res) => {
  const followerId = req.body.followerId;
  const followeeId = req.params.id;

  if (!followerId || followerId === followeeId) {
    return res.status(400).json({ message: 'בקשה לא תקינה' });
  }

  try {
    await User.findByIdAndUpdate(followerId, { $addToSet: { following: followeeId } });
    await User.findByIdAndUpdate(followeeId, { $addToSet: { followers: followerId } });

    return res.json({ message: 'בוצע מעקב בהצלחה' });
  } catch (err) {
    console.error('Error following user:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// הסרת מעקב
exports.unfollowUser = async (req, res) => {
  const followerId = req.body.followerId;
  const followeeId = req.params.id;

  try {
    await User.findByIdAndUpdate(followerId, { $pull: { following: followeeId } });
    await User.findByIdAndUpdate(followeeId, { $pull: { followers: followerId } });

    return res.json({ message: 'בוטל מעקב' });
  } catch (err) {
    console.error('Error unfollowing user:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

// העלאת תמונת פרופיל
exports.uploadProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const id = req.params.id;
    const profilePicturePath = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(id, { profilePicture: profilePicturePath }, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'Profile picture updated', user: updatedUser });
  } catch (err) {
    console.error('Error uploading profile picture:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};
