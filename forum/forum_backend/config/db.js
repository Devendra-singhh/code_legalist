const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("Neither MONGO_URI nor MONGODB_URI is set in environment variables");
    }
    console.log('Attempting to connect to MongoDB at:', mongoUri ? mongoUri.replace(/:\/\/([^:@]+):([^@]+)@/, '://****:****@') : 'undefined');
    await mongoose.connect(mongoUri);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection failed", err.message);
    // process.exit(1); // Do not exit, keep server running for debugging
  }
};

module.exports = connectDB;
