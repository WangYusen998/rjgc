import { defineStore } from 'pinia'
import { httpRequest } from '@/api/http'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    weeklyIncomeByPlan: [],
    dailyIncome: [],
  }),
  getters: {
    weeklyTotal: (state) => state.dailyIncome.reduce((acc, item) => acc + item.value, 0),
  },
  actions: {
    async hydrate() {
      const summary = await httpRequest('/admin/income')
      this.weeklyIncomeByPlan = summary.weeklyIncomeByPlan || []
      this.dailyIncome = summary.dailyIncome || []
    },
  },
})
