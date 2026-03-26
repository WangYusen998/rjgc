import { defineStore } from 'pinia'
import { authApi } from '@/api/authApi'
import { isTokenExpired } from '@/utils/session'

const TOKEN_KEY = 'sf_token'
const USER_KEY = 'sf_user'

function readUser() {
  const raw = localStorage.getItem(USER_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: readUser(),
    token: localStorage.getItem(TOKEN_KEY) || '',
  }),
  actions: {
    ensureValidSession() {
      if (!this.token) return true
      if (isTokenExpired(this.token)) {
        this.logout()
        return false
      }
      return true
    },

    async register(payload) {
      const response = await authApi.register(payload)
      this.user = response.user
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
    },

    async login(payload) {
      const response = await authApi.login(payload)
      this.token = response.token
      this.user = response.user
      localStorage.setItem(TOKEN_KEY, this.token)
      localStorage.setItem(USER_KEY, JSON.stringify(this.user))
    },

    logout() {
      this.user = null
      this.token = ''
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_KEY)
    },
  },
})
