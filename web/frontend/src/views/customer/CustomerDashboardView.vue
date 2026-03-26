<script setup>
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'
import { useFeedbackStore } from '@/stores/feedback'

const booking = useBookingStore()
const feedback = useFeedbackStore()

const stats = computed(() => ({
  totalScooters: booking.scooters.length,
  activeBookings: booking.bookings.filter((b) => b.status === 'active').length,
  openIssues: feedback.issues.filter((i) => i.status === 'open').length,
  totalSpent: booking.bookings.reduce((sum, b) => sum + b.cost, 0),
}))
</script>

<template>
  <section class="page-wrap">
    <header class="page-head">
      <h1>Customer Dashboard</h1>
      <p>Overview of your rides, bookings and support activity.</p>
    </header>

    <div class="grid-4">
      <article class="stat"><span>Total Scooters</span><strong>{{ stats.totalScooters }}</strong></article>
      <article class="stat"><span>Active Bookings</span><strong>{{ stats.activeBookings }}</strong></article>
      <article class="stat"><span>Open Issues</span><strong>{{ stats.openIssues }}</strong></article>
      <article class="stat"><span>Total Booking Cost</span><strong>GBP {{ stats.totalSpent }}</strong></article>
    </div>

    <div class="quick-grid">
      <RouterLink to="/customer/scooters" class="quick-card"><h3>Scooters</h3><p>Browse nearby scooters</p></RouterLink>
      <RouterLink to="/customer/booking" class="quick-card"><h3>Book Ride</h3><p>Create new booking</p></RouterLink>
      <RouterLink to="/customer/history" class="quick-card"><h3>My Bookings</h3><p>Manage ongoing rides</p></RouterLink>
      <RouterLink to="/customer/feedback" class="quick-card"><h3>Feedback</h3><p>Report faults quickly</p></RouterLink>
    </div>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.page-head { border: 1px solid #d8e2ef; border-radius: 12px; background: #fff; padding: 16px; }
h1 { margin: 0; font-size: 30px; font-family: "Space Grotesk", sans-serif; }
.page-head p { margin: 6px 0 0; color: #64748b; }
.grid-4 { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.stat { border: 1px solid #d8e2ef; border-radius: 12px; background: #fff; padding: 14px; }
.stat span { color: #64748b; font-size: 13px; }
.stat strong { display: block; margin-top: 4px; font-size: 26px; }
.quick-grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.quick-card { border: 1px solid #d8e2ef; border-radius: 12px; background: #fff; padding: 14px; color: inherit; }
.quick-card h3 { margin: 0; }
.quick-card p { margin: 8px 0 0; color: #64748b; }
@media (max-width: 1000px) { .grid-4, .quick-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 680px) { .grid-4, .quick-grid { grid-template-columns: 1fr; } }
</style>
