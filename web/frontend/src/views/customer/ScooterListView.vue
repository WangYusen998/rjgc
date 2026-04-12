<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBookingStore } from '@/stores/booking'

const booking = useBookingStore()
const route = useRoute()
const router = useRouter()

const search = ref('')
const location = ref('all')
const availability = ref('all')
const minPrice = ref('')
const maxPrice = ref('')
const sortBy = ref('newest')
const visibleCount = ref(6)

onMounted(() => {
  booking.hydrateScooters()
})

watch(
  () => route.query.q,
  (value) => {
    if (typeof value === 'string') search.value = value
  },
  { immediate: true },
)

const locationOptions = computed(() => ['all', ...new Set(booking.scooters.map((item) => item.location))])
const favoriteScooters = computed(() =>
  booking.favoriteScooterIds
    .map((id) => booking.scooters.find((item) => item.id === id))
    .filter(Boolean),
)
const recentScooters = computed(() =>
  booking.recentScooterIds
    .map((id) => booking.scooters.find((item) => item.id === id))
    .filter(Boolean),
)
const availableCount = computed(() => booking.scooters.filter((item) => item.available).length)

const filteredScooters = computed(() => {
  const min = minPrice.value === '' ? -Infinity : Number(minPrice.value)
  const max = maxPrice.value === '' ? Infinity : Number(maxPrice.value)

  const list = booking.scooters.filter((item) => {
    const keywordOk =
      item.id.toLowerCase().includes(search.value.toLowerCase()) ||
      item.location.toLowerCase().includes(search.value.toLowerCase())
    const locationOk = location.value === 'all' || item.location === location.value
    const availabilityOk =
      availability.value === 'all' || (availability.value === 'available' ? item.available : !item.available)
    const priceOk = item.hourlyCost >= min && item.hourlyCost <= max
    return keywordOk && locationOk && availabilityOk && priceOk
  })

  if (sortBy.value === 'price-asc') return [...list].sort((a, b) => a.hourlyCost - b.hourlyCost)
  if (sortBy.value === 'price-desc') return [...list].sort((a, b) => b.hourlyCost - a.hourlyCost)
  return [...list].sort((a, b) => b.id.localeCompare(a.id))
})

const visibleScooters = computed(() => filteredScooters.value.slice(0, visibleCount.value))
const hasMore = computed(() => visibleCount.value < filteredScooters.value.length)

function resetFilter() {
  search.value = ''
  location.value = 'all'
  availability.value = 'all'
  minPrice.value = ''
  maxPrice.value = ''
  sortBy.value = 'newest'
  visibleCount.value = 6
}

function applyFilter() {
  const min = minPrice.value === '' ? null : Number(minPrice.value)
  const max = maxPrice.value === '' ? null : Number(maxPrice.value)

  if (min !== null && max !== null && min > max) {
    minPrice.value = String(max)
    maxPrice.value = String(min)
  }

  visibleCount.value = 6
}

function loadMore() {
  visibleCount.value += 3
}

function bookNow(id) {
  booking.markScooterViewed(id)
  router.push({ path: '/customer/booking', query: { scooterId: id } })
}

function toggleFavorite(id) {
  booking.toggleFavoriteScooter(id)
}

function viewDetails(id) {
  booking.markScooterViewed(id)
  router.push({ path: '/customer/map', query: { scooterId: id } })
}
</script>

