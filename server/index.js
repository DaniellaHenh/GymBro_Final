const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const groupRoutes = require('./routes/groupRoutes');



const app = express();
app.use(cors());
app.use(express.json()); // For JSON requests
app.use(express.urlencoded({ extended: true })); // For URL-encoded requests

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Connect DB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/groups', groupRoutes);



const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
