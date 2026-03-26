<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()
const route = useRoute()
const router = useRouter()

const selectedId = ref('')
const hoverId = ref('')
const onlyAvailable = ref(false)
const mapMode = ref('city')
const liveUpdatedAt = ref(new Date())
let liveTimer = null

const pinPosition = {
  'SC-101': { x: 18, y: 42 },
  'SC-102': { x: 36, y: 26 },
  'SC-103': { x: 54, y: 58 },
  'SC-104': { x: 69, y: 37 },
  'SC-105': { x: 83, y: 64 },
}

onMounted(async () => {
  await booking.hydrateScooters()
  if (typeof route.query.scooterId === 'string') {
    selectedId.value = route.query.scooterId
  } else if (booking.scooters.length > 0) {
    selectedId.value = booking.scooters[0].id
  }

  liveTimer = setInterval(() => {
    if (mapMode.value === 'live') liveUpdatedAt.value = new Date()
  }, 5000)
})

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer)
})

watch(
  () => route.query.scooterId,
  (id) => {
    if (typeof id === 'string') selectedId.value = id
  },
)

const scootersForList = computed(() => {
  if (!onlyAvailable.value) return booking.scooters
  return booking.scooters.filter((item) => item.available)
})

const selectedScooter = computed(() => booking.scooters.find((item) => item.id === selectedId.value))
const availableCount = computed(() => booking.scooters.filter((item) => item.available).length)
const inUseCount = computed(() => booking.scooters.filter((item) => !item.available).length)
const liveUpdatedText = computed(() =>
  liveUpdatedAt.value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
)

function pickScooter(id) {
  selectedId.value = id
}

function goBook() {
  if (!selectedId.value) return
  router.push({ path: '/customer/booking', query: { scooterId: selectedId.value } })
}

function goDetails() {
  if (!selectedId.value) return
  router.push({ path: '/customer/scooters', query: { q: selectedId.value } })
}

function goReport() {
  if (!selectedId.value) return
  router.push({ path: '/customer/feedback', query: { scooterId: selectedId.value } })
}

function setMode(mode) {
  mapMode.value = mode
  if (mode === 'live') liveUpdatedAt.value = new Date()
}
</script>

<template>
  <section class="map-page ds-page">
    <aside class="map-sidebar">
      <header class="side-head ds-panel">
        <p class="eyebrow">Live Location Board</p>
        <h1>Map</h1>
        <div class="quick-stats">
          <article>
            <small>Available</small>
            <strong>{{ availableCount }}</strong>
          </article>
          <article>
            <small>In Use</small>
            <strong>{{ inUseCount }}</strong>
          </article>
        </div>
      </header>

      <div class="side-tools ds-panel">
        <label class="toggle-row">
          <input v-model="onlyAvailable" type="checkbox" class="toggle-input" />
          <span class="toggle-pill" aria-hidden="true"></span>
          <span>Show only available</span>
        </label>
        <p v-if="booking.scootersLoading" class="status-inline">Loading scooters...</p>
        <p v-if="booking.scootersError" class="status-inline status-error" role="alert">
          {{ booking.scootersError }}
          <button class="retry-link" @click="booking.hydrateScooters()">Retry</button>
        </p>
      </div>

      <div class="station-list ds-panel" v-if="scootersForList.length > 0">
        <article
          v-for="item in scootersForList"
          :key="item.id"
          class="station-card"
          :class="{ active: selectedId === item.id, hover: hoverId === item.id }"
          @mouseenter="hoverId = item.id"
          @mouseleave="hoverId = ''"
          @click="pickScooter(item.id)"
        >
          <div class="station-title">
            <strong>{{ item.id }}</strong>
            <span :class="['ds-badge', item.available ? 'ds-badge-success' : 'ds-badge-muted']">{{ item.available ? 'Available' : 'In Use' }}</span>
          </div>
          <p>{{ item.location }}</p>
          <small>GBP {{ item.hourlyCost }}/hour</small>
        </article>
      </div>
      <div v-else class="ds-empty">
        <h3 class="ds-empty-title">No records yet</h3>
        <p class="ds-empty-desc">Try enabling all scooters to view map points.</p>
      </div>
    </aside>

    <div class="map-main">
      <header class="map-toolbar">
        <div class="toolbar-left">
          <button type="button" class="chip" :class="{ active: mapMode === 'city' }" @click="setMode('city')">City Center</button>
          <button type="button" class="chip" :class="{ active: mapMode === 'stops' }" @click="setMode('stops')">Scooter Stops</button>
          <button type="button" class="chip" :class="{ active: mapMode === 'live' }" @click="setMode('live')">Live View</button>
        </div>
        <div class="legend" v-if="mapMode !== 'live'">
          <span><i class="dot ok"></i> Available</span>
          <span><i class="dot off"></i> In Use</span>
        </div>
        <div class="live-status" v-else>Live updated: {{ liveUpdatedText }}</div>
      </header>

      <div class="map-canvas" :class="`mode-${mapMode}`">
        <div class="roads"></div>
        <div class="stop-zones" v-if="mapMode === 'stops'">
          <span class="zone a">Stop A</span>
          <span class="zone b">Stop B</span>
          <span class="zone c">Stop C</span>
          <span class="zone d">Stop D</span>
          <span class="zone e">Stop E</span>
        </div>
        <div class="district north">North District</div>
        <div class="district central">Central District</div>
        <div class="district east">East District</div>
        <button
          v-for="item in scootersForList"
          :key="item.id"
          class="pin"
          :class="{ selected: selectedId === item.id, hover: hoverId === item.id, unavailable: !item.available, live: mapMode === 'live' && item.available }"
          :style="{ left: `${pinPosition[item.id]?.x || 50}%`, top: `${pinPosition[item.id]?.y || 50}%` }"
          @mouseenter="hoverId = item.id"
          @mouseleave="hoverId = ''"
          @click="pickScooter(item.id)"
        >
          {{ item.id }}
        </button>
      </div>

      <footer class="map-detail" v-if="selectedScooter">
        <div>
          <h3>{{ selectedScooter.id }} - {{ selectedScooter.location }}</h3>
          <p>Price: GBP {{ selectedScooter.hourlyCost }}/hour</p>
        </div>
        <div class="detail-actions">
          <button class="ds-btn ds-btn-secondary ds-btn-pill" @click="goDetails">View Details</button>
          <button class="ds-btn ds-btn-secondary ds-btn-pill" @click="goReport">Report Issue</button>
          <button class="ds-btn ds-btn-primary ds-btn-pill book-btn" :disabled="!selectedScooter.available" @click="goBook">Book This Scooter</button>
        </div>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.map-page {
  display: grid;
  grid-template-columns: 330px 1fr;
  gap: 16px;
}

