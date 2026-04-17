require("dotenv").config({ path: __dirname + "/.env" });
console.log("Loaded env file");
console.log("MONGO_URI present:", process.env.MONGO_URI ? "yes" : "no");
console.log("NODE_ENV:", process.env.NODE_ENV);
console.log("PORT:", process.env.PORT);

const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const postsRouter = require("./routes/posts");


const allowedOrigins = [
  'http://localhost:3000',  // Next.js dev server
  'http://localhost:5173',  // Vite dev server
  'http://127.0.0.1:5173',  // Vite specific IP
  'https://code-legalist.vercel.app',  // Production Next.js
  'https://code-legalist-forum.vercel.app',  // Production Vite
  'https://sloq.me',
  'https://forum.sloq.me',
  'https://chat.sloq.me'
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};


const app = express();
// Middleware
app.use(express.json());
app.use(cors()); // TEMPORARY: Allow all origins for debugging


// Connect to MongoDB
connectDB();

app.use("/api/auth", require("./routes/authRoute"));
app.use('/api/posts', postsRouter);


app.get('/', (req, res) => {
  res.send("API is running...");
});



const PORT = process.env.PORT || 5050;

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  console.error('Error Details:', {
    message: err.message,
    path: req.path,
    method: req.method,
    body: req.body,
    query: req.query,
    params: req.params
  });

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production'
      ? 'Internal Server Error'
      : err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Error: ${err.message}`);
  process.exit(1);
});

// Handle SIGTERM (for Vercel)
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});