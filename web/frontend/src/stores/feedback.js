import { defineStore } from 'pinia'
import { httpRequest } from '@/api/http'
import { useNotificationStore } from '@/stores/notifications'

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    issues: [],
  }),
  getters: {
    highPriorityIssues: (state) => state.issues.filter((item) => item.priority === 'high' && item.status === 'open'),
  },
  actions: {
    async hydrate() {
      this.issues = await httpRequest('/issues')
    },

    async addIssue(payload) {
      const notifications = useNotificationStore()
      this.issues = await httpRequest('/issues', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
      notifications.push('Issue report submitted successfully.', 'info')
    },

    async resolveIssue(id) {
      this.issues = await httpRequest(`/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'resolved' }),
      })
      const notifications = useNotificationStore()
      notifications.push(`Issue ${id} marked resolved.`, 'success')
    },

    async markHighPriority(id) {
      this.issues = await httpRequest(`/issues/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ priority: 'high' }),
      })
    },
  },
})
