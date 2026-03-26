import { defineStore } from 'pinia'
import { useNotificationStore } from '@/stores/notifications'

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    issues: [
      { id: 'IS-1', user: 'alice', message: 'Brake issue near Station B', priority: 'high', status: 'open' },
      { id: 'IS-2', user: 'bob', message: 'Seat is loose', priority: 'low', status: 'open' },
    ],
  }),
  getters: {
    highPriorityIssues: (state) => state.issues.filter((item) => item.priority === 'high' && item.status === 'open'),
  },
  actions: {
    addIssue(payload) {
      const notifications = useNotificationStore()
      this.issues.unshift({
        id: `IS-${Date.now()}`,
        user: payload.user || 'customer',
        message: payload.message,
        priority: payload.priority || 'low',
        status: 'open',
      })
      notifications.push('Issue report submitted successfully.', 'info')
    },
    resolveIssue(id) {
      const issue = this.issues.find((item) => item.id === id)
      if (issue) issue.status = 'resolved'
      const notifications = useNotificationStore()
      notifications.push(`Issue ${id} marked resolved.`, 'success')
    },
    markHighPriority(id) {
      const issue = this.issues.find((item) => item.id === id)
      if (issue) issue.priority = 'high'
    },
  },
})
