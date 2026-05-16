import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { query } from './config/db.js'
import authRoutes from './routes/auth.js'
import scooterRoutes from './routes/scooters.js'
import bookingRoutes from './routes/bookings.js'
import adminRoutes from './routes/admin.js'
import issueRoutes from './routes/issues.js'
import storeRoutes from './routes/stores.js'
import syncRoutes from './routes/sync.js'

dotenv.config()

const app = express()
const allowedOrigins = new Set([
  'http://localhost:5175',
  'http://127.0.0.1:5175',
])

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true)
        return
      }
      callback(new Error('Not allowed by CORS'))
    },
    credentials: true,
  }),
)
app.use(express.json())

app.get('/api', (_req, res) => {
  return res.json({
    ok: true,
    name: 'SwiftRide API',
    health: '/api/health',
    clients: {
      managementWeb: 'http://127.0.0.1:5176/',
      wechatMiniProgramApiBase: 'http://127.0.0.1:8080/api',
    },
    endpoints: [
      '/api/stores',
      '/api/scooters',
      '/api/bookings',
      '/api/issues',
      '/api/admin/dashboard',
      '/api/sync/local',
    ],
  })
})

app.get('/api/health', async (_req, res) => {
  try {
    await query('SELECT 1')
    return res.json({ ok: true })
  } catch (error) {
    return res.status(500).json({ ok: false, message: error.message })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/scooters', scooterRoutes)
app.use('/api/stores', storeRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/issues', issueRoutes)
app.use('/api/sync', syncRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  return res.status(500).json({ message: 'Internal server error' })
})

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
  console.log(`SwiftRide backend running on http://localhost:${port}`)
})

