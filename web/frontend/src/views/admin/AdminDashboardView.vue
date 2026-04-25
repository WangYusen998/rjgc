<script setup>
import { computed, onMounted, ref } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { useFeedbackStore } from '@/stores/feedback'
import { useAnalyticsStore } from '@/stores/analytics'

const booking = useBookingStore()
const feedback = useFeedbackStore()
const analytics = useAnalyticsStore()
const range = ref('week')

onMounted(async () => {
  await booking.hydrateScooters()
  await booking.hydrateBookings()
  feedback.hydrate()
  analytics.hydrate()
})

const stats = computed(() => ({
  fleet: booking.scooters.length,
  active: booking.bookings.filter((b) => b.status === 'active').length,
  openIssues: feedback.issues.filter((i) => i.status === 'open').length,
  weekly: analytics.weeklyTotal,
}))
const fleetMix = computed(() => booking.scooters.slice(0, 4))
const priorityIssues = computed(() => feedback.issues.slice(0, 3))
</script>

<template>
  <section class="admin-page">
    <header class="head">
      <div>
        <span class="eyebrow">Live overview</span>
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
      <article class="card metric-card"><span>Fleet Size</span><strong>{{ stats.fleet }}</strong><small>Total scooters onboarded</small></article>
      <article class="card metric-card"><span>Active Rides</span><strong>{{ stats.active }}</strong><small>Currently unlocked rides</small></article>
      <article class="card metric-card"><span>Open Issues</span><strong>{{ stats.openIssues }}</strong><small>Items waiting for action</small></article>
      <article class="card metric-card"><span>Weekly Revenue</span><strong>GBP {{ stats.weekly }}</strong><small>Demo analytics figure</small></article>
    </div>

    <section class="insight-grid">
      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Fleet snapshot</span>
            <h2>Vehicles ready for dispatch</h2>
          </div>
          <span class="chip">{{ range }}</span>
        </div>
        <div class="fleet-list">
          <div v-for="item in fleetMix" :key="item.id" class="fleet-row">
            <img :src="item.imageUrl" :alt="item.modelName" />
            <div>
              <strong>{{ item.modelName }}</strong>
              <p>{{ item.location }} · {{ item.battery }}% battery</p>
            </div>
            <span :class="['status-pill', item.available ? 'ready' : 'busy']">{{ item.available ? 'Ready' : 'In use' }}</span>
          </div>
        </div>
      </article>

      <article class="panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">Issue queue</span>
            <h2>Priority items</h2>
          </div>
        </div>
        <div class="issue-list">
          <div v-for="item in priorityIssues" :key="item.id" class="issue-row">
            <strong>{{ item.id }}</strong>
            <p>{{ item.message }}</p>
            <span class="issue-meta">{{ item.priority }} priority · {{ item.status }}</span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.admin-page { display: grid; gap: 14px; }
.head,
.panel,
.card {
  border: 1px solid rgba(146,170,214,.3);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(14,29,54,.78), rgba(10,23,43,.72));
  box-shadow: 0 18px 34px rgba(2, 10, 23, 0.18);
}
.head { padding: 18px; display: flex; justify-content: space-between; align-items: center; gap: 10px; }
.eyebrow { display: inline-block; color: #7cb6ff; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
h1 { margin: 0; }
.head p { margin: 6px 0 0; color: #9fb3d1; }
.range-select { min-width: 140px; border: 1px solid rgba(146,170,214,.35); border-radius: 12px; padding: 10px 12px; background: rgba(6,19,40,.65); color: #e2e8f0; }
.grid-4 { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.card { padding: 16px; }
.card span { color: #9fb3d1; font-size: 13px; }
.card strong { display: block; margin-top: 4px; font-size: 26px; color: #fff; }
.card small { display: block; margin-top: 8px; color: #8aa3c8; }
.insight-grid { display: grid; gap: 14px; grid-template-columns: 1.15fr .85fr; }
.panel { padding: 18px; }
.panel-head { display: flex; justify-content: space-between; align-items: start; gap: 10px; margin-bottom: 14px; }
.panel-head h2 { margin: 6px 0 0; font-size: 24px; font-family: "Space Grotesk", sans-serif; }
.chip { border-radius: 999px; background: rgba(124,182,255,.12); color: #cce3ff; padding: 7px 10px; font-size: 12px; font-weight: 800; text-transform: capitalize; }
.fleet-list, .issue-list { display: grid; gap: 12px; }
.fleet-row, .issue-row {
  border: 1px solid rgba(146,170,214,.2);
  border-radius: 16px;
  background: rgba(255,255,255,.04);
  padding: 12px;
}
.fleet-row { display: grid; grid-template-columns: 74px 1fr auto; align-items: center; gap: 12px; }
.fleet-row img { width: 74px; height: 74px; border-radius: 14px; object-fit: cover; background: #f3f8ff; }
.fleet-row strong, .issue-row strong { color: #fff; }
.fleet-row p, .issue-row p { margin: 4px 0 0; color: #9fb3d1; }
.status-pill {
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 800;
}
.status-pill.ready { background: rgba(34,197,94,.16); color: #a7f3d0; }
.status-pill.busy { background: rgba(244,114,182,.16); color: #fbcfe8; }
.issue-meta { display: inline-block; margin-top: 10px; color: #7cb6ff; font-size: 12px; font-weight: 800; text-transform: capitalize; }
@media (max-width: 1100px) {
  .grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .insight-grid { grid-template-columns: 1fr; }
}
@media (max-width: 680px) {
  .grid-4 { grid-template-columns: 1fr; }
  .head { flex-direction: column; align-items: flex-start; }
  .fleet-row { grid-template-columns: 1fr; }
}
</style>
