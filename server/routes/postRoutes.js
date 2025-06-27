const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// שליפת כל הפוסטים
router.get('/', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 });
  res.json(posts);
});

// יצירת פוסט חדש
router.post('/create', async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json(newPost);
});

module.exports = router;
