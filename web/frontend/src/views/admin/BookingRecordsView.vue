<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookingStore } from '@/stores/booking'
import { ApiError } from '@/utils/apiError'

const booking = useBookingStore()
const router = useRouter()
const search = ref('')
const status = ref('all')

onMounted(async () => {
  await booking.hydrateScooters()
  await booking.hydrateBookings()
})

const filteredBookings = computed(() =>
  booking.bookings.filter((item) => {
    const keyword = search.value.toLowerCase()
    const matchesKeyword =
      item.id.toLowerCase().includes(keyword) ||
      item.scooterId.toLowerCase().includes(keyword) ||
      item.userName.toLowerCase().includes(keyword)
    const matchesStatus = status.value === 'all' || item.status === status.value
    return matchesKeyword && matchesStatus
  }),
)

const stats = computed(() => ({
  total: booking.bookings.length,
  active: booking.bookings.filter((item) => item.status === 'active').length,
  cancelled: booking.bookings.filter((item) => item.status === 'cancelled').length,
  revenue: booking.bookings
    .filter((item) => item.status !== 'cancelled')
    .reduce((sum, item) => sum + Number(item.cost || 0), 0),
}))

async function extendRecord(record) {
  try {
    await ElMessageBox.confirm(`Extend ${record.id} by +1 hour?`, 'Confirm', { type: 'warning' })
    await booking.extendBooking(record.id)
    ElMessage.success('Booking extended.')
  } catch (error) {
    if (error instanceof ApiError) ElMessage.error(error.message)
  }
}

async function cancelRecord(record) {
  try {
    await ElMessageBox.confirm(`Cancel ${record.id}?`, 'Confirm', { type: 'warning' })
    await booking.cancelBooking(record.id)
    ElMessage.success('Booking cancelled.')
  } catch (error) {
    if (error instanceof ApiError) ElMessage.error(error.message)
  }
}
</script>

<template>
  <section class="admin-page">
    <header class="head">
      <div>
        <h1>Booking Records</h1>
        <p>Inspect every booking in the demo, drill into details, and handle quick admin actions.</p>
      </div>
    </header>

    <section class="stats-grid">
      <article class="card"><span>Total Bookings</span><strong>{{ stats.total }}</strong></article>
      <article class="card"><span>Active</span><strong>{{ stats.active }}</strong></article>
      <article class="card"><span>Cancelled</span><strong>{{ stats.cancelled }}</strong></article>
      <article class="card"><span>Revenue</span><strong>GBP {{ stats.revenue.toFixed(2) }}</strong></article>
    </section>

    <section class="panel toolbar">
      <input v-model="search" type="text" placeholder="Search by booking id, scooter, or user" />
      <select v-model="status">
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
        <option value="pending">Pending</option>
      </select>
    </section>

    <section class="panel">
      <div v-if="filteredBookings.length > 0" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>Booking</th>
              <th>User</th>
              <th>Scooter</th>
              <th>Status</th>
              <th>Cost</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredBookings" :key="item.id">
              <td>
                <strong>{{ item.id }}</strong>
                <small>{{ item.hireLabel }}</small>
              </td>
              <td>
                <strong>{{ item.userName }}</strong>
                <small>{{ item.userEmail }}</small>
              </td>
              <td>
                <strong>{{ item.scooterId }}</strong>
                <small>{{ item.scooterLocation }}</small>
              </td>
              <td>
                <span :class="['badge', item.status]">{{ item.status }}</span>
              </td>
              <td>GBP {{ Number(item.cost || 0).toFixed(2) }}</td>
              <td>{{ new Date(item.createdAt).toLocaleString() }}</td>
              <td>
                <div class="action-set">
                  <button class="btn" @click="router.push(`/admin/bookings/${item.id}`)">View</button>
                  <button class="btn" :disabled="item.status !== 'active'" @click="extendRecord(item)">Extend</button>
                  <button class="btn danger" :disabled="!['active', 'pending'].includes(item.status)" @click="cancelRecord(item)">Cancel</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-box">
        <h3>No records yet</h3>
        <p>Try another filter to show matching bookings.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.admin-page { display: grid; gap: 14px; }
.head,
.panel,
.card {
  border: 1px solid rgba(146,170,214,.3);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(14,29,54,.78), rgba(10,23,43,.72));
  box-shadow: 0 18px 34px rgba(2, 10, 23, 0.16);
}
.head,
.panel { padding: 18px; }
h1 { margin: 0; }
.head p { margin: 6px 0 0; color: #9fb3d1; }
.stats-grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.card { padding: 16px; }
.card span { color: #9fb3d1; font-size: 13px; }
.card strong { display: block; margin-top: 4px; font-size: 24px; color: #fff; }
.toolbar { display: grid; gap: 10px; grid-template-columns: 1fr 220px; }
input,
select {
  border: 1px solid rgba(146,170,214,.35);
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(6,19,40,.65);
  color: #e2e8f0;
}
.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 1050px; }
.table th,
.table td { border-bottom: 1px solid rgba(146,170,214,.14); padding: 14px 10px; text-align: left; color: #dce9ff; }
.table th { color: #9fb3d1; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.table td small { display: block; margin-top: 4px; color: #9fb3d1; }
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}
.badge.active { background: rgba(22,163,74,.18); color: #8ef0af; }
.badge.completed { background: rgba(59,130,246,.18); color: #bfdbfe; }
.badge.cancelled { background: rgba(239,68,68,.18); color: #fecaca; }
.badge.pending { background: rgba(148,163,184,.18); color: #cbd5e1; }
.action-set { display: flex; gap: 8px; }
.btn {
  border: 1px solid rgba(96,165,250,.34);
  border-radius: 10px;
  padding: 8px 12px;
  background: linear-gradient(180deg, rgba(59,130,246,.18), rgba(59,130,246,.08));
  color: #eff6ff;
  cursor: pointer;
}
.btn.danger {
  border-color: rgba(248,113,113,.34);
  background: linear-gradient(180deg, rgba(239,68,68,.16), rgba(239,68,68,.08));
  color: #fecaca;
}
.btn:disabled { opacity: .45; cursor: not-allowed; }
.empty-box { text-align: center; color: #b9cbe3; }
.empty-box h3 { margin: 0; color: #f8fbff; }
.empty-box p { margin: 8px 0 0; }
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) {
  .stats-grid,
  .toolbar { grid-template-columns: 1fr; }
}
</style>
