<script setup>
import { reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useBookingStore } from '@/stores/booking'
import { ApiError } from '@/utils/apiError'

const router = useRouter()
const booking = useBookingStore()

const form = reactive({ cardNumber: '', expiry: '', cvv: '' })
const pending = computed(() => booking.pendingBooking)
const ui = reactive({ loading: false })

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
  </section>
</template>

<style scoped>
.page-wrap { display: grid; gap: 14px; }
.page-head { padding: 16px; }
h1 { margin: 0; font-size: 30px; font-family: "Space Grotesk", sans-serif; }
.page-head p { margin: 6px 0 0; color: #64748b; }
.summary { border-color: #cde4ff; background: #edf5ff; padding: 12px; display: flex; gap: 12px; align-items: center; }
.panel { padding: 16px; display: grid; gap: 12px; }
.field { display: grid; gap: 6px; }
.row-2 { display: grid; gap: 10px; grid-template-columns: 1fr 1fr; }
.primary-btn { width: fit-content; }
.primary-btn:disabled { opacity: 0.7; cursor: not-allowed; }
@media (max-width: 680px) { .row-2 { grid-template-columns: 1fr; } }
</style>
