import { ApiError } from '@/utils/apiError'

const STORAGE_KEY = 'swiftride.demo.state.v2'
const DAY_IN_SECONDS = 24 * 60 * 60

const hireCatalog = {
  '1h': { label: '1 Hour', multiplier: 1 },
  '4h': { label: '4 Hours', multiplier: 3 },
  '1d': { label: '1 Day', multiplier: 6.25 },
  '1w': { label: '1 Week', multiplier: 27.5 },
}

const defaultState = {
  users: [
    {
      id: 'USR-ADMIN',
      name: 'Admin',
      email: 'admin@swiftride.com',
      password: 'admin123',
      role: 'admin',
      status: 'active',
      phone: '+44 20 7000 1000',
      createdAt: '2026-03-01T09:00:00.000Z',
      lastLoginAt: '2026-04-11T08:30:00.000Z',
    },
    {
      id: 'USR-1001',
      name: 'Alice Carter',
      email: 'alice@swiftride.com',
      password: 'alice123',
      role: 'customer',
      status: 'active',
      phone: '+44 20 7000 1001',
      createdAt: '2026-03-18T10:20:00.000Z',
      lastLoginAt: '2026-04-10T11:30:00.000Z',
    },
    {
      id: 'USR-1002',
      name: 'Ben Foster',
      email: 'ben@swiftride.com',
      password: 'ben12345',
      role: 'customer',
      status: 'active',
      phone: '+44 20 7000 1002',
      createdAt: '2026-03-22T15:45:00.000Z',
      lastLoginAt: '2026-04-08T09:05:00.000Z',
    },
    {
      id: 'USR-1003',
      name: 'Clara Singh',
      email: 'clara@swiftride.com',
      password: 'clara123',
      role: 'customer',
      status: 'suspended',
      phone: '+44 20 7000 1003',
      createdAt: '2026-03-25T08:10:00.000Z',
      lastLoginAt: '2026-04-02T14:10:00.000Z',
    },
  ],
  scooters: [
    { id: 'SC-101', location: 'Station A', available: false, hourlyCost: 4, imageUrl: '/scooter-placeholder.svg', battery: 86 },
    { id: 'SC-102', location: 'Station B', available: true, hourlyCost: 4, imageUrl: '/scooter-placeholder.svg', battery: 94 },
    { id: 'SC-103', location: 'Station C', available: false, hourlyCost: 5, imageUrl: '/scooter-placeholder.svg', battery: 31 },
    { id: 'SC-104', location: 'Station D', available: true, hourlyCost: 4, imageUrl: '/scooter-placeholder.svg', battery: 72 },
    { id: 'SC-105', location: 'Station E', available: true, hourlyCost: 4, imageUrl: '/scooter-placeholder.svg', battery: 68 },
    { id: 'SC-106', location: 'Station F', available: true, hourlyCost: 6, imageUrl: '/scooter-placeholder.svg', battery: 97 },
  ],
  bookings: [
    {
      id: 'BK-1001',
      scooterId: 'SC-101',
      userId: 'USR-1001',
      hireKey: '1h',
      hireLabel: '1 Hour',
      cost: 4,
      status: 'active',
      createdAt: '2026-04-10T09:00:00.000Z',
      route: 'Station A -> Campus Gate',
      pickupPoint: 'Station A',
      paymentLast4: '4242',
      notes: 'Helmet checked at pickup.',
      timeline: [
        { step: 'Created', time: '2026-04-10 09:00' },
        { step: 'Paid', time: '2026-04-10 09:01' },
        { step: 'Active', time: '2026-04-10 09:02' },
      ],
    },
    {
      id: 'BK-1002',
      scooterId: 'SC-104',
      userId: 'USR-1002',
      hireKey: '1d',
      hireLabel: '1 Day',
      cost: 25,
      status: 'completed',
      createdAt: '2026-04-08T13:00:00.000Z',
      route: 'Station D -> Riverside Park',
      pickupPoint: 'Station D',
      paymentLast4: '1133',
      notes: 'Completed without issues.',
      timeline: [
        { step: 'Created', time: '2026-04-08 13:00' },
        { step: 'Paid', time: '2026-04-08 13:01' },
        { step: 'Active', time: '2026-04-08 13:02' },
        { step: 'Completed', time: '2026-04-08 18:20' },
      ],
    },
    {
      id: 'BK-1003',
      scooterId: 'SC-103',
      userId: 'USR-1003',
      hireKey: '4h',
      hireLabel: '4 Hours',
      cost: 12,
      status: 'cancelled',
      createdAt: '2026-04-06T11:30:00.000Z',
      route: 'Station C -> Tech Park',
      pickupPoint: 'Station C',
      paymentLast4: '5599',
      notes: 'User cancelled before unlock.',
      timeline: [
        { step: 'Created', time: '2026-04-06 11:30' },
        { step: 'Paid', time: '2026-04-06 11:32' },
        { step: 'Cancelled', time: '2026-04-06 11:40' },
      ],
    },
  ],
  issues: [
    {
      id: 'IS-1',
      userId: 'USR-1001',
      user: 'Alice Carter',
      message: '[brake] [SC-101] Brake issue near Station B',
      priority: 'high',
      status: 'open',
      createdAt: '2026-04-09T10:25:00.000Z',
    },
    {
      id: 'IS-2',
      userId: 'USR-1002',
      user: 'Ben Foster',
      message: '[seat] [SC-104] Seat is loose',
      priority: 'low',
      status: 'open',
      createdAt: '2026-04-07T16:15:00.000Z',
    },
  ],
}

