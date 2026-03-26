import { Router } from 'express'
import { query } from '../config/db.js'

const router = Router()

router.get('/', async (_req, res) => {
  const rows = await query(
    'SELECT id, code, location, available, image_url AS imageUrl, hourly_cost AS hourlyCost FROM scooters ORDER BY code ASC',
  )

  const payload = rows.map((item) => ({
    id: item.code,
    location: item.location,
    available: Boolean(item.available),
    imageUrl: item.imageUrl || '/scooter-placeholder.svg',
    hourlyCost: Number(item.hourlyCost),
  }))

  return res.json(payload)
})

export default router
