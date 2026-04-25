<script setup>
import { computed, onMounted, reactive, ref, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()
const route = useRoute()
const router = useRouter()

const form = reactive({ scooterId: '', hireKey: '1h', termsAccepted: false })
const previewVisible = ref(false)

const availableScooters = computed(() => booking.scooters.filter((item) => item.available))
const selectedScooter = computed(() => booking.scooters.find((item) => item.id === form.scooterId))
const pricingMultiplier = {
  '1h': 1,
  '4h': 3,
  '1d': 6.25,
  '1w': 27.5,
}
const hireCards = computed(() =>
  booking.hireOptions.map((item) => ({
    ...item,
    dynamicPrice: Number(((selectedScooter.value?.hourlyCost || 4) * (pricingMultiplier[item.key] || 1)).toFixed(2)),
  })),
)
const selectedPlan = computed(() => hireCards.value.find((item) => item.key === form.hireKey))
const baseCost = computed(() => selectedPlan.value?.dynamicPrice || 0)
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
  if (!form.termsAccepted) {
    ElMessage.error('Please accept the rental and return policy.')
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
          <label v-for="item in hireCards" :key="item.key" class="radio-card">
            <input v-model="form.hireKey" type="radio" :value="item.key" />
            <span>{{ item.label }} (GBP {{ item.dynamicPrice }})</span>
          </label>
        </div>
      </div>

      <section v-if="selectedScooter" class="scooter-preview">
        <img :src="selectedScooter.imageUrl" :alt="selectedScooter.modelName" @click="previewVisible = true" />
        <div class="preview-copy">
          <div class="preview-top">
            <div>
              <h2>{{ selectedScooter.modelName }}</h2>
              <p>{{ selectedScooter.description }}</p>
            </div>
            <span class="ds-badge ds-badge-info">{{ selectedScooter.batteryLabel }}</span>
          </div>
          <div class="preview-specs">
            <span>{{ selectedScooter.topSpeedMph }} mph top speed</span>
            <span>{{ selectedScooter.estimatedRideMiles }} mi ride estimate</span>
            <span>GPS {{ selectedScooter.gpsStatus }}</span>
            <span>{{ selectedScooter.qrLabel }}</span>
          </div>
          <p class="return-rule">Approved return bays: {{ selectedScooter.returnZones.join(', ') }}</p>
        </div>
      </section>

      <label class="terms-box">
        <input v-model="form.termsAccepted" type="checkbox" />
        <span>I understand that unlock uses QR scan in the app, returns are checked against approved bays, and late return or damage charges can be billed automatically.</span>
      </label>

      <button class="primary-btn ds-btn ds-btn-primary ds-btn-pill" @click="submitBooking">Continue to Payment</button>
    </article>

    <article class="summary ds-panel">
      <h2>Price Calculator</h2>
      <p v-if="selectedScooter" class="return-rule">{{ selectedScooter.insuranceNote }}</p>
      <div class="summary-row"><span>Base Price</span><strong>GBP {{ baseCost }}</strong></div>
      <div class="summary-row"><span>Service Fee (8%)</span><strong>GBP {{ serviceFee }}</strong></div>
      <div class="summary-row"><span>Discount</span><strong>- GBP {{ discount }}</strong></div>
      <div class="summary-row total"><span>Total</span><strong>GBP {{ totalCost }}</strong></div>
      <small>* Weekly hire automatically applies a 12% discount.</small>
    </article>

    <ElDialog v-model="previewVisible" width="min(720px, 94vw)" title="Selected scooter">
      <div v-if="selectedScooter" class="dialog-preview">
        <img :src="selectedScooter.imageUrl" :alt="selectedScooter.modelName" />
        <div>
          <h2>{{ selectedScooter.modelName }}</h2>
          <p>{{ selectedScooter.description }}</p>
          <div class="preview-specs">
            <span>{{ selectedScooter.topSpeedMph }} mph</span>
            <span>{{ selectedScooter.payloadKg }} kg payload</span>
            <span>{{ selectedScooter.odometerMiles }} mi odometer</span>
            <span>{{ selectedScooter.returnZones.join(', ') }}</span>
          </div>
        </div>
      </div>
    </ElDialog>
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
.scooter-preview {
  display: grid;
  gap: 14px;
  grid-template-columns: 220px 1fr;
  border: 1px solid #dbe5f1;
  border-radius: 16px;
  background: linear-gradient(180deg, #f9fbff, #f2f7ff);
  padding: 14px;
}
.scooter-preview img {
  width: 100%;
  border-radius: 14px;
  cursor: zoom-in;
}
.preview-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 10px;
}
.preview-copy h2 {
  margin: 0;
  font-size: 24px;
  font-family: "Space Grotesk", sans-serif;
}
.preview-copy p {
  margin: 6px 0 0;
  color: #51627b;
  line-height: 1.45;
}
.preview-specs {
  margin-top: 12px;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.preview-specs span {
  border-radius: 10px;
  background: #fff;
  color: #334155;
  font-size: 12px;
  font-weight: 700;
  padding: 8px 10px;
}
.terms-box {
  display: flex;
  gap: 10px;
  align-items: start;
  border: 1px solid #dbe4f0;
  border-radius: 12px;
  background: #fbfdff;
  padding: 12px;
  color: #334155;
}
.terms-box input {
  margin-top: 2px;
}
.primary-btn { width: fit-content; }
.summary { padding: 16px; display: grid; gap: 8px; }
.summary h2 { margin: 0 0 4px; font-size: 22px; font-family: "Space Grotesk", sans-serif; }
.summary-row { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #d7e2f0; padding-bottom: 6px; }
.summary-row.total { border-bottom: 0; padding-top: 4px; }
.summary-row.total strong { font-size: 24px; color: #0b63d6; font-family: "Space Grotesk", sans-serif; }
.summary small { color: #64748b; }
.return-rule {
  margin: 0;
  color: #51627b;
  line-height: 1.45;
}
.dialog-preview {
  display: grid;
  gap: 16px;
  grid-template-columns: 280px 1fr;
}
.dialog-preview img {
  width: 100%;
  border-radius: 18px;
}
@media (max-width: 680px) {
  .radio-grid,
  .preview-specs,
  .dialog-preview,
  .scooter-preview {
    grid-template-columns: 1fr;
  }
}
</style>