<template>
  <section class="scooters-page ds-page">
    <aside class="filter-panel ds-panel">
      <div class="filter-header">
        <span class="eyebrow">Smart Filters</span>
        <h3>Refine your ride</h3>
        <p>{{ availableCount }} scooters currently available across the network.</p>
      </div>

      <div class="filter-group ds-field">
        <label class="ds-label">Search scooter</label>
        <input v-model="search" class="ds-input" placeholder="ID / location" />
      </div>

      <div class="filter-group ds-field">
        <label class="ds-label">Location</label>
        <select v-model="location" class="ds-select">
          <option v-for="item in locationOptions" :key="item" :value="item">
            {{ item === 'all' ? 'All Locations' : item }}
          </option>
        </select>
      </div>

      <div class="filter-group ds-field">
        <label class="ds-label">Availability</label>
        <select v-model="availability" class="ds-select">
          <option value="all">All</option>
          <option value="available">Available</option>
          <option value="in-use">In Use</option>
        </select>
      </div>

      <div class="filter-group ds-field">
        <label class="ds-label">Price Range (GBP/hour)</label>
        <div class="price-row">
          <input v-model="minPrice" class="ds-input" type="number" min="0" placeholder="Min" />
          <input v-model="maxPrice" class="ds-input" type="number" min="0" placeholder="Max" />
        </div>
      </div>

      <button class="ds-btn ds-btn-primary apply-btn" @click="applyFilter">Apply</button>
      <button class="ds-btn ds-btn-secondary reset-btn" @click="resetFilter">Reset</button>
    </aside>

    <div class="content-panel ds-panel">
      <header class="content-head">
        <div>
          <span class="eyebrow">Fleet Browser</span>
          <h1>Available Scooters</h1>
          <p>Browse, compare, and launch straight into booking.</p>
        </div>
        <div class="sort-box">
          <label class="ds-label">Sort By</label>
          <select v-model="sortBy" class="ds-select">
            <option value="newest">Newest Arrivals</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </header>

      <div v-if="booking.scootersLoading" class="status-row">Loading scooters...</div>
      <div v-if="booking.scootersError" class="status-row status-error" role="alert">
        <span>{{ booking.scootersError }}</span>
        <button class="ds-btn ds-btn-secondary" @click="booking.hydrateScooters()">Retry</button>
      </div>

      <section class="quick-strip" v-if="favoriteScooters.length > 0 || recentScooters.length > 0">
        <div v-if="favoriteScooters.length > 0" class="strip-row">
          <strong>Favorites</strong>
          <div class="strip-tags">
            <button v-for="item in favoriteScooters" :key="`fav-${item.id}`" class="tag-btn" @click="viewDetails(item.id)">
              {{ item.id }}
            </button>
          </div>
        </div>
        <div v-if="recentScooters.length > 0" class="strip-row">
          <strong>Recently Viewed</strong>
          <div class="strip-tags">
            <button v-for="item in recentScooters" :key="`recent-${item.id}`" class="tag-btn muted" @click="viewDetails(item.id)">
              {{ item.id }}
            </button>
          </div>
        </div>
      </section>

      <div class="card-grid">
        <article v-for="item in visibleScooters" :key="item.id" class="scooter-card">
          <div class="card-media">
            <img :src="item.imageUrl || '/scooter-placeholder.svg'" :alt="`Scooter ${item.id}`" />
            <div class="media-overlay"></div>
            <div class="media-chip">{{ item.available ? 'Ready to ride' : 'Currently in use' }}</div>
          </div>

          <div class="card-body">
            <div class="card-topline">
              <div>
                <h3>{{ item.id }}</h3>
                <p>{{ item.location }}</p>
              </div>
              <span :class="['ds-badge', item.available ? 'ds-badge-success' : 'ds-badge-muted']">{{ item.available ? 'Available' : 'In Use' }}</span>
            </div>

            <div class="meta-row">
              <strong class="price">GBP {{ item.hourlyCost }}/hour</strong>
              <span class="meta-hint">Flexible plans</span>
            </div>

            <div class="card-actions">
              <button class="link-btn" @click="viewDetails(item.id)">View details</button>
              <button class="link-btn" @click="toggleFavorite(item.id)">
                {{ booking.favoriteScooterIds.includes(item.id) ? 'Unfavorite' : 'Favorite' }}
              </button>
            </div>

            <button class="ds-btn ds-btn-primary ds-btn-pill book-btn" :disabled="!item.available" @click="bookNow(item.id)">
              Book Now
            </button>
          </div>
        </article>
      </div>

      <div v-if="visibleScooters.length === 0" class="ds-empty">
        <h3 class="ds-empty-title">No scooters match these filters</h3>
        <p class="ds-empty-desc">Try changing filters or reset to view available scooters.</p>
        <button class="ds-btn ds-btn-primary ds-empty-action" @click="resetFilter">Clear Filters</button>
      </div>

      <footer class="list-footer">
        <button v-if="hasMore" class="ds-btn ds-btn-secondary load-btn" @click="loadMore">Load More</button>
        <p v-else>All scooters loaded.</p>
      </footer>
    </div>
  </section>
</template>

<style scoped>
.scooters-page {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 18px;
}

.filter-panel {
  align-self: start;
  position: sticky;
  top: 104px;
  padding: 20px;
  background:
    radial-gradient(circle at 0% 0%, rgb(119 190 255 / 20%), transparent 34%),
    linear-gradient(180deg, rgb(255 255 255 / 90%), rgb(250 252 255 / 86%));
}

.filter-header {
  margin-bottom: 16px;
}

