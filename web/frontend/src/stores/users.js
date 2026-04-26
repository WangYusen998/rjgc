import { defineStore } from 'pinia'
import { httpRequest } from '@/api/http'

export const useUserStore = defineStore('users', {
  state: () => ({
    records: [],
  }),
  getters: {
    activeUsers: (state) => state.records.filter((item) => item.status === 'active'),
    admins: (state) => state.records.filter((item) => item.role === 'admin'),
  },
  actions: {
    async hydrate() {
      this.records = await httpRequest('/admin/users')
    },
    async setStatus(userId, status) {
      this.records = await httpRequest(`/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      })
    },
  },
})
