import { ApiError, mapApiErrorMessage } from '@/utils/apiError'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'

export async function httpRequest(path, options = {}) {
  const token = localStorage.getItem('sf_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  }

  if (token) headers.Authorization = `Bearer ${token}`

  let response
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })
  } catch (error) {
    throw new ApiError('Network unavailable. Please check your connection.', {
      status: 0,
      code: 'NETWORK_ERROR',
      details: error,
    })
  }

  if (!response.ok) {
    let body = null
    try {
      body = await response.json()
    } catch {
      body = null
    }

    const message = mapApiErrorMessage(response.status, body?.message || '')
    throw new ApiError(message, {
      status: response.status,
      code: `HTTP_${response.status}`,
      details: body,
    })
  }

  return response.json()
}
