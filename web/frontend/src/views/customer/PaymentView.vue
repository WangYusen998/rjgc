<script setup>
import { reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBookingStore } from '@/stores/booking'
import { ApiError } from '@/utils/apiError'

const router = useRouter()
const booking = useBookingStore()

const form = reactive({ cardNumber: '', expiry: '', cvv: '' })
const pending = computed(() => booking.pendingBooking)
const selectedScooter = computed(() => booking.scooters.find((item) => item.id === pending.value?.scooterId))
const ui = reactive({ loading: false })

onMounted(() => {
  if (!booking.scooters.length) booking.hydrateScooters()
})

async function submitPayment() {
  if (!pending.value) {
    ElMessage.warning('No pending booking. Please create a booking first.')
    router.push('/customer/booking')
    return
  }
  if (!/^\d{16}$/.test(form.cardNumber.replace(/\s/g, ''))) {
    ElMessage.error('Card number must be 16 digits')
    return
  }
  if (!/^\d{2}\/\d{2}$/.test(form.expiry)) {
    ElMessage.error('Expiry must be MM/YY')
    return
  }
  if (!/^\d{3}$/.test(form.cvv)) {
    ElMessage.error('CVV must be 3 digits')
    return
  }

  try {
    ui.loading = true
    await booking.confirmPayment(form)
    ElMessage.success('Payment successful. Booking confirmed.')
    router.push('/customer/history')
  } catch (error) {
    ElMessage.error(error instanceof ApiError ? error.message : 'Payment failed. Please try again.')
  } finally {
    ui.loading = false
  }
}
</script>

<template>
  <section class="page-wrap ds-page">
    <header class="page-head ds-header">
      <h1>Payment</h1>
      <p>Complete secure simulated payment to confirm booking.</p>
    </header>

    <article v-if="pending" class="summary ds-panel">
      <strong>{{ pending.scooterId }}</strong>
      <span>{{ pending.hireLabel }}</span>
      <span v-if="selectedScooter" class="summary-meta">{{ selectedScooter.modelName }} · {{ selectedScooter.battery }}% battery at pickup</span>
      <b>GBP {{ pending.cost }}</b>
    </article>

    <article class="panel ds-panel">
      <div class="field ds-field">
        <label class="ds-label">Card Number</label>
        <input v-model="form.cardNumber" class="ds-input" placeholder="1234123412341234" />
      </div>
      <div class="row-2">
        <div class="field ds-field">
          <label class="ds-label">Expiry</label>
          <input v-model="form.expiry" class="ds-input" placeholder="MM/YY" />
        </div>
        <div class="field ds-field">
          <label class="ds-label">CVV</label>
          <input v-model="form.cvv" class="ds-input" placeholder="123" />
        </div>
      </div>
      <button class="primary-btn ds-btn ds-btn-primary ds-btn-pill" :disabled="ui.loading" @click="submitPayment">
        {{ ui.loading ? 'Processing...' : 'Pay Now' }}
      </button>
    </article>

    <article v-if="selectedScooter" class="policy-card ds-panel">
      <h2>Rental policy before payment</h2>
      <ul>
        <li>Unlock is completed by scanning the scooter QR code in the app.</li>
        <li>Return is accepted only in approved bays: {{ selectedScooter.returnZones.join(', ') }}.</li>
        <li>Late return reminders can lead to automatic card charges if the ride is still open.</li>
        <li>Damage found at return can trigger an inspection fee and additional liability review.</li>
        <li>{{ selectedScooter.insuranceNote }}</li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.page-head { padding: 16px; }
h1 { margin: 0; font-size: 30px; font-family: "Space Grotesk", sans-serif; }
.page-head p { margin: 6px 0 0; color: #64748b; }
.summary { border-color: #cde4ff; background: #edf5ff; padding: 12px; display: flex; gap: 12px; align-items: center; flex-wrap: wrap; }
.summary-meta { color: #51627b; font-size: 13px; }
.panel { padding: 16px; display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.row-2 { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
.primary-btn { width: fit-content; }
.primary-btn:disabled { opacity: 0.7; cursor: not-allowed; }
.policy-card {
  padding: 16px;
}
.policy-card h2 {
  margin: 0 0 10px;
  font-size: 20px;
  font-family: "Space Grotesk", sans-serif;
}
.policy-card ul {
  margin: 0;
  padding-left: 18px;
  color: #334155;
  display: grid;
  gap: 8px;
}
@media (max-width: 680px) { .row-2 { grid-template-columns: 1fr; } }
</style>
