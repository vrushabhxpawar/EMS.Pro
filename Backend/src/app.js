import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import connectDB from './config/db.config.js'
import { fileURLToPath } from "url";
import path from 'path'

import cookieParser from 'cookie-parser'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express()
const PORT = process.env.PORT

app.use(cookieParser())
app.use(cors({
    origin : process.env.CLIENT,
    credentials : true
}))
app.use(express.json())
app.use(
  express.static(
    path.join(__dirname, "../Frontend/dist")
  )
);

console.log(__dirname, "../../Frontend/dist/index.html")
await connectDB()
app.listen(PORT, async (req, res) => {
    console.log(`Server : http://localhost:${PORT}`)
})
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../Frontend/dist/index.html")
  );
});

import authRoute from './routes/auth.routes.js'
import taskRoute from './routes/task.routes.js'
import boardRoute from './routes/board.routes.js'

app.use('/api/board', boardRoute)
app.use('/api/task', taskRoute)
app.use('/api/auth', authRoute)

