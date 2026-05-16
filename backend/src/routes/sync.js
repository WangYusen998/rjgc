import express from 'express'
import bcrypt from 'bcryptjs'
import { query, transaction } from '../config/db.js'

const router = express.Router()

const scooterStatuses = new Set(['available', 'reserved', 'charging', 'maintenance'])
const bookingStatuses = new Set(['ongoing', 'paid', 'returned', 'cancelled', 'overdue'])
const issuePriorities = new Set(['低', '中', '高'])

function asText(value, fallback = '') {
  return String(value ?? fallback).trim()
}

function asNumber(value, fallback = 0) {
  const number = Number(value)
  return Number.isFinite(number) ? number : fallback
}

function asBoolean(value) {
  return value === true || value === 1 || value === '1'
}

function normalizeScooterStatus(status) {
  return scooterStatuses.has(status) ? status : 'available'
}

function normalizeBookingStatus(status) {
  return bookingStatuses.has(status) ? status : 'ongoing'
}

function normalizePriority(priority) {
  const map = { low: '低', medium: '中', high: '高', 低: '低', 中: '中', 高: '高' }
  return issuePriorities.has(map[priority]) ? map[priority] : '中'
}

async function ensureUser(connection, rawUser = {}) {
  const account = asText(rawUser.account, 'guest')
  const password = asText(rawUser.password, '123456') || '123456'
  const passwordHash = password.startsWith('$2') ? password : await bcrypt.hash(password, 10)
  const name = asText(rawUser.name || rawUser.realName, account)
  const country = asText(rawUser.country, '中国')

  await connection.execute(
    `INSERT INTO users
     (account, password_hash, name, phone, email, role, country, real_name_verified, identity_number, bank_name, bank_card_last4, card_last4, campus, status)
     VALUES (?, ?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?, ?, 'active')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       phone = VALUES(phone),
       email = VALUES(email),
       country = VALUES(country),
       real_name_verified = VALUES(real_name_verified),
       identity_number = VALUES(identity_number),
       bank_name = VALUES(bank_name),
       bank_card_last4 = VALUES(bank_card_last4),
       card_last4 = VALUES(card_last4),
       campus = VALUES(campus)`,
    [
      account,
      passwordHash,
      name,
      asText(rawUser.phone),
      asText(rawUser.email),
      country,
      asBoolean(rawUser.realNameVerified) || Boolean(rawUser.idNumber || rawUser.identityNumber) ? 1 : 0,
      asText(rawUser.idNumber || rawUser.identityNumber),
      asText(rawUser.bankName),
      asText(rawUser.bankCardLast4).slice(-4),
      asText(rawUser.cardLast4).slice(-4),
      asText(rawUser.campus, '西南交通大学犀浦校区'),
    ],
  )

  const [[user]] = await connection.execute('SELECT id, account FROM users WHERE account = ? LIMIT 1', [account])
  return user
}

async function ensureScooter(connection, rawScooter = {}) {
  const code = asText(rawScooter.id || rawScooter.code, '')
  if (!code) return null

  const storeId = asText(rawScooter.storeId || rawScooter.store_id, 'st-01')
  const returnZoneId = asText(rawScooter.returnZoneId || rawScooter.return_zone_id, 'rz-01')
  const model = ['Swift One', 'Swift Plus', 'Swift City'].includes(rawScooter.model) ? rawScooter.model : 'Swift One'

  await connection.execute(
    `INSERT INTO scooters
     (code, qr_code, store_id, model, image_url, status, battery, range_km, price_per_minute, latitude, longitude, mileage_km, helmet, lock_status, comm_status, last_telemetry_at, return_zone_id)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       store_id = VALUES(store_id),
       model = VALUES(model),
       image_url = VALUES(image_url),
       status = VALUES(status),
       battery = VALUES(battery),
       range_km = VALUES(range_km),
       price_per_minute = VALUES(price_per_minute),
       latitude = VALUES(latitude),
       longitude = VALUES(longitude),
       mileage_km = VALUES(mileage_km),
       helmet = VALUES(helmet),
       lock_status = VALUES(lock_status),
       comm_status = VALUES(comm_status),
       last_telemetry_at = VALUES(last_telemetry_at),
       return_zone_id = VALUES(return_zone_id)`,
    [
      code,
      asText(rawScooter.qr, `SR-${code}`),
      storeId,
      model,
      asText(rawScooter.image, `/static/scooters/${model.toLowerCase().replaceAll(' ', '-')}.jpg`),
      normalizeScooterStatus(rawScooter.status),
      asNumber(rawScooter.battery, 100),
      asNumber(rawScooter.rangeKm || rawScooter.range_km, 30),
      asNumber(rawScooter.price || rawScooter.price_per_minute, 1.2),
      asNumber(rawScooter.latitude, 30.7689),
      asNumber(rawScooter.longitude, 103.9843),
      asNumber(rawScooter.mileage || rawScooter.mileage_km, 0),
      asBoolean(rawScooter.helmet) ? 1 : 0,
      asText(rawScooter.lockStatus || rawScooter.lock_status, '已上锁'),
      asText(rawScooter.commStatus || rawScooter.comm_status, '在线'),
      asText(rawScooter.lastTelemetryAt || rawScooter.last_telemetry_at, '刚刚'),
      returnZoneId,
    ],
  )

  const [[scooter]] = await connection.execute('SELECT id, code FROM scooters WHERE code = ? LIMIT 1', [code])
  return scooter
}