let memoryState = JSON.parse(JSON.stringify(defaultState))

function clone(value) {
  return JSON.parse(JSON.stringify(value))
}

function getStorage() {
  try {
    return typeof localStorage === 'undefined' ? null : localStorage
  } catch {
    return null
  }
}

function readState() {
  const storage = getStorage()
  if (!storage) return clone(memoryState)

  const raw = storage.getItem(STORAGE_KEY)
  if (!raw) {
    storage.setItem(STORAGE_KEY, JSON.stringify(defaultState))
    return clone(defaultState)
  }

  try {
    return JSON.parse(raw)
  } catch {
    storage.setItem(STORAGE_KEY, JSON.stringify(defaultState))
    return clone(defaultState)
  }
}

function writeState(state) {
  const next = clone(state)
  memoryState = next
  const storage = getStorage()
  if (storage) storage.setItem(STORAGE_KEY, JSON.stringify(next))
  return clone(next)
}

function updateState(mutator) {
  const state = readState()
  mutator(state)
  return writeState(state)
}

function formatDateTime(value = new Date().toISOString()) {
  const date = new Date(value)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function createToken(user) {
  const encode =
    typeof btoa === 'function'
      ? (value) => btoa(value)
      : (value) => Buffer.from(value, 'utf-8').toString('base64')

  const header = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
  const payload = encode(
    JSON.stringify({
      sub: user.id,
      role: user.role,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 7 * DAY_IN_SECONDS,
    }),
  )
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')

  return `${header}.${payload}.demo-signature`
}

function buildUserView(user, state) {
  const bookings = state.bookings.filter((item) => item.userId === user.id)
  const activeBookings = bookings.filter((item) => item.status === 'active').length
  const completedBookings = bookings.filter((item) => item.status === 'completed').length
  const totalSpent = bookings
    .filter((item) => item.status !== 'cancelled')
    .reduce((sum, item) => sum + Number(item.cost || 0), 0)

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    phone: user.phone,
    createdAt: user.createdAt,
    lastLoginAt: user.lastLoginAt,
    totalBookings: bookings.length,
    activeBookings,
    completedBookings,
    totalSpent,
  }
}

function buildBookingView(booking, state) {
  const user = state.users.find((item) => item.id === booking.userId)
  const scooter = state.scooters.find((item) => item.id === booking.scooterId)

  return {
    ...booking,
    userName: user?.name || 'Unknown User',
    userEmail: user?.email || 'n/a',
    userRole: user?.role || 'customer',
    scooterLocation: scooter?.location || 'Unknown',
    scooterRate: scooter?.hourlyCost || 0,
  }
}

function getHireMeta(hireKey, scooterRate = 4) {
  const item = hireCatalog[hireKey] || hireCatalog['1h']
  return {
    label: item.label,
    price: Number((scooterRate * item.multiplier).toFixed(2)),
  }
}

function requireUser(user) {
  if (!user?.id) {
    throw new ApiError('Please login to continue.', { status: 401, code: 'NOT_AUTHENTICATED' })
  }
}

export function resetDemoData() {
  writeState(defaultState)
}

