import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../config/db.js'

const router = Router()

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body || {}
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'name, email, password are required' })
  }

  const existing = await query('SELECT id FROM users WHERE email = ?', [email])
  if (existing.length > 0) {
    return res.status(409).json({ message: 'Email already exists' })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await query(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
    [name, email, passwordHash, 'customer'],
  )

  return res.json({ user: { name, email, role: 'customer' } })
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body || {}
  if (!email || !password) {
    return res.status(400).json({ message: 'email and password are required' })
  }

  const rows = await query('SELECT id, name, email, password_hash, role FROM users WHERE email = ?', [email])
  const user = rows[0]
  if (!user) return res.status(401).json({ message: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.password_hash)
  if (!ok) return res.status(401).json({ message: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  })
})

export default router
