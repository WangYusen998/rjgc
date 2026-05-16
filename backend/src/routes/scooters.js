import express from 'express'
import { query } from '../config/db.js'

const router = express.Router()

function rowToScooter(row) {
  return {
    id: row.code,
    qr: row.qr_code,
    storeId: row.store_id,
    model: row.model,
    image: row.image_url,
    status: row.status,
    battery: row.battery,
    rangeKm: row.range_km,
    price: Number(row.price_per_minute),
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    mileage: Number(row.mileage_km),
    helmet: Boolean(row.helmet),
    lockStatus: row.lock_status,
    commStatus: row.comm_status,
    lastTelemetryAt: row.last_telemetry_at,
    returnZoneId: row.return_zone_id,
  }
}

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query('SELECT * FROM scooters ORDER BY code')
    return res.json(rows.map(rowToScooter))
  } catch (error) {
    return next(error)
  }
})

router.get('/:code', async (req, res, next) => {
  try {
    const rows = await query('SELECT * FROM scooters WHERE code = ? OR qr_code = ? LIMIT 1', [req.params.code, req.params.code])
    if (!rows.length) return res.status(404).json({ message: 'Scooter not found' })
    return res.json(rowToScooter(rows[0]))
  } catch (error) {
    return next(error)
  }
})

router.patch('/:code', async (req, res, next) => {
  try {
    const patch = req.body || {}
    await query(
      `UPDATE scooters SET
       status = COALESCE(?, status),
       battery = COALESCE(?, battery),
       helmet = COALESCE(?, helmet),
       lock_status = COALESCE(?, lock_status),
       comm_status = COALESCE(?, comm_status),
       last_telemetry_at = DATE_FORMAT(NOW(), '%H:%i')
       WHERE code = ?`,
      [
        patch.status ?? null,
        patch.battery ?? null,
        patch.helmet === undefined ? null : Number(Boolean(patch.helmet)),
        patch.lockStatus ?? null,
        patch.commStatus ?? null,
        req.params.code,
      ],
    )
    const rows = await query('SELECT * FROM scooters WHERE code = ? LIMIT 1', [req.params.code])
    return res.json(rowToScooter(rows[0]))
  } catch (error) {
    return next(error)
  }
})

export default router

