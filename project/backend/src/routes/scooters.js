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

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {}
    const model = body.model || 'Swift One'
    const modelDefaults = {
      'Swift One': { image: '/static/scooters/swift-one.jpg', price: 1.2, rangeKm: 35 },
      'Swift Plus': { image: '/static/scooters/swift-plus.jpg', price: 1.5, rangeKm: 45 },
      'Swift City': { image: '/static/scooters/swift-city.jpg', price: 1.0, rangeKm: 30 },
    }
    const defaults = modelDefaults[model] || modelDefaults['Swift One']

    const stores = await query('SELECT * FROM stores WHERE id = ? LIMIT 1', [body.storeId || 'st-01'])
    if (!stores.length) return res.status(400).json({ message: 'Store not found' })
    const store = stores[0]

    const zones = await query('SELECT * FROM return_zones ORDER BY id')
    const zoneByStore = { 'st-01': 'rz-01', 'st-02': 'rz-02', 'st-03': 'rz-03', 'st-04': 'rz-03' }
    const returnZoneId = body.returnZoneId || zoneByStore[store.id] || zones[0]?.id
    if (!returnZoneId) return res.status(400).json({ message: 'Return zone not found' })

    const nextRows = await query(
      `SELECT MAX(CAST(SUBSTRING(code, 3) AS UNSIGNED)) AS max_no
       FROM scooters
       WHERE code REGEXP '^SC[0-9]+$'`,
    )
    const nextNo = Number(nextRows[0]?.max_no || 100) + 1
    const code = String(body.code || `SC${nextNo}`).trim().toUpperCase()
    const qrCode = String(body.qr || body.qrCode || `SR-${code}`).trim().toUpperCase()
    const status = body.status || 'available'
    const battery = Number(body.battery ?? 100)
    const rangeKm = Number(body.rangeKm ?? defaults.rangeKm)

    await query(
      `INSERT INTO scooters
       (code, qr_code, store_id, model, image_url, status, battery, range_km, price_per_minute,
        latitude, longitude, mileage_km, helmet, lock_status, comm_status, last_telemetry_at, return_zone_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_FORMAT(NOW(), '%H:%i'), ?)`,
      [
        code,
        qrCode,
        store.id,
        model,
        body.image || defaults.image,
        status,
        battery,
        rangeKm,
        Number(body.price ?? defaults.price),
        Number(body.latitude ?? store.latitude),
        Number(body.longitude ?? store.longitude),
        Number(body.mileage ?? 0),
        body.helmet === undefined ? 1 : Number(Boolean(body.helmet)),
        body.lockStatus || (status === 'charging' ? '充电锁定' : status === 'maintenance' ? '维修锁定' : '已上锁'),
        body.commStatus || '在线',
        returnZoneId,
      ],
    )

    if (status === 'available') {
      await query('UPDATE stores SET available = available + 1 WHERE id = ?', [store.id])
    }

    const rows = await query('SELECT * FROM scooters WHERE code = ? LIMIT 1', [code])
    return res.status(201).json(rowToScooter(rows[0]))
  } catch (error) {
    if (error?.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Scooter code or QR code already exists' })
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