export async function registerDemoUser(payload) {
  const name = String(payload?.name || '').trim()
  const email = String(payload?.email || '').trim().toLowerCase()
  const password = String(payload?.password || '')
  const cardNumber = String(payload?.cardNumber || '').replace(/\s+/g, '')
  const billingPostcode = String(payload?.billingPostcode || '').trim().toUpperCase()

  if (!name || !email || !password) {
    throw new ApiError('Name, email and password are required.', { status: 400, code: 'INVALID_REGISTER' })
  }

  const nextState = updateState((state) => {
    if (state.users.some((item) => item.email.toLowerCase() === email)) {
      throw new ApiError('This email is already registered.', { status: 409, code: 'EMAIL_EXISTS' })
    }

    state.users.unshift({
      id: `USR-${Date.now()}`,
      name,
      email,
      password,
      role: 'customer',
      status: 'active',
      phone: '',
      cardLast4: cardNumber.slice(-4),
      billingPostcode,
      createdAt: new Date().toISOString(),
      lastLoginAt: '',
    })
  })

  const created = nextState.users[0]
  return { user: buildUserView(created, nextState) }
}

export async function loginDemoUser(payload) {
  const email = String(payload?.email || '').trim().toLowerCase()
  const password = String(payload?.password || '')
  const state = readState()
  const user = state.users.find((item) => item.email.toLowerCase() === email)

  if (!user || user.password !== password) {
    throw new ApiError('Email or password is incorrect.', { status: 401, code: 'INVALID_LOGIN' })
  }

  if (user.status === 'suspended') {
    throw new ApiError('This demo account is suspended.', { status: 403, code: 'ACCOUNT_SUSPENDED' })
  }

  const nextState = updateState((draft) => {
    const target = draft.users.find((item) => item.id === user.id)
    if (target) target.lastLoginAt = new Date().toISOString()
  })
  const updatedUser = nextState.users.find((item) => item.id === user.id) || user

  return {
    token: createToken(updatedUser),
    user: buildUserView(updatedUser, nextState),
  }
}

