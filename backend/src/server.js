import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { query } from './config/db.js'
import authRoutes from './routes/auth.js'
import scooterRoutes from './routes/scooters.js'
import bookingRoutes from './routes/bookings.js'

dotenv.config()

const app = express()
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())

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
app.use('/api/bookings', bookingRoutes)

app.use((err, _req, res, _next) => {
  console.error(err)
  return res.status(500).json({ message: 'Internal server error' })
})

const port = Number(process.env.PORT || 8080)
app.listen(port, () => {
  console.log(`SwiftRide backend running on http://localhost:${port}`)
})
