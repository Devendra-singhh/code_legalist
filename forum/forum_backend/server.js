const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const postsRouter = require("./routes/posts");


// const corsOptions = {
//   origin: "https://code-legalist-frontend.vercel.app",
//   methods: ["GET,HEAD,PUT,PATCH,POST,DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// }

dotenv.config();

const app = express();
// Middleware
app.use(express.json());
app.use(cors());



// Connect to MongoDB
connectDB();

app.use("/api/auth", require("./routes/authRoute"));
app.use('/api/posts', postsRouter);


app.get('/', (req, res) => {
    res.send("API is running...");
  });



const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
