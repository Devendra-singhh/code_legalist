const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });

const signup = async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  if (!firstName || !lastName || !username || !password) {
    return res.status(400).json({ message: "Please fill in all fields" });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists" });
    }
  
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      firstName,
      lastName,
      username,
      password: hashedPassword,
    });
  
    const token = generateToken(user._id);
    
    res.status(201).json({
      message: "Account created successfully",
      id: user._id,
      token,
      username: user.username,
    });
    
  } catch(error) {
    res.status(500).json({ message: "Error creating account", error: error.message });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;

  try{

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
  
    const token = generateToken(user._id);
  
    res.status(200).json({
      message: "Logged in successfully",
      id: user._id,
      token,
      username: user.username,
    });
  }catch(error){
    res.status(500).json({ message: "Error logging in", error: error.message });
  }

};


const getDashboard = async(req, res) => {
  try{
    if(!req.user){
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    res.json({ message: "Dashboard data", user: req.user });
  }catch(error){
    res.status(500).json({ message: "Error getting dashboard data", error: error.message });
  }
}

const deleteAccount = async (req, res) => {
  try {
    await req.user.deleteOne(); // req.user is from auth middleware
    res.status(200).json({ message: "Account deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting account", error: err.message });
  }
};





module.exports = { signup, login , getDashboard, deleteAccount};