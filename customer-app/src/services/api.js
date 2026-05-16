const DEFAULT_API_BASE = 'http://127.0.0.1:8080/api'

const API_BASE = (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE).replace(/\/$/, '')

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`
  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const message = data && data.message ? data.message : `HTTP ${response.status}`
    throw new Error(message)
  }

  return data
}

export function getStores() {
  return request('/stores')
}

export function getScooters() {
  return request('/scooters')
}

export function getScooter(id) {
  return request(`/scooters/${encodeURIComponent(id)}`)
}

export function getBookings(account = '') {
  const query = account ? `?account=${encodeURIComponent(account)}` : ''
  return request(`/bookings${query}`)
}

export function createBooking(payload) {
  return request('/bookings', { method: 'POST', body: payload })
}

export function updateBooking(id, payload) {
  return request(`/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', body: payload })
}

export function login(payload) {
  return request('/auth/login', { method: 'POST', body: payload })
}

export function register(payload) {
  return request('/auth/register', { method: 'POST', body: payload })
}

export function submitIssue(payload) {
  return request('/issues', { method: 'POST', body: payload })
}

export { API_BASE }
