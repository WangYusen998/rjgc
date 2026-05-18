import express from 'express'
import { query, transaction } from '../config/db.js'

const router = express.Router()

function rowToBooking(row) {
  return {
    id: row.code,
    account: row.account,
    scooterId: row.scooter_code,
    scooterModel: row.scooter_model,
    scooterImage: row.scooter_image,
    storeName: row.store_name,
    pickupStoreName: row.store_name,
    rentalMode: row.rental_mode,
    returnZoneId: row.return_zone_id,
    status: row.status,
    createdAt: row.created_at_text,
    minutes: row.minutes,
    insurance: Boolean(row.insurance),
    startBattery: row.start_battery,
    endBattery: row.end_battery,
    startMileage: Number(row.start_mileage),
    endMileage: row.end_mileage === null ? null : Number(row.end_mileage),
    damageReport: row.damage_report,
    overdueFee: Number(row.overdue_fee),
    batteryFee: Number(row.battery_fee),
    dispatchFee: Number(row.dispatch_fee),
    returnOutOfZone: Boolean(row.return_out_of_zone),
    returnChecked: Boolean(row.return_checked),
    paymentMethod: row.payment_method,
    safetyAccepted: Boolean(row.safety_accepted),
    deductionAccepted: Boolean(row.deduction_accepted),
    total: Number(row.total),
    lastAction: row.last_action,
    unlockMessage: row.unlock_message,
  }
}

const selectSql = `
  SELECT b.*, DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i') AS created_at_text,
         u.account, s.code AS scooter_code, s.model AS scooter_model, s.image_url AS scooter_image,
         s.return_zone_id, st.name AS store_name
  FROM bookings b
  JOIN users u ON u.id = b.user_id
  JOIN scooters s ON s.id = b.scooter_id
  JOIN stores st ON st.id = s.store_id
`

router.get('/', async (req, res, next) => {
  try {
    const account = req.query.account || ''
    const rows = await query(
      `${selectSql} ${account ? 'WHERE u.account = ?' : ''} ORDER BY b.created_at DESC`,
      account ? [account] : [],
    )
    return res.json(rows.map(rowToBooking))
  } catch (error) {
    return next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const body = req.body || {}
    const code = `ORD${Date.now().toString().slice(-8)}`
    const result = await transaction(async (connection) => {
      const [[user]] = await connection.execute('SELECT * FROM users WHERE account = ? LIMIT 1', [body.account || 'student001'])
      const [[scooter]] = await connection.execute('SELECT * FROM scooters WHERE code = ? LIMIT 1', [body.scooterId])
      if (!user || !scooter) throw new Error('User or scooter not found')
      const minutes = Number(body.minutes || 30)
      const total = Number(body.quotedTotal || (scooter.price_per_minute * minutes + (body.insurance ? 2 : 0))).toFixed(2)
      await connection.execute(
        `INSERT INTO bookings
         (code, user_id, scooter_id, rental_mode, status, minutes, insurance, start_battery, start_mileage, total,
          payment_method, safety_accepted, deduction_accepted, last_action, unlock_message)
         VALUES (?, ?, ?, ?, 'ongoing', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          code,
          user.id,
          scooter.id,
          body.rentalMode || 'sharing-cn',
          minutes,
          Number(Boolean(body.insurance)),
          scooter.battery,
          scooter.mileage_km,
          total,
          body.paymentMethod || '',
          Number(Boolean(body.safetyAccepted)),
          Number(Boolean(body.deductionAccepted)),
          body.paymentMethod
            ? `已选择 ${body.paymentMethod} 并确认安全协议，随后发送解锁指令。`
            : '等待用户付款与安全协议确认。',
          `通信模块已向后台发送 ${scooter.code} 解锁指令`,
        ],
      )
      await connection.execute("UPDATE scooters SET status = 'reserved', lock_status = '预订锁定' WHERE id = ?", [scooter.id])
      return code
    })
    const rows = await query(`${selectSql} WHERE b.code = ? LIMIT 1`, [result])
    return res.status(201).json(rowToBooking(rows[0]))
  } catch (error) {
    return next(error)
  }
})

router.patch('/:code', async (req, res, next) => {
  try {
    const patch = req.body || {}
    await query(
      `UPDATE bookings SET
       status = COALESCE(?, status),
       minutes = COALESCE(?, minutes),
       total = COALESCE(?, total),
       payment_method = COALESCE(?, payment_method),
       end_battery = COALESCE(?, end_battery),
       end_mileage = COALESCE(?, end_mileage),
       damage_report = COALESCE(?, damage_report),
       overdue_fee = COALESCE(?, overdue_fee),
       battery_fee = COALESCE(?, battery_fee),
       dispatch_fee = COALESCE(?, dispatch_fee),
       return_out_of_zone = COALESCE(?, return_out_of_zone),
       return_checked = COALESCE(?, return_checked),
       last_action = COALESCE(?, last_action)
       WHERE code = ?`,
      [
        patch.status ?? null,
        patch.minutes ?? null,
        patch.total ?? null,
        patch.paymentMethod ?? null,
        patch.endBattery ?? null,
        patch.endMileage ?? null,
        patch.damageReport ?? null,
        patch.overdueFee ?? null,
        patch.batteryFee ?? null,
        patch.dispatchFee ?? null,
        patch.returnOutOfZone === undefined ? null : Number(Boolean(patch.returnOutOfZone)),
        patch.returnChecked === undefined ? null : Number(Boolean(patch.returnChecked)),
        patch.lastAction ?? null,
        req.params.code,
      ],
    )
    const rows = await query(`${selectSql} WHERE b.code = ? LIMIT 1`, [req.params.code])
    return res.json(rowToBooking(rows[0]))
  } catch (error) {
    return next(error)
  }
})

export default router