router.post('/local', async (req, res, next) => {
  try {
    const body = req.body || {}
    const counts = await transaction(async (connection) => {
      const users = Array.isArray(body.users) ? body.users : []
      const scooters = Array.isArray(body.scooters) ? body.scooters : []
      const bookings = Array.isArray(body.bookings) ? body.bookings : []
      const issues = Array.isArray(body.issues) ? body.issues : []

      let syncedUsers = 0
      let syncedScooters = 0
      let syncedBookings = 0
      let syncedIssues = 0

      for (const user of users) {
        await ensureUser(connection, user)
        syncedUsers += 1
      }

      for (const scooter of scooters) {
        const synced = await ensureScooter(connection, scooter)
        if (synced) syncedScooters += 1
      }

      for (const booking of bookings) {
        const code = asText(booking.id || booking.code)
        if (!code) continue
        const account = asText(booking.account || body.currentUser?.account || 'student001')
        let [[user]] = await connection.execute('SELECT id, account FROM users WHERE account = ? LIMIT 1', [account])
        if (!user) {
          user = await ensureUser(connection, {
            ...(body.currentUser || {}),
            account,
            name: body.currentUser?.name || account,
          })
        }
        const scooterCode = asText(booking.scooterId || booking.scooter_code || 'SC101')
        let [[scooter]] = await connection.execute('SELECT id, code FROM scooters WHERE code = ? LIMIT 1', [scooterCode])
        if (!scooter) {
          scooter = await ensureScooter(connection, {
            id: scooterCode,
            model: booking.scooterModel || 'Swift One',
            image: booking.scooterImage,
            storeId: 'st-01',
            returnZoneId: booking.returnZoneId || 'rz-01',
            helmet: true,
          })
        }

        await connection.execute(
          `INSERT INTO bookings
           (code, user_id, scooter_id, rental_mode, status, minutes, insurance, start_battery, end_battery, start_mileage, end_mileage,
            damage_report, overdue_fee, battery_fee, dispatch_fee, return_out_of_zone, return_checked, payment_method, safety_accepted,
            deduction_accepted, total, last_action, unlock_message)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             rental_mode = VALUES(rental_mode),
             status = VALUES(status),
             minutes = VALUES(minutes),
             insurance = VALUES(insurance),
             end_battery = VALUES(end_battery),
             end_mileage = VALUES(end_mileage),
             damage_report = VALUES(damage_report),
             overdue_fee = VALUES(overdue_fee),
             battery_fee = VALUES(battery_fee),
             dispatch_fee = VALUES(dispatch_fee),
             return_out_of_zone = VALUES(return_out_of_zone),
             return_checked = VALUES(return_checked),
             payment_method = VALUES(payment_method),
             total = VALUES(total),
             last_action = VALUES(last_action),
             unlock_message = VALUES(unlock_message)`,
          [
            code,
            user.id,
            scooter.id,
            asText(booking.rentalMode || booking.rental_mode, 'sharing-cn'),
            normalizeBookingStatus(booking.status),
            asNumber(booking.minutes, 30),
            asBoolean(booking.insurance) ? 1 : 0,
            asNumber(booking.startBattery || booking.start_battery, 100),
            booking.endBattery ?? booking.end_battery ?? null,
            asNumber(booking.startMileage || booking.start_mileage, 0),
            booking.endMileage ?? booking.end_mileage ?? null,
            asText(booking.damageReport || booking.damage_report, ''),
            asNumber(booking.overdueFee || booking.overdue_fee, 0),
            asNumber(booking.batteryFee || booking.battery_fee, 0),
            asNumber(booking.dispatchFee || booking.dispatch_fee, 0),
            asBoolean(booking.returnOutOfZone || booking.return_out_of_zone) ? 1 : 0,
            asBoolean(booking.returnChecked || booking.return_checked) ? 1 : 0,
            asText(booking.paymentMethod || booking.payment_method),
            asBoolean(booking.safetyAccepted || booking.safety_accepted) ? 1 : 0,
            asBoolean(booking.deductionAccepted || booking.deduction_accepted) ? 1 : 0,
            asNumber(booking.total, 0),
            asText(booking.lastAction || booking.last_action),
            asText(booking.unlockMessage || booking.unlock_message),
          ],
        )
        syncedBookings += 1
      }

      for (const issue of issues) {
        const code = asText(issue.id || issue.code)
        if (!code) continue
        const account = asText(issue.account || body.currentUser?.account || 'student001')
        let [[user]] = await connection.execute('SELECT id, account FROM users WHERE account = ? LIMIT 1', [account])
        if (!user) {
          user = await ensureUser(connection, {
            ...(body.currentUser || {}),
            account,
            name: body.currentUser?.name || account,
          })
        }
        let scooterId = null
        const scooterCode = asText(issue.scooterId || issue.scooter_code)
        if (scooterCode) {
          const [[scooter]] = await connection.execute('SELECT id FROM scooters WHERE code = ? LIMIT 1', [scooterCode])
          scooterId = scooter?.id || null
        }

        await connection.execute(
          `INSERT INTO issues (code, user_id, scooter_id, type, message, priority, status)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             user_id = VALUES(user_id),
             scooter_id = VALUES(scooter_id),
             type = VALUES(type),
             message = VALUES(message),
             priority = VALUES(priority),
             status = VALUES(status)`,
          [
            code,
            user.id,
            scooterId,
            asText(issue.type, '其他'),
            asText(issue.message, '本地同步问题'),
            normalizePriority(issue.priority),
            asText(issue.status, '待处理'),
          ],
        )
        syncedIssues += 1
      }

      return { users: syncedUsers, scooters: syncedScooters, bookings: syncedBookings, issues: syncedIssues }
    })

    return res.json({ ok: true, synced: counts })
  } catch (error) {
    return next(error)
  }
})

export default router
