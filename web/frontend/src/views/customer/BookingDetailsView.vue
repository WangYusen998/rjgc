<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookingStore } from '@/stores/booking'
import { ApiError } from '@/utils/apiError'

const booking = useBookingStore()
const route = useRoute()
const router = useRouter()

const record = ref(null)
const ui = reactive({
  loading: true,
  actionLoading: false,
  error: '',
})

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const backPath = computed(() => (isAdminRoute.value ? '/admin/bookings' : '/customer/history'))
const canEdit = computed(() => ['active', 'pending'].includes(record.value?.status || ''))
const formattedCreatedAt = computed(() =>
  record.value?.createdAt ? new Date(record.value.createdAt).toLocaleString() : '-',
)

async function hydrateDetails() {
  ui.loading = true
  ui.error = ''
  try {
    record.value = await booking.loadBookingDetails(String(route.params.bookingId || ''))
  } catch (error) {
    ui.error = error instanceof ApiError ? error.message : 'Unable to load booking details.'
  } finally {
    ui.loading = false
  }
}

async function onExtend() {
  if (!record.value) return
  try {
    await ElMessageBox.confirm('Extend this booking by +1 hour?', 'Confirm', { type: 'warning' })
    ui.actionLoading = true
    await booking.extendBooking(record.value.id)
    await hydrateDetails()
    ElMessage.success('Booking extended by +1 hour.')
  } catch (error) {
    if (error instanceof ApiError) ElMessage.error(error.message)
  } finally {
    ui.actionLoading = false
  }
}

async function onCancel() {
  if (!record.value) return
  try {
    await ElMessageBox.confirm('Cancel this booking?', 'Confirm', { type: 'warning' })
    ui.actionLoading = true
    await booking.cancelBooking(record.value.id)
    await hydrateDetails()
    ElMessage.success('Booking cancelled.')
  } catch (error) {
    if (error instanceof ApiError) ElMessage.error(error.message)
  } finally {
    ui.actionLoading = false
  }
}

onMounted(async () => {
  await booking.hydrateScooters()
  await booking.hydrateBookings()
  await hydrateDetails()
})

watch(
  () => route.params.bookingId,
  () => {
    hydrateDetails()
  },
)
</script>

