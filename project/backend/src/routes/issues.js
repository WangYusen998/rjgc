import express from 'express'
import { query } from '../config/db.js'

const router = express.Router()

function normalizePriority(priority, fallback = 'medium') {
  const map = {
    low: 'low',
    medium: 'medium',
    high: 'high',
    低: 'low',
    中: 'medium',
    高: 'high',
  }
  const value = map[String(priority ?? '').trim().toLowerCase()]
  return value || fallback
}

function rowToIssue(row) {
  return {
    id: row.code,
    scooterId: row.scooter_code || '',
    type: row.type,
    message: row.message,
    priority: row.priority,
    status: row.status,
    account: row.account,
    createdAt: row.created_at_text,
  }
}

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      `SELECT i.*, DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i') AS created_at_text, u.account, s.code AS scooter_code
       FROM issues i
       LEFT JOIN users u ON u.id = i.user_id
       LEFT JOIN scooters s ON s.id = i.scooter_id
       ORDER BY i.created_at DESC`,
    )
    return res.json(rows.map(rowToIssue))
  } catch (error) {
    return next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { account = 'guest', scooterId = '', type = '其他', message = '', priority = '中' } = req.body
    const normalizedPriority = normalizePriority(priority)
    const users = await query('SELECT id FROM users WHERE account = ? LIMIT 1', [account])
    const scooters = scooterId ? await query('SELECT id FROM scooters WHERE code = ? LIMIT 1', [scooterId]) : []
    const code = `ISS${Date.now().toString().slice(-8)}`
    await query(
      'INSERT INTO issues (code, user_id, scooter_id, type, message, priority, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [code, users[0]?.id || 2, scooters[0]?.id || null, type, message, normalizedPriority, '待处理'],
    )
    const rows = await query(
      `SELECT i.*, DATE_FORMAT(i.created_at, '%Y-%m-%d %H:%i') AS created_at_text, u.account, s.code AS scooter_code
       FROM issues i
       LEFT JOIN users u ON u.id = i.user_id
       LEFT JOIN scooters s ON s.id = i.scooter_id
       WHERE i.code = ? LIMIT 1`,
      [code],
    )
    return res.status(201).json(rowToIssue(rows[0]))
  } catch (error) {
    return next(error)
  }
})

router.patch('/:code', async (req, res, next) => {
  try {
    const patch = req.body || {}
    const priority = patch.priority == null ? null : normalizePriority(patch.priority, null)
    if (patch.priority != null && priority == null) {
      return res.status(400).json({ message: '优先级必须是 high、medium、low 或 高、中、低' })
    }
    await query('UPDATE issues SET priority = COALESCE(?, priority), status = COALESCE(?, status) WHERE code = ?', [
      priority,
      patch.status ?? null,
      req.params.code,
    ])
    return res.json({ ok: true })
  } catch (error) {
    return next(error)
  }
})

export default router
