<template>
  <section class="bookings-page">
    <header class="page-head">
      <h2>Bookings</h2>
      <p>Your latest booking records.</p>
    </header>

    <p v-if="loading" class="state">Loading bookings...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-else-if="!bookings.length" class="state">No bookings found.</p>

    <div v-else class="card-list">
      <article v-for="item in bookings" :key="item.id" class="booking-card">
        <h3>{{ item.id }}</h3>
        <ul>
          <li><strong>Scooter:</strong> {{ item.scooterId }}</li>
          <li><strong>Status:</strong> {{ item.status }}</li>
          <li><strong>Minutes:</strong> {{ item.minutes }}</li>
          <li><strong>Total:</strong> {{ item.total }}</li>
          <li><strong>Created:</strong> {{ item.createdAt }}</li>
        </ul>
      </article>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { getBookings } from '../services/api'

const bookings = ref([])
const loading = ref(true)
const error = ref('')

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await getBookings('student001')
    bookings.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load bookings.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.bookings-page {
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

.card-list {
  display: grid;
  gap: 12px;
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
</style>
