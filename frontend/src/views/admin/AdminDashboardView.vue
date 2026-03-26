<script setup>
import { computed, ref } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { useFeedbackStore } from '@/stores/feedback'
import { useAnalyticsStore } from '@/stores/analytics'

const booking = useBookingStore()
const feedback = useFeedbackStore()
const analytics = useAnalyticsStore()
const range = ref('week')

const stats = computed(() => ({
  fleet: booking.scooters.length,
  active: booking.bookings.filter((b) => b.status === 'active').length,
  openIssues: feedback.issues.filter((i) => i.status === 'open').length,
  weekly: analytics.weeklyTotal,
}))
</script>

<template>
  <section class="admin-page">
    <header class="head">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Operations overview for fleet, bookings and issue handling.</p>
      </div>
      <select v-model="range" class="range-select">
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </header>

    <div class="grid-4">
      <article class="card"><span>[FLEET] Fleet Size</span><strong>{{ stats.fleet }}</strong></article>
      <article class="card"><span>[RIDE] Active Rides</span><strong>{{ stats.active }}</strong></article>
      <article class="card"><span>[ISSUE] Open Issues</span><strong>{{ stats.openIssues }}</strong></article>
      <article class="card"><span>[GBP] Weekly Revenue</span><strong>GBP {{ stats.weekly }}</strong></article>
    </div>
  </section>
</template>

<style scoped>
.admin-page { display: grid; gap: 14px; }
.head { border: 1px solid rgba(146,170,214,.3); border-radius: 12px; background: rgba(17,35,68,.72); padding: 16px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
h1 { margin: 0; }
.head p { margin: 6px 0 0; color: #9fb3d1; }
.range-select { min-width: 140px; border: 1px solid rgba(146,170,214,.35); border-radius: 8px; padding: 8px 10px; background: rgba(6,19,40,.65); color: #e2e8f0; }
.grid-4 { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.card { border: 1px solid rgba(146,170,214,.3); border-radius: 12px; background: rgba(13,28,51,.7); padding: 14px; }
.card span { color: #9fb3d1; font-size: 13px; }
.card strong { display: block; margin-top: 4px; font-size: 26px; color: #fff; }
@media (max-width: 980px) { .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 680px) { .grid-4 { grid-template-columns: 1fr; } .head { flex-direction: column; align-items: flex-start; } }
</style>
