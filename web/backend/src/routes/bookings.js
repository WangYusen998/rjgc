import { Router } from 'express'
import { query } from '../config/db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

const PRICES = {
  '1h': 4,
  '4h': 12,
  '1d': 25,
  '1w': 110,
}

router.post('/', authRequired, async (req, res) => {
  const { scooterId, hireKey } = req.body || {}
  if (!scooterId || !hireKey || !PRICES[hireKey]) {
    return res.status(400).json({ message: 'scooterId and valid hireKey are required' })
  }

  const rows = await query('SELECT id, available FROM scooters WHERE code = ?', [scooterId])
  const scooter = rows[0]
  if (!scooter) return res.status(404).json({ message: 'Scooter not found' })
  if (!scooter.available) return res.status(409).json({ message: 'Scooter is not available' })

  const bookingCode = `BK-${Date.now()}`
  await query(
    'INSERT INTO bookings (code, user_id, scooter_id, hire_key, cost, status) VALUES (?, ?, ?, ?, ?, ?)',
    [bookingCode, req.user.id, scooter.id, hireKey, PRICES[hireKey], 'pending'],
  )

  await query('UPDATE scooters SET available = 0 WHERE id = ?', [scooter.id])

  return res.json({ id: bookingCode })
})

router.post('/:bookingId/pay', authRequired, async (req, res) => {
  const bookingId = req.params.bookingId
  const { cardNumber = '', expiry = '', cvv = '' } = req.body || {}

  const rows = await query('SELECT id, status FROM bookings WHERE code = ? AND user_id = ?', [bookingId, req.user.id])
  const booking = rows[0]
  if (!booking) return res.status(404).json({ message: 'Booking not found' })

  if (booking.status !== 'pending') {
    return res.status(409).json({ message: 'Booking is not payable' })
  }

  const maskedCard = String(cardNumber).replace(/\s+/g, '').slice(-4).padStart(4, '*')
  await query(
    'INSERT INTO payments (booking_id, card_last4, expiry, cvv_mask, amount, status) VALUES (?, ?, ?, ?, (SELECT cost FROM bookings WHERE id = ?), ?)',
    [booking.id, maskedCard, expiry, cvv ? '***' : '', booking.id, 'success'],
  )

  await query('UPDATE bookings SET status = ? WHERE id = ?', ['active', booking.id])

  return res.json({ ok: true, bookingId })
})

export default router
