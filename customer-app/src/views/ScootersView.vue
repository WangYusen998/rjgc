<template>
  <section class="scooters-page">
    <header class="page-head">
      <h2>Scooters</h2>
      <p>Browse available scooter data from backend API.</p>
    </header>

    <p v-if="loading" class="state">Loading scooters...</p>
    <p v-else-if="error" class="state error">{{ error }}</p>
    <p v-else-if="!scooters.length" class="state">No scooters found.</p>

    <div v-else class="card-list">
      <article v-for="item in scooters" :key="item.id" class="scooter-card">
        <h3>{{ item.id }}</h3>
        <ul>
          <li><strong>Model:</strong> {{ item.model }}</li>
          <li><strong>Status:</strong> {{ item.status }}</li>
          <li><strong>Battery:</strong> {{ item.battery }}%</li>
          <li><strong>Price:</strong> {{ item.price }}</li>
          <li><strong>Latitude:</strong> {{ item.latitude }}</li>
          <li><strong>Longitude:</strong> {{ item.longitude }}</li>
          <li><strong>Mileage:</strong> {{ item.mileage }}</li>
          <li><strong>Helmet:</strong> {{ item.helmet ? 'Yes' : 'No' }}</li>
        </ul>
        <button type="button" @click="selectScooter(item.id)">Book</button>
      </article>
    </div>

    <p v-if="selectedMessage" class="selected">{{ selectedMessage }}</p>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getScooters } from '../services/api'

const scooters = ref([])
const loading = ref(true)
const error = ref('')
const selectedMessage = ref('')
const router = useRouter()

function selectScooter(id) {
  selectedMessage.value = `Selected scooter: ${id}`
  router.push(`/booking/${encodeURIComponent(id)}`)
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const data = await getScooters()
    scooters.value = Array.isArray(data) ? data : []
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load scooters.'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.scooters-page {
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
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  color: #374151;
}

.state.error {
  color: #b91c1c;
  border-color: #fecaca;
  background: #fef2f2;
}

.card-list {
  display: grid;
  gap: 12px;
}

.scooter-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 14px;
}

.scooter-card h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.scooter-card ul {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 6px;
}

.scooter-card li {
  color: #374151;
  font-size: 14px;
}

.scooter-card button {
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

.selected {
  margin: 0;
  padding: 10px 12px;
  border-radius: 10px;
  background: #ecfeff;
  color: #0f766e;
  border: 1px solid #99f6e4;
  font-size: 14px;
}

@media (min-width: 768px) {
  .card-list {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>