.map-sidebar {
  display: grid;
  gap: 12px;
  align-content: start;
}

.side-head,
.side-tools,
.station-list,
.map-toolbar,
.map-canvas,
.map-detail {
  border: 1px solid #d8e2ef;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 10px 20px rgb(15 23 42 / 5%);
}

.side-head {
  padding: 16px;
}

.eyebrow {
  margin: 0;
  color: #0b63d6;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.side-head h1 {
  margin: 6px 0 0;
  font-size: 36px;
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: -0.02em;
}

.quick-stats {
  margin-top: 10px;
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.quick-stats article {
  border: 1px solid #dbe5f2;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
}

.quick-stats small {
  display: block;
  color: #64748b;
}

.quick-stats strong {
  display: block;
  margin-top: 2px;
  font-family: "Space Grotesk", sans-serif;
  font-size: 24px;
}

.side-tools {
  padding: 10px;
}

.status-inline {
  margin: 10px 0 0;
  font-size: 13px;
  color: #334155;
}

.status-error {
  color: #b42318;
}

.retry-link {
  margin-left: 8px;
  border: 0;
  background: transparent;
  color: #0b63d6;
  font-weight: 700;
  cursor: pointer;
}

.toggle-row {
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
}

.toggle-input {
  position: absolute;
  opacity: 0;
}

.toggle-pill {
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: #c8d4e7;
  position: relative;
  transition: background 0.2s ease;
}

.toggle-pill::after {
  content: "";
  position: absolute;
  top: 3px;
  left: 3px;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  background: #fff;
  box-shadow: 0 2px 6px rgb(15 23 42 / 20%);
  transition: transform 0.2s ease;
}

.toggle-input:checked + .toggle-pill {
  background: #0b63d6;
}

.toggle-input:checked + .toggle-pill::after {
  transform: translateX(20px);
}

.station-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 540px;
  overflow: auto;
  padding: 10px;
}

