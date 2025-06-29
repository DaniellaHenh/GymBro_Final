const User = require('../models/User');

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
          data.userId, // כאן אתה צריך לוודא שב data.userId זה ה-_id של MongoDB
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

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user);
  } catch (err) {
    console.error('Error fetching user:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const updatedUser = await User.findByIdAndUpdate(id, req.body, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json({ message: 'User updated', user: updatedUser });
  } catch (err) {
    console.error('Error updating user:', err.message);
    return res.status(500).json({ message: 'Server error' });
  }
};

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
        { _id: { $ne: currentUserId } }, // Exclude current user
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
