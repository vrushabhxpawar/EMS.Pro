import dotenv from 'dotenv'
dotenv.config()
import express from 'express'
import connectDB from './config/db.config.js'

import cookieParser from 'cookie-parser'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT

app.use(cookieParser())
app.use(cors({
    origin : process.env.CLIENT,
    credentials : true
}))
app.use(express.json())



await connectDB()
app.listen(PORT, async (req, res) => {
    console.log(`Server : http://localhost:${PORT}`)
})

import authRoute from './routes/auth.routes.js'
import taskRoute from './routes/task.routes.js'
import boardRoute from './routes/board.routes.js'

app.use('/api/board', boardRoute)
app.use('/api/task', taskRoute)
app.use('/api/auth', authRoute)