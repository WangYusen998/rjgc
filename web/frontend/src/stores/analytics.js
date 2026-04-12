import { defineStore } from 'pinia'
import { getDemoRevenueSummary } from '@/services/demoData'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    weeklyIncomeByPlan: [],
    dailyIncome: [],
  }),
  getters: {
    weeklyTotal: (state) => state.dailyIncome.reduce((acc, item) => acc + item.value, 0),
  },
  actions: {
    hydrate() {
      const summary = getDemoRevenueSummary()
      this.weeklyIncomeByPlan = summary.weeklyIncomeByPlan
      this.dailyIncome = summary.dailyIncome
    },
  },
})
