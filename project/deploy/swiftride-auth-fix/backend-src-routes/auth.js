import express from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../config/db.js'
import { signToken } from '../middleware/auth.js'

const router = express.Router()

function publicUser(row) {
  return {
    id: row.id,
    account: row.account,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    country: row.country,
    realNameVerified: Boolean(row.real_name_verified),
    identityNumber: row.identity_number,
    bankName: row.bank_name,
    bankCardLast4: row.bank_card_last4,
    cardLast4: row.card_last4,
    campus: row.campus,
  }
}

router.post('/login', async (req, res, next) => {
  try {
    const { account = '', password = '' } = req.body
    const rows = await query('SELECT * FROM users WHERE account = ? OR email = ? OR phone = ? LIMIT 1', [account, account, account])
    const user = rows[0]
    const passwordMatches = user && (user.password_hash === password || (await bcrypt.compare(password, user.password_hash)))
    if (!passwordMatches) {
      return res.status(401).json({ message: '账号或密码错误' })
    }
    await query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id])
    return res.json({ token: signToken(user), user: publicUser(user) })
  } catch (error) {
    return next(error)
  }
})

router.post('/register', async (req, res, next) => {
  try {
    const {
      account,
      password,
      name,
      phone,
      email,
      country = '中国',
      identityNumber = '',
      bankName = '',
      bankCardLast4 = '',
      cardLast4 = '',
      campus = '西南交通大学犀浦校区',
    } = req.body
    if (!account || !password || !name) return res.status(400).json({ message: '账号、姓名和密码必填' })
    if (country === '中国' && !identityNumber) return res.status(400).json({ message: '中国场景需要实名认证' })
    if (country === '英国' && !cardLast4) return res.status(400).json({ message: '英国场景需要绑定信用卡' })

    const passwordHash = await bcrypt.hash(password, 10)
    await query(
      `INSERT INTO users
       (account, password_hash, name, phone, email, role, country, real_name_verified, identity_number, bank_name, bank_card_last4, card_last4, campus)
       VALUES (?, ?, ?, ?, ?, 'customer', ?, ?, ?, ?, ?, ?, ?)`,
      [
        account,
        passwordHash,
        name,
        phone || '',
        email || '',
        country,
        country === '中国' ? 1 : 0,
        identityNumber,
        bankName,
        String(bankCardLast4 || '').slice(-4),
        String(cardLast4 || '').slice(-4),
        campus,
      ],
    )
    const rows = await query('SELECT * FROM users WHERE account = ? LIMIT 1', [account])
    return res.status(201).json({ token: signToken(rows[0]), user: publicUser(rows[0]) })
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: '账号或邮箱已存在' })
    return next(error)
  }
})

router.post('/recover', async (req, res, next) => {
  try {
    const { account = '', contact = '' } = req.body
    const rows = await query(
      'SELECT id, account, phone, email FROM users WHERE account = ? AND (phone = ? OR email = ?) LIMIT 1',
      [account, contact, contact],
    )
    return res.json({ ok: Boolean(rows.length), account: rows[0]?.account || '' })
  } catch (error) {
    return next(error)
  }
})

export default router
