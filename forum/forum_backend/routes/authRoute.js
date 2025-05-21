const express = require("express");
const router = express.Router();
const {signup, login, getDashboard, deleteAccount} = require("../controllers/authController");
const protect = require("../middleware/authMiddleware");
const User = require("../models/User");


router.post("/signup", signup);
router.post("/login", login);
router.get("/dashboard", protect, getDashboard);
router.delete("/delete-account", protect, deleteAccount);



// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.send({ user });
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });


module.exports = router;
