const express = require('express');
const Post = require('../models/Post');
const router = express.Router();

// שליפת כל הפוסטים שאינם פוסטים של קבוצה
router.get('/', async (req, res) => {
  const posts = await Post.find({ $or: [ { groupId: { $exists: false } }, { groupId: null }, { groupId: '' } ] }).sort({ createdAt: -1 });
  res.json(posts);
});

// יצירת פוסט חדש
router.post('/create', async (req, res) => {
  const newPost = new Post(req.body);
  await newPost.save();
  res.json(newPost);
});

// יצירת פוסט חדש עבור קבוצה מסוימת
router.post('/group/:groupId/create', async (req, res) => {
  try {
    const { text, userId, userName } = req.body;
    const { groupId } = req.params;
    const newPost = new Post({ text, userId, userName, groupId });
    await newPost.save();
    res.json(newPost);
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

module.exports = router;
