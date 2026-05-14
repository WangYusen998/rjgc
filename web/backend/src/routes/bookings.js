import { Router } from 'express'
import { query } from '../config/db.js'
import { authRequired } from '../middleware/auth.js'
import { mapScooter } from './scooters.js'

const router = Router()

const HIRE_MULTIPLIERS = {
  '1h': { label: '1 Hour', multiplier: 1 },
  '4h': { label: '4 Hours', multiplier: 3 },
  '1d': { label: '1 Day', multiplier: 6.25 },
  '1w': { label: '1 Week', multiplier: 27.5 },
}

function formatDateTime(value = new Date()) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function parseTimeline(value, fallback) {
  if (!value) return fallback
  if (Array.isArray(value)) return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

function mapBooking(row) {
  const scooter = mapScooter({
    id: row.scooterDbId,
    code: row.scooterCode,
    location: row.scooterLocation,
    available: row.available,
    image_url: row.imageUrl,
    hourly_cost: row.scooterRate,
    battery: row.scooterBattery,
    mileage_km: row.mileageKm,
    gps_lat: row.gpsLat,
    gps_lng: row.gpsLng,
    profile_key: row.profileKey,
    qr_code: row.qrCode,
    communication: row.communication,
    charge_status: row.chargeStatus,
    return_zones: row.returnZones,
    insurance_note: row.insuranceNote,
    ops_status: row.opsStatus,
    assigned_staff: row.assignedStaff,
  })

  const createdAt = row.created_at || row.createdAt
  return {
    id: row.code,
    scooterId: row.scooterCode,
    userId: `USR-${row.user_id}`,
    userName: row.userName || 'Unknown User',
    userEmail: row.userEmail || 'n/a',
    userRole: row.userRole || 'customer',
    hireKey: row.hire_key,
    hireLabel: row.hire_label || HIRE_MULTIPLIERS[row.hire_key]?.label || row.hire_key,
    cost: Number(row.cost || 0),
    status: row.status,
    createdAt,
    route: row.route || `${row.scooterLocation} -> City Center`,
    pickupPoint: row.pickup_point || row.scooterLocation,
    paymentLast4: row.paymentLast4 || '',
    notes: row.notes || '',
    rentalMode: row.rental_mode || 'remote-pickup',
    pickupBattery: row.pickup_battery ?? scooter.battery,
    returnBattery: row.return_battery,
    energyCharge: Number(row.energy_charge || 0),
    overdueFee: Number(row.overdue_fee || 0),
    damageStatus: row.damage_status || 'No damage inspection recorded yet.',
    returnCheck: row.return_check || 'Return check pending.',
    insurance: row.insurance || scooter.insuranceNote,
    timeline: parseTimeline(row.timeline, [{ step: 'Created', time: formatDateTime(createdAt) }]),
    scooterLocation: scooter.location,
    scooterRate: scooter.hourlyCost,
    scooterBattery: scooter.battery,
    scooterMileageKm: scooter.mileageKm,
    scooterGps: scooter.gps,
    scooterProfile: {
      modelName: scooter.modelName,
      description: scooter.description,
      topSpeedMph: scooter.topSpeedMph,
      estimatedRideMiles: scooter.estimatedRideMiles,
      payloadKg: scooter.payloadKg,
      motor: scooter.motor,
      deposit: scooter.deposit,
      energyRate: scooter.energyRate,
    },
    scooterCommunication: scooter.communication,
    scooterReturnZones: scooter.returnZones,
  }
}

const BOOKING_SELECT = `
  SELECT
    b.id, b.code, b.user_id, b.hire_key, b.hire_label, b.cost, b.status,
    b.created_at, b.route, b.pickup_point, b.notes, b.rental_mode,
    b.pickup_battery, b.return_battery, b.energy_charge, b.overdue_fee,
    b.damage_status, b.return_check, b.insurance, b.timeline,
    u.name AS userName, u.email AS userEmail, u.role AS userRole,
    s.id AS scooterDbId, s.code AS scooterCode, s.location AS scooterLocation,
    s.available, s.image_url AS imageUrl, s.hourly_cost AS scooterRate,
    s.battery AS scooterBattery, s.mileage_km AS mileageKm,
    s.gps_lat AS gpsLat, s.gps_lng AS gpsLng, s.profile_key AS profileKey,
    s.qr_code AS qrCode, s.communication, s.charge_status AS chargeStatus,
    s.return_zones AS returnZones, s.insurance_note AS insuranceNote,
    s.ops_status AS opsStatus, s.assigned_staff AS assignedStaff,
    p.card_last4 AS paymentLast4
  FROM bookings b
  JOIN users u ON b.user_id = u.id
  JOIN scooters s ON b.scooter_id = s.id
  LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'success'
`

router.get('/', authRequired, async (req, res) => {
  const params = []
  const where = req.user.role === 'admin' ? '' : 'WHERE b.user_id = ?'
  if (where) params.push(req.user.id)

  const rows = await query(`${BOOKING_SELECT} ${where} ORDER BY b.created_at DESC`, params)
  return res.json(rows.map(mapBooking))
})

router.get('/:bookingId', authRequired, async (req, res) => {
  const params = [req.params.bookingId]
  const ownerCheck = req.user.role === 'admin' ? '' : 'AND b.user_id = ?'
  if (ownerCheck) params.push(req.user.id)

  const rows = await query(`${BOOKING_SELECT} WHERE b.code = ? ${ownerCheck}`, params)
  const booking = rows[0]
  if (!booking) return res.status(404).json({ message: 'Booking not found' })
  return res.json(mapBooking(booking))
})

router.post('/', authRequired, async (req, res) => {
  const { scooterId, hireKey, rentalMode = 'remote-pickup' } = req.body || {}
  const meta = HIRE_MULTIPLIERS[hireKey]
  if (!scooterId || !meta) {
    return res.status(400).json({ message: 'scooterId and valid hireKey are required' })
  }

  const rows = await query('SELECT id, available, hourly_cost, battery, location FROM scooters WHERE code = ?', [scooterId])
  const scooter = rows[0]
  if (!scooter) return res.status(404).json({ message: 'Scooter not found' })
  if (!scooter.available) return res.status(409).json({ message: 'Scooter is not available' })

  const bookingCode = `BK-${Date.now()}`
  const cost = Number((Number(scooter.hourly_cost || 4) * meta.multiplier).toFixed(2))
  const timeline = [{ step: 'Created', time: formatDateTime() }]
  const returnCheck =
    rentalMode === 'sharing'
      ? 'APP return requires permitted parking-zone GPS check.'
      : 'Return must be confirmed by store staff.'
  const damageStatus = rentalMode === 'walk-in' ? 'Store clerk will inspect at pickup.' : 'Pre-unlock photo check pending.'

  await query(
    `INSERT INTO bookings (
      code, user_id, scooter_id, hire_key, hire_label, cost, status, route,
      pickup_point, notes, rental_mode, pickup_battery, return_battery,
      energy_charge, overdue_fee, damage_status, return_check, insurance, timeline
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      bookingCode,
      req.user.id,
      scooter.id,
      hireKey,
      meta.label,
      cost,
      'pending',
      `${scooter.location} -> City Center`,
      scooter.location,
      'Awaiting payment confirmation.',
      rentalMode,
      Number(scooter.battery || 0),
      null,
      0,
      0,
      damageStatus,
      returnCheck,
      'Traffic insurance notice and liability disclaimer accepted before payment.',
      JSON.stringify(timeline),
    ],
  )

  await query('UPDATE scooters SET available = 0, ops_status = ? WHERE id = ?', ['in-use', scooter.id])
  return res.json({ id: bookingCode })
})

router.post('/:bookingId/pay', authRequired, async (req, res) => {
  const { cardNumber = '', expiry = '', cvv = '' } = req.body || {}
  const rows = await query('SELECT id, status, cost, timeline FROM bookings WHERE code = ? AND user_id = ?', [req.params.bookingId, req.user.id])
  const booking = rows[0]
  if (!booking) return res.status(404).json({ message: 'Booking not found' })
  if (booking.status !== 'pending') return res.status(409).json({ message: 'Booking is not payable' })

  const maskedCard = String(cardNumber).replace(/\s+/g, '').slice(-4).padStart(4, '*')
  await query(
    'INSERT INTO payments (booking_id, card_last4, expiry, cvv_mask, amount, status) VALUES (?, ?, ?, ?, ?, ?)',
    [booking.id, maskedCard, expiry, cvv ? '***' : '', booking.cost, 'success'],
  )

  const timeline = parseTimeline(booking.timeline, [])
  timeline.push({ step: 'Paid', time: formatDateTime() }, { step: 'Active', time: formatDateTime() })
  await query('UPDATE bookings SET status = ?, notes = ?, timeline = ? WHERE id = ?', [
    'active',
    'Payment confirmed by backend.',
    JSON.stringify(timeline),
    booking.id,
  ])

  return res.json({ ok: true, bookingId: req.params.bookingId })
})

router.post('/:bookingId/cancel', authRequired, async (req, res) => {
  const rows = await query('SELECT id, scooter_id, status, timeline FROM bookings WHERE code = ? AND (user_id = ? OR ? = ?)', [
    req.params.bookingId,
    req.user.id,
    req.user.role,
    'admin',
  ])
  const booking = rows[0]
  if (!booking) return res.status(404).json({ message: 'Booking not found' })
  if (!['active', 'pending'].includes(booking.status)) return res.status(409).json({ message: 'Only active or pending bookings can be cancelled' })

  const timeline = parseTimeline(booking.timeline, [])
  timeline.push({ step: 'Cancelled', time: formatDateTime() })
  await query('UPDATE bookings SET status = ?, notes = ?, timeline = ? WHERE id = ?', [
    'cancelled',
    'Cancelled by backend.',
    JSON.stringify(timeline),
    booking.id,
  ])
  await query('UPDATE scooters SET available = 1, ops_status = ? WHERE id = ?', ['deployed', booking.scooter_id])

  const listRows = await query(`${BOOKING_SELECT} ${req.user.role === 'admin' ? '' : 'WHERE b.user_id = ?'} ORDER BY b.created_at DESC`, req.user.role === 'admin' ? [] : [req.user.id])
  return res.json(listRows.map(mapBooking))
})

router.post('/:bookingId/extend', authRequired, async (req, res) => {
  const rows = await query(
    `SELECT b.id, b.cost, b.status, b.timeline, s.hourly_cost
     FROM bookings b
     JOIN scooters s ON b.scooter_id = s.id
     WHERE b.code = ? AND (b.user_id = ? OR ? = ?)`,
    [req.params.bookingId, req.user.id, req.user.role, 'admin'],
  )
  const booking = rows[0]
  if (!booking) return res.status(404).json({ message: 'Booking not found' })
  if (booking.status !== 'active') return res.status(409).json({ message: 'Only active bookings can be extended' })

  const timeline = parseTimeline(booking.timeline, [])
  timeline.push({ step: 'Extended +1h', time: formatDateTime() })
  await query('UPDATE bookings SET cost = ?, overdue_fee = overdue_fee + ?, timeline = ?, notes = ? WHERE id = ?', [
    Number((Number(booking.cost) + Number(booking.hourly_cost || 4)).toFixed(2)),
    Number(booking.hourly_cost || 4),
    JSON.stringify(timeline),
    'Extended by one hour through backend.',
    booking.id,
  ])

  const listRows = await query(`${BOOKING_SELECT} ${req.user.role === 'admin' ? '' : 'WHERE b.user_id = ?'} ORDER BY b.created_at DESC`, req.user.role === 'admin' ? [] : [req.user.id])
  return res.json(listRows.map(mapBooking))
})

export default router
