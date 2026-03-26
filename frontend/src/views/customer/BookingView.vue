<script setup>
import { computed, onMounted, reactive, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ scooterId: '', hireKey: '1h' })

const availableScooters = computed(() => booking.scooters.filter((item) => item.available))
const selectedPlan = computed(() => booking.hireOptions.find((item) => item.key === form.hireKey))
const baseCost = computed(() => selectedPlan.value?.price || 0)
const serviceFee = computed(() => Number((baseCost.value * 0.08).toFixed(2)))
const discount = computed(() => (form.hireKey === '1w' ? Number((baseCost.value * 0.12).toFixed(2)) : 0))
const totalCost = computed(() => Number((baseCost.value + serviceFee.value - discount.value).toFixed(2)))

onMounted(() => {
  booking.hydrateScooters()
})

watchEffect(() => {
  const scooterId = route.query.scooterId
  if (typeof scooterId === 'string') form.scooterId = scooterId
})

function submitBooking() {
  if (!form.scooterId) {
    ElMessage.error('Please choose an available scooter.')
    return
  }
  booking.startBooking(form)
  ElMessage.success('Booking draft created. Proceed to payment.')
  router.push('/customer/payment')
}
</script>

<template>
  <section class="page-wrap ds-page">
    <header class="page-head ds-header">
      <h1>Create Booking</h1>
      <p>Select scooter and hire duration before payment.</p>
    </header>

    <article class="panel ds-panel">
      <div v-if="booking.scootersLoading" class="status-row">Loading scooters...</div>
      <div v-if="booking.scootersError" class="status-row status-error" role="alert">
        <span>{{ booking.scootersError }}</span>
        <button class="ds-btn ds-btn-secondary retry-btn" @click="booking.hydrateScooters()">Retry</button>
      </div>

      <div class="field ds-field">
        <label class="ds-label">Scooter</label>
        <select v-model="form.scooterId" class="ds-select">
          <option value="">Select scooter</option>
          <option v-for="item in availableScooters" :key="item.id" :value="item.id">{{ item.id }} - {{ item.location }}</option>
        </select>
      </div>

      <div class="field ds-field">
        <label class="ds-label">Hire Period</label>
        <div class="radio-grid">
          <label v-for="item in booking.hireOptions" :key="item.key" class="radio-card">
            <input v-model="form.hireKey" type="radio" :value="item.key" />
            <span>{{ item.label }} (GBP {{ item.price }})</span>
          </label>
        </div>
      </div>

      <button class="primary-btn ds-btn ds-btn-primary ds-btn-pill" @click="submitBooking">Continue to Payment</button>
    </article>

    <article class="summary ds-panel">
      <h2>Price Calculator</h2>
      <div class="summary-row"><span>Base Price</span><strong>GBP {{ baseCost }}</strong></div>
      <div class="summary-row"><span>Service Fee (8%)</span><strong>GBP {{ serviceFee }}</strong></div>
      <div class="summary-row"><span>Discount</span><strong>- GBP {{ discount }}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>GBP {{ totalCost }}</strong></div>
      <small>* Weekly hire automatically applies a 12% discount.</small>
    </article>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.page-head { padding: 16px; }
h1 { margin: 0; font-size: 30px; font-family: "Space Grotesk", sans-serif; }
.page-head p { margin: 6px 0 0; color: #64748b; }
.panel { padding: 16px; display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #d8e2ef;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px 12px;
  color: #334155;
}
.status-error {
  border-color: #f5c2c7;
  background: #fff5f5;
  color: #b42318;
}
.retry-btn { min-width: 84px; }
.radio-grid { display: grid; gap: 8px; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.radio-card { border: 1px solid #d8e2ef; border-radius: 8px; background: #f8fbff; padding: 10px; display: flex; gap: 8px; color: #0f172a; }
.primary-btn { width: fit-content; }
.summary { padding: 16px; display: grid; gap: 8px; }
.summary h2 { margin: 0 0 4px; font-size: 22px; font-family: "Space Grotesk", sans-serif; }
.summary-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #d7e2f0; padding-bottom: 6px; }
.summary-row.total { border-bottom: 0; padding-top: 4px; }
.summary-row.total strong { font-size: 24px; color: #0b63d6; font-family: "Space Grotesk", sans-serif; }
.summary small { color: #64748b; }
@media (max-width: 680px) { .radio-grid { grid-template-columns: 1fr; } }
</style>
