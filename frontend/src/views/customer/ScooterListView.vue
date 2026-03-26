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
      <h3>Filters</h3>

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
          <h1>Available Scooters</h1>
          <p>Browse and book available scooters near you.</p>
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
          </div>
          <div class="card-body">
            <h3>{{ item.id }}</h3>
            <p>{{ item.location }}</p>
            <div class="meta-row">
              <strong class="price">GBP {{ item.hourlyCost }}/hour</strong>
              <span :class="['ds-badge', item.available ? 'ds-badge-success' : 'ds-badge-muted']">{{ item.available ? 'Available' : 'In Use' }}</span>
            </div>
            <div class="card-actions">
              <button class="link-btn" @click="viewDetails(item.id)">View details</button>
              <button class="link-btn" @click="toggleFavorite(item.id)">
                {{ booking.favoriteScooterIds.includes(item.id) ? 'Unfavorite' : 'Favorite' }}
              </button>
            </div>
            <button class="ds-btn ds-btn-outline ds-btn-pill book-btn" :disabled="!item.available" @click="bookNow(item.id)">Book Now</button>
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
  grid-template-columns: 260px 1fr;
  gap: 16px;
}

.filter-panel,
.content-panel {
  border: 0;
}

.filter-panel {
  padding: 14px;
  align-self: start;
  position: sticky;
  top: 88px;
}

.filter-panel h3 {
  margin: 0 0 12px;
}

.filter-group {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}

.price-row {
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  width: 100%;
}

.price-row input {
  width: 100%;
}

.apply-btn,
.reset-btn {
  width: 100%;
  justify-content: center;
}

.content-panel {
  padding: 14px;
}

.status-row {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  border: 1px solid #d8e2ef;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px 12px;
  color: #334155;
}

.status-error {
  border-color: #f5c2c7;
  background: #fff5f5;
  color: #b42318;
}

.content-head {
  display: flex;
  justify-content: space-between;
  align-items: end;
  gap: 12px;
  margin-bottom: 14px;
}

h1 {
  margin: 0;
  font-size: 30px;
  font-family: "Space Grotesk", sans-serif;
}

.content-head p {
  margin: 6px 0 0;
  color: #64748b;
}

.sort-box {
  display: grid;
  gap: 4px;
  min-width: 210px;
}

.quick-strip {
  border: 1px solid #dbe4f2;
  border-radius: 12px;
  background: #f8fbff;
  padding: 10px;
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}

.strip-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.strip-row strong {
  min-width: 120px;
  font-size: 13px;
  color: #334155;
}

.strip-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tag-btn {
  border: 1px solid #0b63d6;
  border-radius: 999px;
  background: #fff;
  color: #0b63d6;
  font-size: 12px;
  padding: 4px 9px;
  cursor: pointer;
}

.tag-btn.muted {
  border-color: #cad7ea;
  color: #526985;
}

.card-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.scooter-card {
  border: 1px solid #d8e2ef;
  border-radius: 12px;
  background: #fff;
  overflow: hidden;
  min-height: 360px;
  display: grid;
  grid-template-rows: 170px 1fr;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.scooter-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 22px rgb(15 23 42 / 7%);
}

.card-media {
  border-bottom: 1px solid #e2e8f2;
  background: #f6f9fe;
  display: grid;
  place-items: center;
}

.card-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-body {
  padding: 14px;
  display: grid;
  align-content: start;
  grid-template-rows: auto auto auto 1fr auto;
  gap: 8px;
}

.card-body h3 {
  margin: 0;
  font-size: 24px;
}

.card-body p {
  margin: 0;
  color: #64748b;
}

.meta-row {
  margin-top: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #0b63d6;
  font-size: 21px;
  letter-spacing: -0.02em;
}

.card-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.link-btn {
  border: 0;
  background: transparent;
  color: #0b63d6;
  font-size: 13px;
  font-weight: 700;
  padding: 0;
  cursor: pointer;
}

.status {
  display: inline-flex;
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
  margin-top: 14px;
  text-align: center;
}

.load-btn {
  min-width: 120px;
}

.list-footer p {
  color: #64748b;
  margin: 0;
}

@media (max-width: 1080px) {
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

@media (max-width: 700px) {
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>
