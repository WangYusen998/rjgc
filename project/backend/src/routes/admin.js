import express from 'express'
import { query, transaction } from '../config/db.js'

const router = express.Router()

router.get('/dashboard', async (_req, res, next) => {
  try {
    const [users, scooters, stores, bookings, issues] = await Promise.all([
      query('SELECT account, name, phone, email, country, real_name_verified, bank_card_last4, card_last4 FROM users WHERE role = "customer" ORDER BY id'),
      query('SELECT * FROM scooters ORDER BY code'),
      query('SELECT id, name, address, latitude, longitude, open_hours AS open, available, rating FROM stores ORDER BY id'),
      query(`SELECT b.*, DATE_FORMAT(b.created_at, '%Y-%m-%d %H:%i') AS created_at_text, u.account, s.code AS scooter_code, s.model AS scooter_model, s.image_url AS scooter_image, st.name AS store_name
             FROM bookings b JOIN users u ON u.id = b.user_id JOIN scooters s ON s.id = b.scooter_id JOIN stores st ON st.id = s.store_id ORDER BY b.created_at DESC`),
      query(`SELECT i.*, DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i') AS created_at_text, u.account, s.code AS scooter_code
             FROM issues i LEFT JOIN users u ON u.id = i.user_id LEFT JOIN scooters s ON s.id = i.scooter_id ORDER BY i.created_at DESC`),
    ])

    const mappedScooters = scooters.map((row) => ({
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
    }))
    const mappedBookings = bookings.map((row) => ({
      id: row.code,
      account: row.account,
      scooterId: row.scooter_code,
      scooterModel: row.scooter_model,
      scooterImage: row.scooter_image,
      storeName: row.store_name,
      status: row.status,
      createdAt: row.created_at_text,
      minutes: row.minutes,
      total: Number(row.total),
      paymentMethod: row.payment_method,
      overdueFee: Number(row.overdue_fee),
      batteryFee: Number(row.battery_fee),
      dispatchFee: Number(row.dispatch_fee),
      lastAction: row.last_action,
    }))
    const mappedIssues = issues.map((row) => ({
      id: row.code,
      scooterId: row.scooter_code || '',
      type: row.type,
      message: row.message,
      priority: row.priority,
      status: row.status,
      account: row.account,
      createdAt: row.created_at_text,
    }))
    const revenue = mappedBookings.reduce((sum, item) => sum + Number(item.total || 0), 0)
    return res.json({
      users: users.map((row) => ({
        ...row,
        realNameVerified: Boolean(row.real_name_verified),
        bankCardLast4: row.bank_card_last4,
        cardLast4: row.card_last4,
        bookingCount: mappedBookings.filter((booking) => booking.account === row.account).length,
      })),
      frequentUsers: users.map((row) => ({
        ...row,
        realNameVerified: Boolean(row.real_name_verified),
        bankCardLast4: row.bank_card_last4,
        cardLast4: row.card_last4,
        bookingCount: mappedBookings.filter((booking) => booking.account === row.account).length,
      })),
      scooters: mappedScooters,
      stores,
      bookings: mappedBookings,
      issues: mappedIssues,
      priceSettings: [
        { model: 'Swift One', displayName: '轻行款', minutePrice: 1.2, storePrice: 38, deposit: 99, status: '启用' },
        { model: 'Swift Plus', displayName: '长续航款', minutePrice: 1.5, storePrice: 48, deposit: 129, status: '启用' },
        { model: 'Swift City', displayName: '城市耐用款', minutePrice: 1, storePrice: 32, deposit: 89, status: '启用' },
      ],
      promotions: [
        { id: 'promo-frequency', name: '高频用户九折', rule: '累计订单不少于 3 单', discount: 10, status: '启用' },
        { id: 'promo-student', name: '校园学生优惠', rule: '西南交通大学犀浦校区用户', discount: 8, status: '暂停' },
      ],
      staff: [
        { id: 'staff-a', name: '调度员 A', role: '车辆部署', task: '北门补车 3 辆', status: '执行中' },
        { id: 'staff-b', name: '调度员 B', role: '低电量回收', task: '南区回收低电量车 2 辆', status: '待出发' },
      ],
      chargingQueue: mappedScooters
        .filter((item) => item.battery < 45)
        .map((item) => ({ scooterId: item.id, battery: item.battery, targetStore: stores.find((store) => store.id === item.storeId)?.name || '', priority: item.battery < 30 ? '高' : '中' })),
      faults: mappedScooters
        .filter((item) => !item.helmet || item.status === 'maintenance')
        .map((item) => ({ scooterId: item.id, issue: item.helmet ? '待检修' : '头盔缺失', status: '待处理' })),
      usage: {
        activeUsers: users.length,
        availableScooters: mappedScooters.filter((item) => item.status === 'available').length,
        totalMinutes: mappedBookings.reduce((sum, item) => sum + Number(item.minutes || 0), 0),
        activeOrders: mappedBookings.filter((item) => item.status === 'ongoing').length,
      },
      finance: {
        revenue: Number(revenue.toFixed(2)),
        paidRevenue: Number(revenue.toFixed(2)),
        unpaid: mappedBookings.filter((item) => !item.paymentMethod).length,
        returned: mappedBookings.filter((item) => item.status === 'returned').length,
      },
    })
  } catch (error) {
    return next(error)
  }
})

router.delete('/users/:account', async (req, res, next) => {
  try {
    const account = String(req.params.account || '').trim()
    if (!account) return res.status(400).json({ message: 'Account is required' })

    const result = await transaction(async (connection) => {
      const [[user]] = await connection.execute('SELECT id, role FROM users WHERE account = ? LIMIT 1', [account])
      if (!user) return { deleted: false, status: 404 }
      if (user.role !== 'customer') return { deleted: false, status: 403 }

      await connection.execute('UPDATE issues SET user_id = NULL WHERE user_id = ?', [user.id])
      await connection.execute('DELETE FROM bookings WHERE user_id = ?', [user.id])
      await connection.execute('DELETE FROM users WHERE id = ?', [user.id])
      return { deleted: true, status: 200 }
    })

    if (!result.deleted && result.status === 404) return res.status(404).json({ message: 'User not found' })
    if (!result.deleted && result.status === 403) return res.status(403).json({ message: 'Only customer users can be deleted' })
    return res.json({ ok: true })
  } catch (error) {
    return next(error)
  }
})

export default router
