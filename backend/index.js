import "dotenv/config";
import cors from "cors";
import express from "express";

import { connectDB } from "./db.js";
import { authenticate } from "./middleware/auth.js";

import mainRouter from "./routes/main.js";
import accountRouter from "./routes/account.js";
import postRouter from "./routes/post.js";
import chatRouter from "./routes/chat.js"

const app = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://soleada.web.app",
    "https://soleada.web.app/Kids",
    "https://soleada.web.app/Landing",
    "https://soleada.web.app/Register",
    "https://soleada.web.app/UserDashboard",
    "https://soleada.web.app/PostFeed",
  ],
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(express.json());

await connectDB();

app.get('/', (req, res) => {
  res.send('API is working!');
});

app.use("/account", accountRouter);
app.use("/chat", authenticate, chatRouter);
app.use("/post", authenticate, postRouter);

console.log("hello")
const port = 5000;

// dev --> app.listen(port, () => console.log(`Server running on port ${port}`));
// prod --> app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

// app.listen(port, '0.0.0.0', () => console.log(`Server running on port ${port}`));

app.listen(port, () => console.log(`Server running on port ${port}`));