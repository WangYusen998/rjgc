import { defineStore } from 'pinia'
import { listDemoUsers, updateDemoUserStatus } from '@/services/demoData'

export const useUserStore = defineStore('users', {
  state: () => ({
    records: [],
  }),
  getters: {
    activeUsers: (state) => state.records.filter((item) => item.status === 'active'),
    admins: (state) => state.records.filter((item) => item.role === 'admin'),
  },
  actions: {
    hydrate() {
      this.records = listDemoUsers()
    },
    setStatus(userId, status) {
      this.records = updateDemoUserStatus(userId, status)
    },
  },
})
