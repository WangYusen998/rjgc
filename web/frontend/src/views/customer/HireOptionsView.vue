<script setup>
import { computed } from 'vue'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()

const recommendation = computed(() => {
  const options = booking.hireOptions
  if (options.length === 0) return null
  return options.reduce((best, item) => (item.price < best.price ? item : best), options[0])
})

const businessModes = [
  { title: 'Sharing scooters', desc: 'Scan QR code, unlock by APP, live GPS and battery data sent by communication module, APP checks permitted return zone.' },
  { title: 'Walk-in and rent', desc: 'Customer is registered by store clerk, credit card is bound, pickup and return battery levels are recorded.' },
  { title: 'Remote rent, store pickup', desc: 'Reserve through web or APP, collect at store, return at store; overtime reminders and card auto-charge are supported.' },
  { title: 'Safety responsibility', desc: 'Traffic insurance, helmet guidance, parking rules, vehicle damage checks and liability disclaimer are shown before payment.' },
]
</script>

<template>
  <section class="page-wrap">
    <header class="page-head">
      <h1>Hire Options</h1>
      <p>Choose a rental plan that matches your trip duration.</p>
    </header>

    <div class="option-grid">
      <article v-for="item in booking.hireOptions" :key="item.key" class="option-card">
        <h3>{{ item.label }}</h3>
        <p>Flat plan for quick and clear checkout.</p>
        <strong>GBP {{ item.price }}</strong>
        <RouterLink to="/customer/booking" class="cta">Choose Plan</RouterLink>
      </article>
    </div>

    <article v-if="recommendation" class="recommend">
      <h3>Budget Recommendation</h3>
      <p>Best entry plan: <b>{{ recommendation.label }}</b> (GBP {{ recommendation.price }})</p>
    </article>

    <section class="mode-grid">
      <article v-for="item in businessModes" :key="item.title" class="mode-card">
        <h3>{{ item.title }}</h3>
        <p>{{ item.desc }}</p>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.page-head { border: 1px solid #d8e2ef; border-radius: 12px; background: #fff; padding: 16px; }
h1 { margin: 0; font-size: 30px; font-family: "Space Grotesk", sans-serif; }
.page-head p { margin: 6px 0 0; color: #64748b; }
.option-grid { display: grid; gap: 12px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.option-card { border: 1px solid #d8e2ef; border-radius: 12px; background: #fff; padding: 16px; display: grid; gap: 8px; }
.option-card h3 { margin: 0; }
.option-card p { margin: 0; color: #64748b; }
.option-card strong { font-size: 28px; }
.cta { margin-top: 6px; color: #0b63d6; font-weight: 700; }
.recommend { border: 1px solid #cde4ff; border-radius: 12px; background: #edf5ff; padding: 14px; }
.recommend h3 { margin: 0; }
.recommend p { margin: 6px 0 0; }
.mode-grid { display: grid; gap: 12px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.mode-card { border: 1px solid #d8e2ef; border-radius: 12px; background: #fff; padding: 16px; }
.mode-card h3 { margin: 0; }
.mode-card p { margin: 8px 0 0; color: #64748b; }
@media (max-width: 1000px) { .option-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 680px) { .option-grid, .mode-grid { grid-template-columns: 1fr; } }
</style>
