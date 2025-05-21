const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const auth = require('../middleware/authMiddleware');
const mongoose = require('mongoose');

// Sample legal posts for each category
const samplePosts = [
  {
    username: "ConstitutionalExpert",
    city: "Washington",
    state: "DC",
    description: "Supreme Court's recent interpretation of the First Amendment in digital spaces marks a pivotal shift in online speech protection. Key takeaway: Platform-specific content moderation policies must align with constitutional principles. #ConstitutionalLaw #FirstAmendment",
    category: { id: 1, name: "Constitutional Law", color: "bg-blue-50 text-blue-600" }
  },
  {
    username: "CriminalDefender",
    city: "Chicago",
    state: "IL",
    description: "New precedent: Digital evidence in criminal proceedings requires stricter authentication standards. This affects how we handle social media evidence in court. Important for practitioners to note! #CriminalLaw #DigitalEvidence",
    category: { id: 2, name: "Criminal Law", color: "bg-red-50 text-red-600" }
  },
  {
    username: "CivilRightsAdvocate",
    city: "Atlanta",
    state: "GA",
    description: "Landmark victory: Court upholds workplace protections for remote workers under ADA. This expands accessibility requirements to virtual workspaces. A win for digital inclusion! #CivilRights #ADA #WorkplaceLaw",
    category: { id: 3, name: "Civil Rights", color: "bg-green-50 text-green-600" }
  },
  {
    username: "FamilyLawPro",
    city: "Los Angeles",
    state: "CA",
    description: "Virtual custody arrangements gaining legal recognition. Courts now considering digital visitation rights as part of custody agreements. Modern solutions for modern families. #FamilyLaw #ChildCustody",
    category: { id: 4, name: "Family Law", color: "bg-purple-50 text-purple-600" }
  },
  {
    username: "CorporateCounsel",
    city: "New York",
    state: "NY",
    description: "SEC's new guidelines on cryptocurrency reporting requirements are reshaping corporate compliance. Key deadline approaching for digital asset disclosure. Stay compliant! #CorporateLaw #Crypto",
    category: { id: 5, name: "Corporate Law", color: "bg-amber-50 text-amber-600" }
  }
];

// Create a new post
router.post('/', auth, async (req, res) => {
  try {
    const post = new Post({
      username: req.user.username,
      city: req.body.city,
      state: req.body.state,
      description: req.body.description,
      category: req.body.category
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
    
    // If no posts exist, seed with sample posts
    if (posts.length === 0) {
      await Post.insertMany(samplePosts);
      const seededPosts = await Post.find().sort({ createdAt: -1 });
      res.send(seededPosts);
    } else {
      res.send(posts);
    }
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