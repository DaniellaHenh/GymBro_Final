const User = require('../models/User');

exports.handleUserCommand = async (req, res) => {
  const { command, data } = req.body;

  try {
    switch (command) {
      case 'insert':
        const newUser = new User(data);
        await newUser.save();
        return res.json({ message: 'User inserted successfully', user: newUser });

      case 'select':
        const users = await User.find({});
        return res.json({ message: 'Users fetched', users });

      case 'update':
        const updatedUser = await User.findByIdAndUpdate(
          data.userId,
          { email: data.newEmail },
          { new: true }
        );
        if (!updatedUser) return res.status(404).json({ message: 'User not found' });
        return res.json({ message: 'User updated', user: updatedUser });

      case 'delete':
        const deletedUser = await User.findByIdAndDelete(data.userId);
        if (!deletedUser) return res.status(404).json({ message: 'User not found' });
        return res.json({ message: 'User deleted' });

      default:
        return res.status(400).json({ message: 'Unknown command' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
