import { defineStore } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'
import { addDemoIssue, listDemoIssues, markDemoIssueHigh, resolveDemoIssue } from '@/services/demoData'

export const useFeedbackStore = defineStore('feedback', {
  state: () => ({
    issues: [],
  }),
  getters: {
    highPriorityIssues: (state) => state.issues.filter((item) => item.priority === 'high' && item.status === 'open'),
  },
  actions: {
    hydrate() {
      this.issues = listDemoIssues(useAuthStore().user)
    },

    addIssue(payload) {
      const notifications = useNotificationStore()
      addDemoIssue(payload, useAuthStore().user)
      this.hydrate()
      notifications.push('Issue report submitted successfully.', 'info')
    },

    resolveIssue(id) {
      resolveDemoIssue(id)
      this.hydrate()
      const notifications = useNotificationStore()
      notifications.push(`Issue ${id} marked resolved.`, 'success')
    },

    markHighPriority(id) {
      markDemoIssueHigh(id)
      this.hydrate()
    },
  },
})
