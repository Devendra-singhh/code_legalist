const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const postsRouter = require("./routes/posts");


const allowedOrigins = [
  'http://localhost:3000',  // Next.js dev server
  'http://localhost:5173',  // Vite dev server
  'https://code-legalist.vercel.app',  // Production Next.js
  'https://code-legalist-forum.vercel.app'  // Production Vite
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

dotenv.config();

const app = express();
// Middleware
app.use(express.json());
app.use(cors(corsOptions));



// Connect to MongoDB
connectDB();

app.use("/api/auth", require("./routes/authRoute"));
app.use('/api/posts', postsRouter);


app.get('/', (req, res) => {
    res.send("API is running...");
  });



const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
