import { Router } from 'express'
import { query } from '../config/db.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()

function mapIssue(row) {
  return {
    id: row.code,
    userId: `USR-${row.user_id}`,
    user: row.userName,
    message: row.message,
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at,
  }
}

router.use(authRequired)

router.get('/', async (req, res) => {
  const where = req.user.role === 'admin' ? '' : 'WHERE i.user_id = ?'
  const params = req.user.role === 'admin' ? [] : [req.user.id]
  const rows = await query(
    `SELECT i.code, i.user_id, u.name AS userName, i.message, i.priority, i.status, i.created_at
     FROM issues i
     JOIN users u ON i.user_id = u.id
     ${where}
     ORDER BY i.created_at DESC`,
    params,
  )
  return res.json(rows.map(mapIssue))
})

router.post('/', async (req, res) => {
  const message = String(req.body?.message || '').trim()
  if (!message) return res.status(400).json({ message: 'Issue message is required' })

  await query(
    'INSERT INTO issues (code, user_id, message, priority, status) VALUES (?, ?, ?, ?, ?)',
    [`IS-${Date.now()}`, req.user.id, message, req.body?.priority || 'low', 'open'],
  )

  const rows = await query(
    `SELECT i.code, i.user_id, u.name AS userName, i.message, i.priority, i.status, i.created_at
     FROM issues i
     JOIN users u ON i.user_id = u.id
     WHERE i.user_id = ?
     ORDER BY i.created_at DESC`,
    [req.user.id],
  )
  return res.status(201).json(rows.map(mapIssue))
})

router.patch('/:issueId', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' })

  const changes = []
  const params = []
  if (req.body?.priority) {
    changes.push('priority = ?')
    params.push(req.body.priority)
  }
  if (req.body?.status) {
    changes.push('status = ?')
    params.push(req.body.status)
  }

  if (changes.length > 0) {
    params.push(req.params.issueId)
    await query(`UPDATE issues SET ${changes.join(', ')} WHERE code = ?`, params)
  }

  const rows = await query(
    `SELECT i.code, i.user_id, u.name AS userName, i.message, i.priority, i.status, i.created_at
     FROM issues i
     JOIN users u ON i.user_id = u.id
     ORDER BY i.created_at DESC`,
  )
  return res.json(rows.map(mapIssue))
})

export default router
