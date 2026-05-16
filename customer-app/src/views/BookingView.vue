<template>
  <section class="booking-page">
    <header class="page-head">
      <h2>Booking</h2>
      <p>Confirm your scooter booking.</p>
    </header>

    <p v-if="loading" class="state">Loading selected scooter...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>

    <article v-else-if="selectedScooter" class="booking-card">
      <h3>{{ selectedScooter.id }}</h3>
      <ul>
        <li><strong>Model:</strong> {{ selectedScooter.model }}</li>
        <li><strong>Status:</strong> {{ selectedScooter.status }}</li>
        <li><strong>Battery:</strong> {{ selectedScooter.battery }}%</li>
        <li><strong>Price:</strong> {{ selectedScooter.price }}</li>
        <li><strong>Latitude:</strong> {{ selectedScooter.latitude }}</li>
        <li><strong>Longitude:</strong> {{ selectedScooter.longitude }}</li>
      </ul>

      <button type="button" :disabled="submitting" @click="confirmBooking">
        {{ submitting ? 'Submitting...' : 'Confirm Booking' }}
      </button>
    </article>

    <p v-else class="state">No scooter selected.</p>

    <p v-if="successMessage" class="state success">{{ successMessage }}</p>
    <p v-if="submitError" class="state error">{{ submitError }}</p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { createBooking, getScooter } from '../services/api'

const route = useRoute()
const router = useRouter()

const selectedScooter = ref(null)
const loading = ref(true)
const error = ref('')
const submitting = ref(false)
const successMessage = ref('')
const submitError = ref('')

onMounted(async () => {
  const scooterId = typeof route.params.id === 'string' ? route.params.id : ''
  loading.value = true
  error.value = ''

  if (!scooterId) {
    error.value = 'Missing scooter id.'
    loading.value = false
    return
  }

  try {
    selectedScooter.value = await getScooter(scooterId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load scooter.'
  } finally {
    loading.value = false
  }
})

async function confirmBooking() {
  if (!selectedScooter.value) return

  submitting.value = true
  submitError.value = ''
  successMessage.value = ''

  const payload = {
    account: 'student001',
    scooterId: selectedScooter.value.id,
    minutes: 30,
    insurance: true,
    rentalMode: 'sharing-cn',
    paymentMethod: 'PWA Demo Wallet',
    safetyAccepted: true,
    deductionAccepted: true,
  }

  try {
    const booking = await createBooking(payload)
    successMessage.value = `Booking created: ${booking?.id || 'success'}`
    setTimeout(() => {
      router.push('/bookings')
    }, 500)
  } catch (err) {
    submitError.value = err instanceof Error ? err.message : 'Failed to create booking.'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.booking-page {
  display: grid;
  gap: 14px;
}

.page-head h2 {
  margin: 0;
  font-size: 20px;
}

.page-head p {
  margin: 4px 0 0;
  color: #4b5563;
  font-size: 14px;
}

.state {
  margin: 0;
  padding: 12px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
  color: #374151;
}

.state.error {
  border-color: #fecaca;
  background: #fef2f2;
  color: #b91c1c;
}

.state.success {
  border-color: #86efac;
  background: #f0fdf4;
  color: #166534;
}

.booking-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
}

.booking-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.booking-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.booking-card li {
  font-size: 14px;
  color: #374151;
}

.booking-card button {
  margin-top: 12px;
  width: 100%;
  min-height: 38px;
  border: 0;
  border-radius: 10px;
  background: #111827;
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
}

.booking-card button:disabled {
  opacity: 0.6;
}
</style>