export function listDemoUsers() {
  const state = readState()
  return state.users
    .map((item) => buildUserView(item, state))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

export function updateDemoUserStatus(userId, status) {
  const nextState = updateState((state) => {
    const user = state.users.find((item) => item.id === userId)
    if (!user) {
      throw new ApiError('User record not found.', { status: 404, code: 'USER_NOT_FOUND' })
    }
    if (user.role === 'admin') return
    user.status = status
  })
  return nextState.users.map((item) => buildUserView(item, nextState))
}

export function listDemoScooters() {
  return readState().scooters.sort((a, b) => a.id.localeCompare(b.id))
}

export function addDemoScooter(payload) {
  const id = String(payload?.id || '').trim().toUpperCase()
  const location = String(payload?.location || '').trim()
  const hourlyCost = Number(payload?.hourlyCost || 4)
  const imageUrl = String(payload?.imageUrl || '').trim() || '/scooter-placeholder.svg'
  const battery = Number(payload?.battery || 100)

  const nextState = updateState((state) => {
    if (!id || !location) {
      throw new ApiError('Scooter ID and location are required.', { status: 400, code: 'INVALID_SCOOTER' })
    }
    if (state.scooters.some((item) => item.id === id)) {
      throw new ApiError('Scooter ID already exists.', { status: 409, code: 'SCOOTER_EXISTS' })
    }
    state.scooters.unshift({
      id,
      location,
      available: payload?.available ?? true,
      hourlyCost,
      imageUrl,
      battery: Math.max(0, Math.min(100, battery)),
    })
  })

  return nextState.scooters
}

export function updateDemoScooter(scooterId, changes = {}) {
  const nextState = updateState((state) => {
    const scooter = state.scooters.find((item) => item.id === scooterId)
    if (!scooter) {
      throw new ApiError('Scooter record not found.', { status: 404, code: 'SCOOTER_NOT_FOUND' })
    }

    if (typeof changes.location === 'string') scooter.location = changes.location.trim() || scooter.location
    if (typeof changes.available === 'boolean') scooter.available = changes.available
    if (typeof changes.hourlyCost === 'number' && !Number.isNaN(changes.hourlyCost)) scooter.hourlyCost = changes.hourlyCost
    if (typeof changes.imageUrl === 'string') scooter.imageUrl = changes.imageUrl || '/scooter-placeholder.svg'
    if (typeof changes.battery === 'number' && !Number.isNaN(changes.battery)) {
      scooter.battery = Math.max(0, Math.min(100, changes.battery))
    }
  })

  return nextState.scooters
}

export function removeDemoScooter(scooterId) {
  const nextState = updateState((state) => {
    const activeBooking = state.bookings.find((item) => item.scooterId === scooterId && item.status === 'active')
    if (activeBooking) {
      throw new ApiError('Cannot delete a scooter with an active booking.', { status: 409, code: 'ACTIVE_BOOKING_EXISTS' })
    }
    state.scooters = state.scooters.filter((item) => item.id !== scooterId)
  })

  return nextState.scooters
}

export async function createDemoBooking(payload, currentUser) {
  requireUser(currentUser)

  const scooterId = String(payload?.scooterId || '').trim()
  const hireKey = String(payload?.hireKey || '').trim()
  const nextState = updateState((state) => {
    const scooter = state.scooters.find((item) => item.id === scooterId)
    if (!scooter) {
      throw new ApiError('Scooter not found.', { status: 404, code: 'SCOOTER_NOT_FOUND' })
    }
    if (!scooter.available) {
      throw new ApiError('Scooter is not available.', { status: 409, code: 'SCOOTER_UNAVAILABLE' })
    }

    const hireMeta = getHireMeta(hireKey, scooter.hourlyCost)
    const bookingId = `BK-${Date.now()}`
    scooter.available = false

    state.bookings.unshift({
      id: bookingId,
      scooterId,
      userId: currentUser.id,
      hireKey,
      hireLabel: hireMeta.label,
      cost: hireMeta.price,
      status: 'pending',
      createdAt: new Date().toISOString(),
      route: `${scooter.location} -> City Center`,
      pickupPoint: scooter.location,
      paymentLast4: '',
      notes: 'Awaiting payment confirmation.',
      timeline: [{ step: 'Created', time: formatDateTime() }],
    })
  })

  return { id: nextState.bookings[0].id }
}

export async function payDemoBooking(bookingId, payload, currentUser) {
  requireUser(currentUser)

  const last4 = String(payload?.cardNumber || '').replace(/\s+/g, '').slice(-4).padStart(4, '*')
  const nextState = updateState((state) => {
    const booking = state.bookings.find((item) => item.id === bookingId)
    if (!booking) {
      throw new ApiError('Booking not found.', { status: 404, code: 'BOOKING_NOT_FOUND' })
    }
    if (currentUser.role !== 'admin' && booking.userId !== currentUser.id) {
      throw new ApiError('You do not have permission to pay this booking.', { status: 403, code: 'FORBIDDEN_BOOKING' })
    }
    if (booking.status !== 'pending') {
      throw new ApiError('Booking is not payable.', { status: 409, code: 'BOOKING_NOT_PAYABLE' })
    }

    booking.status = 'active'
    booking.paymentLast4 = last4
    booking.notes = 'Payment confirmed in frontend demo mode.'
    booking.timeline.push({ step: 'Paid', time: formatDateTime() })
    booking.timeline.push({ step: 'Active', time: formatDateTime() })
  })

  return {
    ok: true,
    bookingId,
    booking: buildBookingView(nextState.bookings.find((item) => item.id === bookingId), nextState),
  }
}

export function listDemoBookings(currentUser) {
  const state = readState()
  const bookings =
    currentUser?.role === 'admin'
      ? state.bookings
      : state.bookings.filter((item) => item.userId === currentUser?.id)

  return bookings
    .map((item) => buildBookingView(item, state))
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

export function getDemoBookingById(bookingId, currentUser) {
  const state = readState()
  const booking = state.bookings.find((item) => item.id === bookingId)
  if (!booking) {
    throw new ApiError('Booking not found.', { status: 404, code: 'BOOKING_NOT_FOUND' })
  }
  if (currentUser?.role !== 'admin' && booking.userId !== currentUser?.id) {
    throw new ApiError('You do not have permission to view this booking.', { status: 403, code: 'FORBIDDEN_BOOKING' })
  }
  return buildBookingView(booking, state)
}

export function cancelDemoBooking(bookingId, currentUser) {
  requireUser(currentUser)
  const nextState = updateState((state) => {
    const booking = state.bookings.find((item) => item.id === bookingId)
    if (!booking) {
      throw new ApiError('Booking not found.', { status: 404, code: 'BOOKING_NOT_FOUND' })
    }
    if (currentUser.role !== 'admin' && booking.userId !== currentUser.id) {
      throw new ApiError('You do not have permission to cancel this booking.', { status: 403, code: 'FORBIDDEN_BOOKING' })
    }
    if (!['active', 'pending'].includes(booking.status)) {
      throw new ApiError('Only active or pending bookings can be cancelled.', { status: 409, code: 'BOOKING_NOT_CANCELLABLE' })
    }

    booking.status = 'cancelled'
    booking.notes = 'Cancelled in frontend demo mode.'
    booking.timeline.push({ step: 'Cancelled', time: formatDateTime() })

    const scooter = state.scooters.find((item) => item.id === booking.scooterId)
    if (scooter) scooter.available = true
  })

  return listDemoBookings(currentUser)
}

export function extendDemoBooking(bookingId, currentUser) {
  requireUser(currentUser)
  const nextState = updateState((state) => {
    const booking = state.bookings.find((item) => item.id === bookingId)
    if (!booking) {
      throw new ApiError('Booking not found.', { status: 404, code: 'BOOKING_NOT_FOUND' })
    }
    if (currentUser.role !== 'admin' && booking.userId !== currentUser.id) {
      throw new ApiError('You do not have permission to extend this booking.', { status: 403, code: 'FORBIDDEN_BOOKING' })
    }
    if (booking.status !== 'active') {
      throw new ApiError('Only active bookings can be extended.', { status: 409, code: 'BOOKING_NOT_EXTENDABLE' })
    }

    const scooter = state.scooters.find((item) => item.id === booking.scooterId)
    const extraCharge = scooter?.hourlyCost || 4
    booking.cost = Number((booking.cost + extraCharge).toFixed(2))
    booking.hireLabel = `${booking.hireLabel} +1h`
    booking.notes = 'Extended by one hour in frontend demo mode.'
    booking.timeline.push({ step: 'Extended +1h', time: formatDateTime() })
  })

  return listDemoBookings(currentUser)
}

export function listDemoIssues(currentUser) {
  const state = readState()
  const issues =
    currentUser?.role === 'admin'
      ? state.issues
      : state.issues.filter((item) => item.userId === currentUser?.id)

  return issues.sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
}

export function addDemoIssue(payload, currentUser) {
  requireUser(currentUser)
  const message = String(payload?.message || '').trim()
  if (!message) {
    throw new ApiError('Issue message is required.', { status: 400, code: 'INVALID_ISSUE' })
  }

  const nextState = updateState((state) => {
    state.issues.unshift({
      id: `IS-${Date.now()}`,
      userId: currentUser.id,
      user: currentUser.name,
      message,
      priority: payload?.priority || 'low',
      status: 'open',
      createdAt: new Date().toISOString(),
    })
  })

  return nextState.issues
}

export function resolveDemoIssue(issueId) {
  const nextState = updateState((state) => {
    const issue = state.issues.find((item) => item.id === issueId)
    if (!issue) {
      throw new ApiError('Issue not found.', { status: 404, code: 'ISSUE_NOT_FOUND' })
    }
    issue.status = 'resolved'
  })

  return nextState.issues
}

export function markDemoIssueHigh(issueId) {
  const nextState = updateState((state) => {
    const issue = state.issues.find((item) => item.id === issueId)
    if (!issue) {
      throw new ApiError('Issue not found.', { status: 404, code: 'ISSUE_NOT_FOUND' })
    }
    issue.priority = 'high'
  })

  return nextState.issues
}

export function getDemoRevenueSummary() {
  const state = readState()
  const paidBookings = state.bookings.filter((item) => ['active', 'completed'].includes(item.status))
  const incomeByPlanMap = new Map()
  const incomeByDayMap = new Map()

  for (const booking of paidBookings) {
    incomeByPlanMap.set(booking.hireKey, Number((incomeByPlanMap.get(booking.hireKey) || 0) + Number(booking.cost || 0)))

    const date = new Date(booking.createdAt)
    const day = date.toLocaleDateString('en-GB', { weekday: 'short' })
    incomeByDayMap.set(day, Number((incomeByDayMap.get(day) || 0) + Number(booking.cost || 0)))
  }

  const weeklyIncomeByPlan = Object.keys(hireCatalog).map((key) => ({
    plan: key,
    value: Number((incomeByPlanMap.get(key) || 0).toFixed(2)),
  }))

  const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  const dailyIncome = weekdays.map((day) => ({
    day,
    value: Number((incomeByDayMap.get(day) || 0).toFixed(2)),
  }))

  return {
    weeklyIncomeByPlan,
    dailyIncome,
    weeklyTotal: Number(dailyIncome.reduce((sum, item) => sum + item.value, 0).toFixed(2)),
  }
}
