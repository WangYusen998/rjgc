export function parseJwtPayload(token = '') {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const normalized = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const decodeBase64 =
      typeof atob === 'function'
        ? atob
        : (value) => Buffer.from(value, 'base64').toString('utf-8')
    const decoded = decodeBase64(normalized)
    return JSON.parse(decoded)
  } catch {
    return null
  }
}

export function isTokenExpired(token = '') {
  if (!token) return true
  const payload = parseJwtPayload(token)
  if (!payload || typeof payload.exp !== 'number') return false
  const now = Math.floor(Date.now() / 1000)
  return payload.exp <= now
}
