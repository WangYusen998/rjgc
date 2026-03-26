import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    items: [],
  }),
  getters: {
    unreadCount: (state) => state.items.filter((item) => !item.read).length,
  },
  actions: {
    push(message, type = 'info') {
      this.items.unshift({
        id: `NT-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        message,
        type,
        read: false,
        createdAt: new Date().toLocaleTimeString(),
      })
      this.items = this.items.slice(0, 20)
    },
    markAllRead() {
      this.items = this.items.map((item) => ({ ...item, read: true }))
    },
    remove(id) {
      this.items = this.items.filter((item) => item.id !== id)
    },
  },
})

