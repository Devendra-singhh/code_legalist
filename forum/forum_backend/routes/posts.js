const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      username: req.user.username,
      city: req.body.city,
      state: req.body.state,
      description: req.body.description
    });

    await post.save();
    res.status(201).send(post);
  } catch (error) {
    res.status(400).send({ error: error.message });
  }
});

// Get all posts
router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.send(posts);
  } catch (error) {
    res.status(500).send({ error: error.message });
  }
});


// Get posts by username
router.get('/user/:username', auth, async (req, res) => {
    try {
      const username = req.params.username;
      
      // Optional pagination parameters
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const skip = (page - 1) * limit;
  
      // Find posts by username with pagination
      const posts = await Post.find({ username })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
  
      const totalPosts = await Post.countDocuments({ username });
  
      if (posts.length === 0) {
        return res.status(404).send({
          error: 'No posts found for this user',
          username: username
        });
      }
  
      res.send({
        posts,
        total: totalPosts,
        page,
        pages: Math.ceil(totalPosts / limit),
        username: username
      });
    } catch (error) {
      res.status(500).send({
        error: 'Failed to fetch user posts',
        details: error.message
      });
    }
  });

module.exports = router;