.eyebrow {
  display: inline-block;
  color: #1672d8;
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.filter-header h3 {
  margin: 8px 0 0;
  font-size: 28px;
  font-family: "Space Grotesk", sans-serif;
  line-height: 1.02;
}

.filter-header p {
  margin: 8px 0 0;
  color: #60708a;
  font-size: 14px;
}

.filter-group {
  display: grid;
  gap: 6px;
  margin-bottom: 13px;
}

.price-row {
  display: grid;
  gap: 8px;
}

.apply-btn,
.reset-btn {
  width: 100%;
  justify-content: center;
}

.reset-btn {
  margin-top: 8px;
}

.content-panel {
  padding: 20px;
}

.content-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  margin-bottom: 16px;
}

.content-head h1 {
  margin: 8px 0 0;
  font-size: clamp(32px, 3vw, 46px);
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: -0.04em;
}

.content-head p {
  margin: 8px 0 0;
  color: #64748b;
}

.sort-box {
  display: grid;
  gap: 6px;
  min-width: 230px;
}

.status-row {
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #d8e2ef;
  border-radius: 16px;
  background: linear-gradient(180deg, #fff, #f8fbff);
  padding: 12px 14px;
  color: #334155;
}

.status-error {
  border-color: #f5c2c7;
  background: #fff5f5;
  color: #b42318;
}

.quick-strip {
  border: 1px solid #dbe4f2;
  border-radius: 18px;
  background: linear-gradient(180deg, rgb(247 251 255 / 92%), rgb(237 245 255 / 86%));
  padding: 12px;
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.strip-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strip-row strong {
  min-width: 126px;
  font-size: 13px;
  color: #334155;
}

.strip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  border: 1px solid #a7cff8;
  border-radius: 999px;
  background: rgb(255 255 255 / 90%);
  color: #1672d8;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  cursor: pointer;
}

.tag-btn.muted {
  border-color: #cad7ea;
  color: #526985;
}

.card-grid {
  display: grid;
  gap: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.scooter-card {
  border: 1px solid rgb(159 184 212 / 26%);
  border-radius: 24px;
  background: linear-gradient(180deg, rgb(255 255 255 / 96%), rgb(250 252 255 / 90%));
  overflow: hidden;
  min-height: 410px;
  display: grid;
  grid-template-rows: 220px 1fr;
  box-shadow: 0 22px 34px rgb(21 37 63 / 7%);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.scooter-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 26px 42px rgb(21 37 63 / 11%);
}

.card-media {
  position: relative;
  background:
    radial-gradient(circle at 20% 20%, rgb(112 181 255 / 16%), transparent 28%),
    linear-gradient(180deg, #eef6ff, #e8f0fa);
  display: grid;
  place-items: center;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.media-overlay {
  position: absolute;
  inset: auto 0 0;
  height: 60%;
  background: linear-gradient(180deg, transparent, rgb(10 32 61 / 18%));
}

.media-chip {
  position: absolute;
  top: 14px;
  left: 14px;
  z-index: 1;
  border: 1px solid rgb(255 255 255 / 48%);
  border-radius: 999px;
  padding: 6px 10px;
  background: rgb(255 255 255 / 72%);
  color: #173257;
  font-size: 12px;
  font-weight: 800;
  backdrop-filter: blur(14px);
}

.card-body {
  padding: 18px;
  display: grid;
  align-content: start;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 12px;
}

.card-topline {
  display: flex;
  justify-content: space-between;
  align-items: start;
  gap: 12px;
}

.card-body h3 {
  margin: 0;
  font-size: 30px;
  font-family: "Space Grotesk", sans-serif;
  letter-spacing: -0.04em;
}

.card-body p {
  margin: 4px 0 0;
  color: #60708a;
}

.meta-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
}

.price {
  color: #1672d8;
  font-size: 24px;
  letter-spacing: -0.03em;
  font-family: "Space Grotesk", sans-serif;
}

.meta-hint {
  color: #6d7f98;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-btn {
  border: 0;
  background: transparent;
  color: #1672d8;
  font-size: 13px;
  font-weight: 800;
  padding: 0;
  cursor: pointer;
}

.book-btn {
  margin-top: auto;
  justify-content: center;
}

.book-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.list-footer {
  margin-top: 18px;
  text-align: center;
}

.load-btn {
  min-width: 140px;
}

.list-footer p {
  color: #64748b;
  margin: 0;
}

@media (max-width: 1180px) {
  .scooters-page {
    grid-template-columns: 1fr;
  }

  .filter-panel {
    position: static;
  }

  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 760px) {
  .content-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .sort-box {
    width: 100%;
    min-width: 0;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }

  .strip-row {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