<template>
  <section class="details-page ds-page">
    <header class="page-head ds-header">
      <div>
        <button class="back-btn" type="button" @click="router.push(backPath)">Back to {{ isAdminRoute ? 'Booking Records' : 'My Bookings' }}</button>
        <h1>Booking Details</h1>
        <p>Track ride status, payment summary, and timeline updates in one place.</p>
      </div>
    </header>

    <section v-if="ui.loading" class="ds-panel loading-card">
      Loading booking details...
    </section>

    <section v-else-if="ui.error" class="ds-empty">
      <h3 class="ds-empty-title">Unable to load record</h3>
      <p class="ds-empty-desc">{{ ui.error }}</p>
      <button class="ds-btn ds-btn-primary ds-empty-action" @click="hydrateDetails">Retry</button>
    </section>

    <template v-else-if="record">
      <section class="hero-grid">
        <article class="summary-card ds-panel">
          <div class="summary-top">
            <div>
              <small>Booking ID</small>
              <h2>{{ record.id }}</h2>
            </div>
            <span
              :class="[
                'ds-badge',
                record.status === 'active'
                  ? 'ds-badge-success'
                  : record.status === 'cancelled'
                    ? 'ds-badge-danger'
                    : record.status === 'completed'
                      ? 'ds-badge-info'
                      : 'ds-badge-muted',
              ]"
            >
              {{ record.status }}
            </span>
          </div>

          <div class="meta-grid">
            <article>
              <span>Scooter</span>
              <strong>{{ record.scooterId }}</strong>
              <small>{{ record.scooterLocation }}</small>
            </article>
            <article>
              <span>Plan</span>
              <strong>{{ record.hireLabel }}</strong>
              <small>Created {{ formattedCreatedAt }}</small>
            </article>
            <article>
              <span>Total Cost</span>
              <strong>GBP {{ record.cost }}</strong>
              <small>Card ending {{ record.paymentLast4 || '----' }}</small>
            </article>
            <article>
              <span>Rental Mode</span>
              <strong>{{ record.rentalMode }}</strong>
              <small>{{ record.scooterCommunication }}</small>
            </article>
          </div>

          <div class="action-row">
            <button class="ds-btn ds-btn-outline ds-btn-pill" :disabled="!canEdit || ui.actionLoading" @click="onExtend">
              {{ ui.actionLoading ? 'Processing...' : 'Extend +1h' }}
            </button>
            <button class="ds-btn ds-btn-danger ds-btn-pill" :disabled="!canEdit || ui.actionLoading" @click="onCancel">
              {{ ui.actionLoading ? 'Processing...' : 'Cancel Booking' }}
            </button>
          </div>
        </article>

        <article class="journey-card ds-panel">
          <h3>Ride Summary</h3>
          <div class="journey-list">
            <div><span>Pickup Point</span><strong>{{ record.pickupPoint || record.scooterLocation }}</strong></div>
            <div><span>Planned Route</span><strong>{{ record.route || 'City route assigned at pickup' }}</strong></div>
            <div><span>Rate</span><strong>GBP {{ record.scooterRate }}/hour</strong></div>
            <div><span>User</span><strong>{{ record.userName }}</strong></div>
            <div><span>Pickup Battery</span><strong>{{ record.pickupBattery ?? record.scooterBattery }}%</strong></div>
            <div><span>Return Battery</span><strong>{{ record.returnBattery ?? 'Pending return' }}</strong></div>
            <div><span>Electricity Difference</span><strong>GBP {{ record.energyCharge || 0 }}</strong></div>
            <div><span>Overtime Fee</span><strong>GBP {{ record.overdueFee || 0 }}</strong></div>
          </div>
          <p class="note">{{ record.notes || 'No extra notes for this booking.' }}</p>
          <p class="note">{{ record.returnCheck }}</p>
          <p class="note">{{ record.damageStatus }}</p>
          <p class="note">{{ record.insurance }}</p>
        </article>
      </section>

      <section class="details-grid">
        <article class="timeline-card ds-panel">
          <h3>Timeline</h3>
          <div class="timeline">
            <div v-for="(step, index) in record.timeline || []" :key="`${record.id}-${index}`" class="timeline-item">
              <span class="dot"></span>
              <div>
                <strong>{{ step.step }}</strong>
                <small>{{ step.time }}</small>
              </div>
            </div>
          </div>
        </article>

        <article class="support-card ds-panel">
          <h3>Quick Actions</h3>
          <p>Need to review fleet information or report an issue related to this ride?</p>
          <div class="support-actions">
            <button
              class="ds-btn ds-btn-secondary"
              @click="router.push(isAdminRoute ? '/admin/scooters' : { path: '/customer/map', query: { scooterId: record.scooterId } })"
            >
              {{ isAdminRoute ? 'Open Fleet Config' : 'Open Map View' }}
            </button>
            <button
              class="ds-btn ds-btn-secondary"
              @click="router.push(isAdminRoute ? '/admin/issues' : { path: '/customer/feedback', query: { scooterId: record.scooterId } })"
            >
              {{ isAdminRoute ? 'Open Issue Desk' : 'Report Issue' }}
            </button>
            <button class="ds-btn ds-btn-primary" @click="router.push(isAdminRoute ? '/admin/bookings' : '/customer/scooters')">
              {{ isAdminRoute ? 'Back to Records' : 'Browse More Scooters' }}
            </button>
          </div>
        </article>
      </section>
    </template>
  </section>
</template>

<style scoped>
.details-page {
  display: grid;
  gap: 14px;
}

.page-head {
  padding: 18px;
}

.back-btn {
  border: 0;
  background: transparent;
  color: #0b63d6;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
}

h1,
h2,
h3 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
}

.page-head h1 {
  margin-top: 8px;
  font-size: 32px;
}

.page-head p {
  margin: 6px 0 0;
  color: #64748b;
}

.loading-card {
  padding: 20px;
  color: #64748b;
}

.hero-grid,
.details-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: 1.4fr 1fr;
}

.summary-card,
.journey-card,
.timeline-card,
.support-card {
  padding: 18px;
}

.summary-top {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
}

.summary-top small,
.journey-list span {
  color: #64748b;
}

.summary-top h2 {
  margin-top: 6px;
  font-size: 28px;
}

.meta-grid {
  margin-top: 16px;
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.meta-grid article,
.journey-list div {
  border: 1px solid #dbe5f3;
  border-radius: 12px;
  background: #f8fbff;
  padding: 12px;
  display: grid;
  gap: 4px;
}

.meta-grid strong,
.journey-list strong {
  font-size: 20px;
}

.meta-grid small {
  color: #64748b;
}

.action-row,
.support-actions {
  margin-top: 16px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.journey-list {
  display: grid;
  gap: 10px;
}

.note {
  margin: 16px 0 0;
  border-left: 3px solid #0b63d6;
  padding-left: 12px;
  color: #475569;
}

.timeline {
  display: grid;
  gap: 12px;
}

.timeline-item {
  display: grid;
  grid-template-columns: 14px 1fr;
  gap: 10px;
  align-items: start;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: #0b63d6;
  margin-top: 6px;
}

.timeline-item small {
  color: #64748b;
}

.support-card p {
  margin: 10px 0 0;
  color: #64748b;
}

@media (max-width: 980px) {
  .hero-grid,
  .details-grid,
  .meta-grid {
    grid-template-columns: 1fr;
  }
}
</style>
