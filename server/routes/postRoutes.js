const express = require('express');
const Post = require('../models/Post');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept images and videos
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image and video files are allowed'), false);
    }
  }
});



// שליפת כל הפוסטים, או רק פוסטים של קבוצות שהמשתמש חבר בהן אם סופק userId
router.get('/', async (req, res) => {
  const { userId, groupIds } = req.query;
  let posts;
  if (groupIds) {
    const groupIdArray = groupIds.split(',').map(String); // Ensure all are strings
    console.log('Querying posts for groupIds:', groupIdArray);
    posts = await Post.find({
      groupId: { $in: groupIdArray }
    }).sort({ createdAt: -1 });
    console.log('Found posts:', posts.length);
  } else {
    // Default: return all posts (including group posts)
    posts = await Post.find().sort({ createdAt: -1 });
  }
  res.json(posts);
});

// יצירת פוסט חדש עם אפשרות להעלאת קבצים מרובים
router.post('/create', upload.array('media', 5), async (req, res) => {
  try {
    console.log('Received post creation request');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    if (req.files) {
      console.log('Number of files received:', req.files.length);
      req.files.forEach((file, idx) => console.log(`File ${idx + 1}:`, file.originalname));
    }
    
    // Safely access form data
    const text = req.body?.text || '';
    const userId = req.body?.userId;
    const userName = req.body?.userName;
    const userAvatar = req.body?.userAvatar;
    const likes = req.body?.likes;
    const comments = req.body?.comments;
    
    console.log('Parsed data:', { text, userId, userName, userAvatar, likes, comments });
    
    if (!userId || !userName) {
      return res.status(400).json({ error: 'Missing required fields: userId, userName' });
    }
    
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      mediaUrls = req.files.map(file => `/uploads/${file.filename}`);
      console.log('Media files uploaded:', mediaUrls);
    }
    
    const newPost = new Post({
      text,
      userId,
      userName,
      userAvatar,
      likes: likes ? JSON.parse(likes) : [],
      comments: comments ? JSON.parse(comments) : [],
      mediaUrls
    });
    
    await newPost.save();
    console.log('Post saved successfully:', newPost._id);
    res.json(newPost);
  } catch (err) {
    console.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// יצירת פוסט חדש עבור קבוצה מסוימת עם אפשרות להעלאת קבצים מרובים
router.post('/group/:groupId/create', upload.array('media', 5), async (req, res) => {
  try {
    console.log('Received group post creation request');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    
    const { text, userId, userName, userAvatar } = req.body;
    const { groupId } = req.params;
    
    if (!userId || !userName) {
      return res.status(400).json({ error: 'Missing required fields: userId, userName' });
    }
    
    let mediaUrls = [];
    if (req.files && req.files.length > 0) {
      mediaUrls = req.files.map(file => `/uploads/${file.filename}`);
      console.log('Media files uploaded for group post:', mediaUrls);
    }
    
    const newPost = new Post({ 
      text, 
      userId, 
      userName, 
      groupId,
      userAvatar,
      mediaUrls
    });
    await newPost.save();
    res.json(newPost);
  } catch (err) {
    console.error('Error creating group post:', err);
    res.status(500).json({ error: err.message });
  }
});

// קבלת פוסטים של קבוצה מסוימת
router.get('/group/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const posts = await Post.find({ groupId }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// routes/posts.js
router.get('/group/:groupId/weekly-stats', async (req, res) => {
  const { groupId } = req.params;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);
  startDate.setHours(0, 0, 0, 0);

  try {
    const stats = await Post.aggregate([
      {
        $match: {
          groupId,
          createdAt: { $gte: startDate },
        },
      },
      {
        $group: {
          _id: { $dayOfWeek: "$createdAt" },
          count: { $sum: 1 },
        },
      },
    ]);

    const result = Array(7).fill(0).map((_, i) => {
      const match = stats.find(s => s._id === i + 1); // dayOfWeek: 1 (Sunday) to 7 (Saturday)
      return {
        day: i + 1,
        count: match ? match.count : 0
      };
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// שליפת פוסטים לפי userIds ו/או groupIds
router.get('/recent', async (req, res) => {
  try {
    const { userIds, groupIds } = req.query;

    const userIdArr = userIds ? userIds.split(',') : [];
    const groupIdArr = groupIds ? groupIds.split(',') : [];

    const posts = await Post.find({
      $or: [
        { userId: { $in: userIdArr } },
        { groupId: { $in: groupIdArr } }
      ]
    }).sort({ createdAt: -1 });

    res.json(posts);
  } catch (err) {
    console.error('שגיאה ב־/api/posts/recent:', err);
    res.status(500).json({ error: 'שגיאה בטעינת פוסטים' });
  }
});


// Like/unlike a post (must be before any /:postId route)
router.post('/:postId/like', async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    const index = post.likes.indexOf(userId);
    if (index === -1) {
      post.likes.push(userId);
    } else {
      post.likes.splice(index, 1);
    }
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add a comment to a post
router.post('/:postId/comment', async (req, res) => {
  console.log('Received comment for post:', req.params.postId, req.body); // Debug log
  try {
    const { postId } = req.params;
    const { userName, text } = req.body;
    if (!userName || !text) {
      return res.status(400).json({ error: 'Missing userName or text' });
    }
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    post.comments.push({ userName, text });
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a comment from a post
router.delete('/:postId/comment/:commentIdx', async (req, res) => {
  try {
    const { postId, commentIdx } = req.params;
    console.log('Delete comment called:', { postId, commentIdx });
    const post = await Post.findById(postId);
    if (!post) {
      console.log('Post not found for id:', postId);
      return res.status(404).json({ error: 'Post not found' });
    }
    const idx = parseInt(commentIdx, 10);
    console.log('Parsed commentIdx:', idx, 'Comments length:', post.comments.length);
    if (isNaN(idx) || idx < 0 || idx >= post.comments.length) {
      console.log('Invalid comment index:', idx, 'Comments length:', post.comments.length);
      return res.status(400).json({ error: 'Invalid comment index' });
    }
    post.comments.splice(idx, 1);
    await post.save();
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// עריכת פוסט
router.put('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const updatedPost = await Post.findByIdAndUpdate(postId, { text }, { new: true });
    if (!updatedPost) return res.status(404).json({ error: 'Post not found' });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



// מחיקת פוסט לפי מזהה
router.delete('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const deletedPost = await Post.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all public posts (no groupId)
router.get('/public', async (req, res) => {
  try {
    const posts = await Post.find({
      $or: [
        { groupId: { $exists: false } },
        { groupId: null },
        { groupId: '' }
      ]
    }).sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});



module.exports = router;
