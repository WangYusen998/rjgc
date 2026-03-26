<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()
const router = useRouter()
const tab = ref('all')
const keyword = ref('')
const sort = ref('newest')
const actionLoading = reactive({})

const bookingStats = computed(() => {
  const all = booking.bookings.length
  const active = booking.bookings.filter((item) => item.status === 'active').length
  const completed = booking.bookings.filter((item) => item.status === 'completed').length
  const cancelled = booking.bookings.filter((item) => item.status === 'cancelled').length
  return { all, active, completed, cancelled }
})

const filteredBookings = computed(() => {
  const list = booking.bookings.filter((item) => {
    const tabOk = tab.value === 'all' || item.status === tab.value
    const keywordOk =
      item.id.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.scooterId.toLowerCase().includes(keyword.value.toLowerCase())
    return tabOk && keywordOk
  })

  if (sort.value === 'cost-asc') return [...list].sort((a, b) => a.cost - b.cost)
  if (sort.value === 'cost-desc') return [...list].sort((a, b) => b.cost - a.cost)
  return [...list].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
})

const emptyText = computed(() => {
  if (tab.value === 'all') return 'No bookings yet.'
  return `No ${tab.value} bookings.`
})

async function onExtend(id) {
  try {
    await ElMessageBox.confirm('Extend this booking by +1h?', 'Confirm', { type: 'warning' })
    actionLoading[id] = true
    await new Promise((resolve) => setTimeout(resolve, 320))
    booking.extendBooking(id)
    ElMessage.success('Booking extended by +1h')
  } catch {
    // cancelled
  } finally {
    actionLoading[id] = false
  }
}

async function onCancel(id) {
  try {
    await ElMessageBox.confirm('Cancel this booking?', 'Confirm', { type: 'warning' })
    actionLoading[id] = true
    await new Promise((resolve) => setTimeout(resolve, 320))
    booking.cancelBooking(id)
    ElMessage.success('Booking cancelled')
  } catch {
    // cancelled
  } finally {
    actionLoading[id] = false
  }
}
</script>

