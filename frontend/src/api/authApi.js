import { httpRequest } from './http'

export const authApi = {
  register(payload) {
    return httpRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  login(payload) {
    return httpRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
}
