import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.config.js";

import cookieParser from "cookie-parser";
import cors from "cors";

const app = express();
const PORT = process.env.PORT;

app.use(cookieParser());
app.use(cors({
  origin: function (origin, callback) {
    console.log("Incoming Origin:", origin);
    console.log("CLIENT env value:", JSON.stringify(process.env.CLIENT));
    if (origin === process.env.CLIENT || !origin) {
      callback(null, true);
    } else {
      console.log("MISMATCH — blocked by CORS");
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

await connectDB();
app.listen(PORT, async (req, res) => {
  console.log(`Server : http://localhost:${PORT}`);
});


import authRoute from "./routes/auth.routes.js";
import taskRoute from "./routes/task.routes.js";
import boardRoute from "./routes/board.routes.js";

app.use("/api/board", boardRoute);
app.use("/api/task", taskRoute);
app.use("/api/auth", authRoute);
