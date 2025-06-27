const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
<<<<<<< HEAD
const groupRoutes = require('./routes/groupRoutes');
=======
>>>>>>> 1e1398ecff8698adaefc4afdf5c3b04ee9d901ec


const app = express();
app.use(cors());
app.use(bodyParser.json());

// Connect DB
connectDB();

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
<<<<<<< HEAD
app.use('/api/groups', groupRoutes);
=======
>>>>>>> 1e1398ecff8698adaefc4afdf5c3b04ee9d901ec


const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
