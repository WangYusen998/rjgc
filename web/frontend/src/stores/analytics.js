import { defineStore } from 'pinia'

export const useAnalyticsStore = defineStore('analytics', {
  state: () => ({
    weeklyIncomeByPlan: [
      { plan: '1h', value: 220 },
      { plan: '4h', value: 310 },
      { plan: '1d', value: 460 },
      { plan: '1w', value: 280 },
    ],
    dailyIncome: [
      { day: 'Mon', value: 150 },
      { day: 'Tue', value: 180 },
      { day: 'Wed', value: 210 },
      { day: 'Thu', value: 240 },
      { day: 'Fri', value: 260 },
      { day: 'Sat', value: 300 },
      { day: 'Sun', value: 270 },
    ],
  }),
  getters: {
    weeklyTotal: (state) => state.dailyIncome.reduce((acc, item) => acc + item.value, 0),
  },
})
