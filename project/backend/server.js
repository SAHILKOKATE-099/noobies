import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { assertSecurityConfig, getAllowedOrigins, isOriginAllowed } from './config/security.js'
import { connectDb } from './config/db.js'
import { createRateLimiter } from './middleware/rateLimitMiddleware.js'
import adminRoutes from './routes/adminRoutes.js'
import authRoutes from './routes/authRoutes.js'
import scoreRoutes from './routes/scoreRoutes.js'
import { seedAdminUser } from './utils/seedAdmin.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

const allowedOrigins = getAllowedOrigins()
const apiLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: 'Too many requests from this IP. Please try again later.',
})

app.disable('x-powered-by')
app.set('trust proxy', 1)

app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'no-referrer')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  }

  return next()
})

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, server-to-server)
      if (!origin) return callback(null, true)
      if (isOriginAllowed(origin, allowedOrigins)) {
        return callback(null, true)
      }
      return callback(new Error(`CORS: origin ${origin} not allowed`))
    },
    credentials: true,
  }),
)
app.use(express.json({ limit: '10kb' }))
app.use('/api', apiLimiter)

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
    assertSecurityConfig()
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
