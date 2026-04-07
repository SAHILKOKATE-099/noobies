import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connectDb } from './config/db.js'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import scoreRoutes from './routes/scoreRoutes.js'
import { seedAdminUser } from './utils/seedAdmin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  ...(process.env.CLIENT_ORIGIN ? process.env.CLIENT_ORIGIN.split(',').map((o) => o.trim()) : []),
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true)
      if (
        allowedOrigins.some((allowed) => origin === allowed) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com')
      ) {
        return callback(null, true)
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/', (_req, res) => {
  res.json({ message: 'Noobies API is running' })
})

app.use('/api', authRoutes)
app.use('/api', scoreRoutes)
app.use('/api', adminRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  if (err?.statusCode || err?.status) {
    return res.status(err.statusCode || err.status).json({ message: err.message || 'Request failed' })
  }
  return res.status(500).json({ message: 'Unexpected server error' })
})

const startServer = async () => {
  try {
    await connectDb()
    await seedAdminUser()
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`)
    })
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

startServer()
