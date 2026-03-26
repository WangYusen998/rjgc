export class ApiError extends Error {
  constructor(message, { status = 0, code = 'API_ERROR', details = null } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.details = details
  }
}

export function mapApiErrorMessage(status, fallbackMessage = '') {
  if (status === 401) return 'Email or password is incorrect.'
  if (status === 403) return 'You do not have permission to perform this action.'
  if (status === 404) return 'Requested resource was not found.'
  if (status === 409) return 'This data already exists or conflicts with current state.'
  if (status >= 500) return 'Server error. Please try again later.'
  if (fallbackMessage) return fallbackMessage
  return 'Request failed. Please try again.'
}

