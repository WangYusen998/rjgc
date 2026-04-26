import { Router } from 'express'
import { query } from '../config/db.js'
import { authRequired, adminRequired } from '../middleware/auth.js'

const router = Router()

const profileDefaults = {
  city: {
    modelName: 'City Commuter',
    description: 'Light urban scooter for sharing trips, QR unlock, GPS parking checks and daily commuting.',
    topSpeedMph: 12,
    estimatedRideMiles: 20,
    payloadKg: 100,
    motor: '350W hub motor',
    deposit: 60,
    energyRate: 0.28,
  },
  cargo: {
    modelName: 'Cargo Plus',
    description: 'Higher payload scooter for walk-in rental, store pickup checks and longer battery reserve.',
    topSpeedMph: 11,
    estimatedRideMiles: 28,
    payloadKg: 130,
    motor: '500W torque motor',
    deposit: 90,
    energyRate: 0.34,
  },
  sport: {
    modelName: 'Sport Range',
    description: 'Long-range rental model with responsive acceleration, extended battery and premium pricing.',
    topSpeedMph: 15,
    estimatedRideMiles: 34,
    payloadKg: 110,
    motor: '500W high efficiency motor',
    deposit: 100,
    energyRate: 0.38,
  },
}

function parseJson(value, fallback) {
  if (!value) return fallback
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function mapScooter(row) {
  const profileKey = row.profile_key || 'city'
  const profile = profileDefaults[profileKey] || profileDefaults.city
  const battery = Number(row.battery ?? 100)
  const mileageKm = Number(row.mileage_km ?? 0)

  return {
    id: row.code,
    dbId: row.id,
    location: row.location,
    available: Boolean(row.available),
    imageUrl: row.image_url || '/scooter-placeholder.svg',
    hourlyCost: Number(row.hourly_cost || 4),
    battery,
    mileageKm,
    odometerMiles: Number((mileageKm * 0.621371).toFixed(0)),
    gps: { lat: Number(row.gps_lat || 0), lng: Number(row.gps_lng || 0) },
    profileKey,
    ...profile,
    batteryLabel: `${battery}% battery`,
    gpsStatus: `${Number(row.gps_lat || 0)}, ${Number(row.gps_lng || 0)}`,
    qrLabel: row.qr_code || 'QR unlock ready',
    communication: row.communication || '4G module online',
    chargeStatus: row.charge_status || (battery < 35 ? 'Needs charging' : battery < 70 ? 'Monitor' : 'Ready'),
    returnZones: parseJson(row.return_zones, [row.location]),
    insuranceNote:
      row.insurance_note ||
      'Traffic insurance notice is provided; illegal riding, unsafe parking, intentional damage, and rule violations remain rider responsibility.',
    opsStatus: row.ops_status || (row.available ? 'deployed' : 'in-use'),
    assignedStaff: row.assigned_staff || 'Unassigned',
    imageFit: row.image_fit || 'contain',
    imagePosition: row.image_position || 'center bottom',
    imageScale: Number(row.image_scale || 1),
  }
}

const SCOOTER_SELECT = `
  SELECT
    id, code, location, available, image_url, hourly_cost, battery, mileage_km,
    gps_lat, gps_lng, profile_key, qr_code, communication, charge_status,
    return_zones, insurance_note, ops_status, assigned_staff, image_fit,
    image_position, image_scale, created_at
  FROM scooters
`

router.get('/', async (_req, res) => {
  const rows = await query(`${SCOOTER_SELECT} ORDER BY code ASC`)
  return res.json(rows.map(mapScooter))
})

router.post('/', authRequired, adminRequired, async (req, res) => {
  const {
    id,
    location,
    hourlyCost = 4,
    imageUrl = '/scooter-placeholder.svg',
    battery = 100,
    mileageKm = 0,
    profileKey = 'city',
    assignedStaff = 'Unassigned',
    available = true,
  } = req.body || {}

  if (!id || !location) {
    return res.status(400).json({ message: 'Scooter ID and location are required' })
  }

  await query(
    `INSERT INTO scooters (
      code, location, available, image_url, hourly_cost, battery, mileage_km,
      gps_lat, gps_lng, profile_key, qr_code, communication, charge_status,
      return_zones, ops_status, assigned_staff
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      String(id).trim().toUpperCase(),
      location,
      available ? 1 : 0,
      imageUrl,
      Number(hourlyCost),
      Number(battery),
      Number(mileageKm),
      51.5072,
      -0.1276,
      profileDefaults[profileKey] ? profileKey : 'city',
      'QR unlock ready',
      '4G module online',
      Number(battery) < 35 ? 'Needs charging' : 'Ready',
      JSON.stringify([location]),
      available ? 'deployed' : 'in-use',
      assignedStaff,
    ],
  )

  const rows = await query(`${SCOOTER_SELECT} ORDER BY code ASC`)
  return res.status(201).json(rows.map(mapScooter))
})

router.patch('/:scooterId', authRequired, adminRequired, async (req, res) => {
  const rows = await query('SELECT id FROM scooters WHERE code = ?', [req.params.scooterId])
  const scooter = rows[0]
  if (!scooter) return res.status(404).json({ message: 'Scooter not found' })

  const fields = []
  const params = []
  const map = {
    location: 'location',
    available: 'available',
    hourlyCost: 'hourly_cost',
    imageUrl: 'image_url',
    battery: 'battery',
    mileageKm: 'mileage_km',
    profileKey: 'profile_key',
    opsStatus: 'ops_status',
    assignedStaff: 'assigned_staff',
  }

  for (const [apiKey, column] of Object.entries(map)) {
    if (Object.prototype.hasOwnProperty.call(req.body, apiKey)) {
      fields.push(`${column} = ?`)
      params.push(apiKey === 'available' ? (req.body[apiKey] ? 1 : 0) : req.body[apiKey])
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'battery')) {
    const battery = Number(req.body.battery)
    fields.push('charge_status = ?')
    params.push(battery < 35 ? 'Needs charging' : battery < 70 ? 'Monitor' : 'Ready')
  }

  if (fields.length > 0) {
    params.push(scooter.id)
    await query(`UPDATE scooters SET ${fields.join(', ')} WHERE id = ?`, params)
  }

  const nextRows = await query(`${SCOOTER_SELECT} ORDER BY code ASC`)
  return res.json(nextRows.map(mapScooter))
})

router.delete('/:scooterId', authRequired, adminRequired, async (req, res) => {
  const rows = await query('SELECT id FROM scooters WHERE code = ?', [req.params.scooterId])
  const scooter = rows[0]
  if (!scooter) return res.status(404).json({ message: 'Scooter not found' })

  const active = await query('SELECT id FROM bookings WHERE scooter_id = ? AND status = ?', [scooter.id, 'active'])
  if (active.length > 0) {
    return res.status(409).json({ message: 'Cannot delete a scooter with an active booking' })
  }

  await query('DELETE FROM scooters WHERE id = ?', [scooter.id])
  const nextRows = await query(`${SCOOTER_SELECT} ORDER BY code ASC`)
  return res.json(nextRows.map(mapScooter))
})

export default router