<template>
  <section class="my-bookings-page ds-page">
    <header class="page-head ds-header">
      <div>
        <h1>My Bookings</h1>
        <p>Track active rides and manage booking history.</p>
      </div>
    </header>

    <section class="stats-grid">
      <article class="stat-card ds-panel">
        <span>Total</span>
        <strong>{{ bookingStats.all }}</strong>
      </article>
      <article class="stat-card ds-panel">
        <span>Active</span>
        <strong>{{ bookingStats.active }}</strong>
      </article>
      <article class="stat-card ds-panel">
        <span>Completed</span>
        <strong>{{ bookingStats.completed }}</strong>
      </article>
      <article class="stat-card ds-panel">
        <span>Cancelled</span>
        <strong>{{ bookingStats.cancelled }}</strong>
      </article>
    </section>

    <section class="control-bar ds-panel">
      <div class="tab-row">
        <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All</button>
        <button :class="{ active: tab === 'active' }" @click="tab = 'active'">Active</button>
        <button :class="{ active: tab === 'completed' }" @click="tab = 'completed'">Completed</button>
        <button :class="{ active: tab === 'cancelled' }" @click="tab = 'cancelled'">Cancelled</button>
      </div>
      <div class="filter-row">
        <input v-model="keyword" class="ds-input" placeholder="Search booking ID / scooter ID" />
        <select v-model="sort" class="ds-select">
          <option value="newest">Newest First</option>
          <option value="cost-asc">Cost: Low to High</option>
          <option value="cost-desc">Cost: High to Low</option>
        </select>
      </div>
    </section>

    <section class="booking-grid" v-if="filteredBookings.length > 0">
      <article v-for="item in filteredBookings" :key="item.id" class="booking-card ds-panel">
        <div class="card-top">
          <strong>{{ item.id }}</strong>
          <span :class="['ds-badge', item.status === 'active' ? 'ds-badge-success' : item.status === 'completed' ? 'ds-badge-info' : 'ds-badge-muted']">{{ item.status }}</span>
        </div>
        <p><b>Scooter:</b> {{ item.scooterId }}</p>
        <p><b>Plan:</b> {{ item.hireLabel }}</p>
        <p><b>Cost:</b> GBP {{ item.cost }}</p>
        <p><b>Date:</b> {{ item.createdAt || '-' }}</p>
        <div class="timeline" v-if="Array.isArray(item.timeline) && item.timeline.length > 0">
          <div v-for="(step, index) in item.timeline.slice(-4)" :key="`${item.id}-${index}`" class="timeline-item">
            <span class="dot"></span>
            <div>
              <strong>{{ step.step }}</strong>
              <small>{{ step.time }}</small>
            </div>
          </div>
        </div>
        <div class="actions">
          <button class="ds-btn ds-btn-outline ds-btn-pill btn action" :disabled="item.status !== 'active' || actionLoading[item.id]" @click="onExtend(item.id)">
            {{ actionLoading[item.id] ? 'Processing...' : 'Extend' }}
          </button>
          <button class="ds-btn ds-btn-danger ds-btn-pill btn danger" :disabled="item.status !== 'active' || actionLoading[item.id]" @click="onCancel(item.id)">
            {{ actionLoading[item.id] ? 'Processing...' : 'Cancel' }}
          </button>
        </div>
      </article>
    </section>

    <section v-else class="empty-state ds-empty">
      <h3 class="ds-empty-title">No records yet</h3>
      <p class="ds-empty-desc">{{ emptyText }} Try changing filters or create a new booking.</p>
      <button class="ds-btn ds-btn-primary ds-empty-action" @click="router.push('/customer/scooters')">Go to Scooters</button>
    </section>
  </section>
</template>

<style scoped>
.my-bookings-page {
  display: grid;
  gap: 14px;
}

.page-head {
  padding: 16px;
}

h1 {
  margin: 0;
  font-size: 32px;
  font-family: "Space Grotesk", sans-serif;
}

.page-head p {
  margin: 6px 0 0;
  color: #64748b;
}

.stats-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.stat-card {
  padding: 14px;
}

.stat-card span {
  color: #64748b;
  font-size: 13px;
}

.stat-card strong {
  display: block;
  margin-top: 4px;
  font-size: 30px;
  font-family: "Space Grotesk", sans-serif;
}

.control-bar {
  padding: 12px;
  display: grid;
  gap: 10px;
}

.tab-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tab-row button {
  border: 1px solid #cfd9e8;
  border-radius: 999px;
  padding: 6px 12px;
  background: #fff;
  cursor: pointer;
  font-weight: 700;
}

.tab-row button.active {
  border-color: #0b63d6;
  background: #0b63d6;
  color: #fff;
}

.filter-row {
  display: grid;
  grid-template-columns: 1fr 220px;
  gap: 10px;
}

.booking-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.booking-card {
  padding: 14px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.booking-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgb(15 23 42 / 8%);
}

.card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.booking-card p {
  margin: 6px 0 0;
  color: #475569;
}

.actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.timeline {
  margin-top: 10px;
  display: grid;
  gap: 6px;
  border-left: 2px solid #d9e3f1;
  padding-left: 10px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 10px 1fr;
  gap: 8px;
  align-items: start;
}

.timeline-item .dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #0b63d6;
  margin-top: 5px;
}

.timeline-item strong {
  display: block;
  font-size: 13px;
}

.timeline-item small {
  color: #64748b;
}

.btn {
  padding: 7px 12px;
}

.btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.empty-state {
  padding: 26px;
}

@media (max-width: 1080px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .booking-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .filter-row {
    grid-template-columns: 1fr;
  }

  .booking-grid {
    grid-template-columns: 1fr;
  }
}
</style>
