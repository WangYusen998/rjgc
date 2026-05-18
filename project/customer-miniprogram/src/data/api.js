const API_BASE_KEY = 'swiftride_api_base'
const DEFAULT_API_BASE = import.meta.env.VITE_API_BASE_URL || (typeof window === 'undefined' ? 'http://127.0.0.1:8081/api' : `${window.location.origin}/api`)

export function getApiBase() {
  const saved = uni.getStorageSync(API_BASE_KEY)
  if (saved && typeof window !== 'undefined' && /^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\/api\/?$/.test(saved)) {
    const fixed = `${window.location.origin}/api`
    uni.setStorageSync(API_BASE_KEY, fixed)
    return fixed
  }
  return saved || DEFAULT_API_BASE
}

export function setApiBase(url) {
  uni.setStorageSync(API_BASE_KEY, url)
}

export function request(path, options = {}) {
  const url = `${getApiBase()}${path}`
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: options.method || 'GET',
      data: options.data || undefined,
      header: {
        'content-type': 'application/json',
        ...(options.header || {}),
      },
      timeout: options.timeout || 8000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        const message = res.data && res.data.message ? res.data.message : `HTTP ${res.statusCode}`
        reject(new Error(message))
      },
      fail: reject,
    })
  })
}

export async function fetchRemoteStores() {
  return request('/stores')
}

export async function fetchRemoteScooters() {
  return request('/scooters')
}

export async function fetchRemoteBookings(account = '') {
  const query = account ? `?account=${encodeURIComponent(account)}` : ''
  return request(`/bookings${query}`)
}

export async function createRemoteBooking(payload) {
  return request('/bookings', { method: 'POST', data: payload })
}

export async function updateRemoteBooking(id, patch) {
  return request(`/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', data: patch })
}

export async function updateRemoteScooter(id, patch) {
  return request(`/scooters/${encodeURIComponent(id)}`, { method: 'PATCH', data: patch })
}

export async function updateRemoteIssue(id, patch) {
  return request(`/issues/${encodeURIComponent(id)}`, { method: 'PATCH', data: patch })
}

export async function createRemoteIssue(payload) {
  return request('/issues', { method: 'POST', data: payload })
}

export async function fetchRemoteAdminDashboard() {
  return request('/admin/dashboard')
}

export async function remoteLogin(payload) {
  return request('/auth/login', { method: 'POST', data: payload })
}

export async function remoteRegister(payload) {
  return request('/auth/register', { method: 'POST', data: payload })
}

export async function syncLocalData(payload) {
  return request('/sync/local', { method: 'POST', data: payload, timeout: 15000 })
}