.station-card {
  border: 1px solid #d9e3f1;
  border-radius: 12px;
  background: linear-gradient(160deg, #fff, #f8fbff);
  padding: 10px;
  cursor: pointer;
  transition: border-color 0.22s ease, background 0.22s ease, transform 0.22s ease, box-shadow 0.22s ease;
}

.station-card.hover {
  border-color: #7fb6ff;
  transform: translateX(3px);
}

.station-card.active {
  border-color: #0b63d6;
  background: linear-gradient(155deg, #f2f8ff, #eef5ff);
  box-shadow: 0 8px 18px rgb(11 99 214 / 14%);
}

.station-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.station-card p {
  margin: 6px 0 0;
  color: #475569;
}

.station-card small {
  color: #64748b;
}

.map-main {
  display: grid;
  gap: 12px;
  align-content: start;
}

.map-toolbar {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.chip {
  border: 1px solid #d6e1f1;
  border-radius: 999px;
  padding: 6px 11px;
  font-size: 13px;
  color: #334155;
  background: #f8fbff;
  cursor: pointer;
}

.chip.active {
  background: #0b63d6;
  border-color: #0b63d6;
  color: #fff;
}

.legend {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
}

.live-status {
  font-size: 13px;
  color: #0b63d6;
  font-weight: 700;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
  margin-right: 4px;
}

.dot.ok {
  background: #16a34a;
}

.dot.off {
  background: #94a3b8;
}

.map-canvas {
  position: relative;
  min-height: 560px;
  padding: 12px;
  background:
    radial-gradient(circle at 20% 20%, rgb(169 208 255 / 30%) 0, transparent 30%),
    radial-gradient(circle at 80% 80%, rgb(188 218 255 / 30%) 0, transparent 30%),
    #edf3fd;
  overflow: hidden;
}

.roads {
  position: absolute;
  inset: 12px;
  border-radius: 12px;
  background:
    linear-gradient(90deg, transparent 48.5%, #d4def0 49%, #d4def0 51%, transparent 51.5%),
    linear-gradient(0deg, transparent 49%, #d4def0 49.5%, #d4def0 50.5%, transparent 51%),
    linear-gradient(25deg, transparent 32%, #e0e8f7 33%, #e0e8f7 35%, transparent 36%),
    linear-gradient(-25deg, transparent 64%, #e0e8f7 65%, #e0e8f7 67%, transparent 68%);
}

.mode-live .roads {
  filter: saturate(1.05);
}

.mode-stops .district {
  opacity: 0.45;
}

.stop-zones {
  position: absolute;
  inset: 12px;
  z-index: 1;
}

.zone {
  position: absolute;
  border: 1px dashed #83aee8;
  border-radius: 999px;
  color: #557aa7;
  background: rgb(255 255 255 / 70%);
  padding: 4px 8px;
  font-size: 11px;
  font-weight: 700;
}

.zone.a { left: 12%; top: 18%; }
.zone.b { left: 38%; top: 16%; }
.zone.c { left: 58%; top: 47%; }
.zone.d { left: 74%; top: 26%; }
.zone.e { left: 82%; top: 63%; }

.district {
  position: absolute;
  font-size: 12px;
  color: #6b7d99;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-weight: 700;
}

.district.north {
  top: 28px;
  left: 26px;
}

.district.central {
  top: 44%;
  left: 38%;
}

.district.east {
  top: 30px;
  right: 28px;
}

.pin {
  position: absolute;
  transform: translate(-50%, -50%);
  border: 1px solid #0b63d6;
  border-radius: 999px;
  background: #fff;
  color: #0b63d6;
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
  z-index: 2;
}

.pin.hover {
  transform: translate(-50%, -50%) scale(1.06);
  box-shadow: 0 8px 18px rgb(11 99 214 / 28%);
}

.pin.selected {
  background: #0b63d6;
  color: #fff;
  transform: translate(-50%, -50%) scale(1.08);
  box-shadow: 0 8px 18px rgb(11 99 214 / 30%);
}

.pin.unavailable {
  border-color: #94a3b8;
  color: #64748b;
}

.pin.live {
  animation: pulse-pin 1.6s infinite;
}

.map-detail {
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  animation: pop-up 0.22s ease;
}

.map-detail h3 {
  margin: 0;
}

.map-detail p {
  margin: 6px 0 0;
  color: #64748b;
}

.book-btn {
  min-width: 190px;
  box-shadow: 0 10px 20px rgb(11 99 214 / 20%);
}

.detail-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.book-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

@media (max-width: 1000px) {
  .map-page {
    grid-template-columns: 1fr;
  }

  .map-canvas {
    min-height: 420px;
  }

  .map-toolbar {
    flex-direction: column;
    align-items: flex-start;
  }

  .map-detail {
    flex-direction: column;
    align-items: flex-start;
  }

  .detail-actions {
    justify-content: flex-start;
  }
}

@keyframes pop-up {
  from {
    opacity: 0;
    transform: translateY(4px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse-pin {
  0% {
    box-shadow: 0 0 0 0 rgb(11 99 214 / 38%);
  }

  70% {
    box-shadow: 0 0 0 10px rgb(11 99 214 / 0%);
  }

  100% {
    box-shadow: 0 0 0 0 rgb(11 99 214 / 0%);
  }
}
</style>
