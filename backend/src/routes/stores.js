import express from 'express'
import { query } from '../config/db.js'

const router = express.Router()

router.get('/', async (_req, res, next) => {
  try {
    const rows = await query(
      'SELECT id, name, address, latitude, longitude, open_hours AS open, available, rating FROM stores ORDER BY id',
    )
    return res.json(rows)
  } catch (error) {
    return next(error)
  }
})

export default router

