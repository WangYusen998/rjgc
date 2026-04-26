import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../config/db.js'

const router = Router()

router.post('/register', async (req, res) => {
  const {
    name,
    email,
    password,
    market = 'uk',
    identityNumber = '',
    cardNumber = '',
    cardLast4 = '',
    billingPostcode = '',
  } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' })
  }

  if (market === 'china' && !identityNumber) {
    return res.status(400).json({ message: 'Real-name ID is required for China registration' })
  }

  const normalizedCard = String(cardNumber || '').replace(/\s+/g, '')
  if (market === 'uk' && !/^\d{16}$/.test(normalizedCard)) {
    return res.status(400).json({ message: 'A valid credit card is required for UK registration' })
  }

  const existing = await query('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length > 0) {
    return res.status(409).json({ message: 'Email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const last4 = String(cardLast4 || normalizedCard.slice(-4))
  const verification = market === 'china' ? 'Real-name identity verified' : 'Credit card bound'
  const paymentMethod = market === 'china' ? 'Real-name APP wallet' : 'Credit card'

  await query(
    `INSERT INTO users (
      name, email, password_hash, role, status, phone, market, verification,
      identity_number, card_last4, billing_postcode, payment_method
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      name,
      email,
      passwordHash,
      'customer',
      'active',
      '',
      market,
      verification,
      identityNumber,
      last4,
      billingPostcode,
      paymentMethod,
    ],
  )

  return res.json({
    user: {
      name,
      email,
      role: 'customer',
      status: 'active',
      market,
      verification,
      paymentMethod,
      cardLast4: last4,
    },
  })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' })
  }

  const rows = await query(
    `SELECT
      id, name, email, password_hash, role, status, phone, market,
      verification, card_last4, payment_method, created_at
    FROM users
    WHERE email = ?`,
    [email],
  )
  const user = rows[0]
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })
  if (user.status === 'suspended') return res.status(403).json({ message: 'This account is suspended' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      market: user.market,
      verification: user.verification,
      cardLast4: user.card_last4,
      paymentMethod: user.payment_method,
      createdAt: user.created_at,
    },
  })
})

export default router
