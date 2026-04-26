import { Router } from 'express'
import { query } from '../config/db.js'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = Router()

router.use(authRequired)
router.use(adminRequired)

function weekdayLabel(value) {
  return new Date(value).toLocaleDateString('en-GB', { weekday: 'short' })
}

function mapUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    status: row.status,
    phone: row.phone,
    market: row.market,
    verification: row.verification,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
    lastLoginAt: row.last_login_at,
    totalBookings: Number(row.totalBookings || 0),
    activeBookings: Number(row.activeBookings || 0),
    completedBookings: Number(row.completedBookings || 0),
    totalSpent: Number(row.totalSpent || 0),
  }
}

router.get('/dashboard', async (_req, res) => {
  const [usersRows, scootersRows, bookingsRows, incomeRows, chargeRows, faultRows] = await Promise.all([
    query('SELECT COUNT(*) AS totalUsers FROM users'),
    query('SELECT COUNT(*) AS totalScooters FROM scooters'),
    query('SELECT COUNT(*) AS totalBookings FROM bookings'),
    query('SELECT COALESCE(SUM(amount), 0) AS totalIncome FROM payments WHERE status = ?', ['success']),
    query('SELECT COUNT(*) AS charging FROM scooters WHERE battery < 35'),
    query('SELECT COUNT(*) AS faults FROM scooters WHERE ops_status IN (?, ?)', ['fault', 'repair']),
  ])

  return res.json({
    totalUsers: Number(usersRows[0]?.totalUsers || 0),
    totalScooters: Number(scootersRows[0]?.totalScooters || 0),
    totalBookings: Number(bookingsRows[0]?.totalBookings || 0),
    totalIncome: Number(incomeRows[0]?.totalIncome || 0),
    charging: Number(chargeRows[0]?.charging || 0),
    faults: Number(faultRows[0]?.faults || 0),
  })
})

router.get('/users', async (_req, res) => {
  const rows = await query(
    `SELECT
      u.id, u.name, u.email, u.role, u.status, u.phone, u.market,
      u.verification, u.payment_method, u.created_at, u.last_login_at,
      COUNT(b.id) AS totalBookings,
      SUM(CASE WHEN b.status = 'active' THEN 1 ELSE 0 END) AS activeBookings,
      SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completedBookings,
      COALESCE(SUM(CASE WHEN b.status <> 'cancelled' THEN b.cost ELSE 0 END), 0) AS totalSpent
    FROM users u
    LEFT JOIN bookings b ON b.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC`,
  )
  return res.json(rows.map(mapUser))
})

router.patch('/users/:userId', async (req, res) => {
  const status = req.body?.status
  if (!['active', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Valid status is required' })
  }

  await query('UPDATE users SET status = ? WHERE id = ? AND role <> ?', [status, req.params.userId, 'admin'])
  const rows = await query(
    `SELECT
      u.id, u.name, u.email, u.role, u.status, u.phone, u.market,
      u.verification, u.payment_method, u.created_at, u.last_login_at,
      COUNT(b.id) AS totalBookings,
      SUM(CASE WHEN b.status = 'active' THEN 1 ELSE 0 END) AS activeBookings,
      SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completedBookings,
      COALESCE(SUM(CASE WHEN b.status <> 'cancelled' THEN b.cost ELSE 0 END), 0) AS totalSpent
    FROM users u
    LEFT JOIN bookings b ON b.user_id = u.id
    GROUP BY u.id
    ORDER BY u.created_at DESC`,
  )
  return res.json(rows.map(mapUser))
})

router.get('/income', async (_req, res) => {
  const rows = await query(
    `SELECT
      b.hire_key,
      b.created_at,
      p.amount
    FROM payments p
    JOIN bookings b ON p.booking_id = b.id
    WHERE p.status = ?
    ORDER BY p.created_at ASC`,
    ['success'],
  )

  const weeklyIncomeByPlan = ['1h', '4h', '1d', '1w'].map((key) => ({
    plan: key,
    value: Number(rows.filter((item) => item.hire_key === key).reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2)),
  }))

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dailyIncome = weekdays.map((day) => ({
    day,
    value: Number(rows.filter((item) => weekdayLabel(item.created_at) === day).reduce((sum, item) => sum + Number(item.amount || 0), 0).toFixed(2)),
  }))

  return res.json({
    weeklyIncomeByPlan,
    dailyIncome,
    weeklyTotal: Number(dailyIncome.reduce((sum, item) => sum + item.value, 0).toFixed(2)),
  })
})

router.get('/bookings', async (_req, res) => {
  const rows = await query(
    `SELECT
      b.code, u.name AS userName, u.email AS userEmail, s.code AS scooterCode,
      b.cost, b.status, b.created_at, b.rental_mode, b.pickup_battery,
      b.return_battery, b.energy_charge, b.overdue_fee, b.return_check
    FROM bookings b
    JOIN users u ON b.user_id = u.id
    JOIN scooters s ON b.scooter_id = s.id
    ORDER BY b.created_at DESC`,
  )
  return res.json(rows)
})

router.get('/scooters', async (_req, res) => {
  const rows = await query(
    `SELECT
      id, code, location, available, image_url, hourly_cost, battery, mileage_km,
      profile_key, ops_status, assigned_staff, charge_status, created_at
    FROM scooters
    ORDER BY created_at DESC`,
  )
  return res.json(rows)
})

export default router
