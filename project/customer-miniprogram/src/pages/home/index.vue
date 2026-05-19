<template>
  <view class="page home-page">
    <view class="hero-card hero">
      <view>
        <text class="eyebrow">{{ lang === 'en' ? 'Shared Scooter Demo' : '校园共享电动滑板车' }}</text>
        <text class="hero-title">{{ L.homeTitle }}</text>
      </view>
      <button class="primary-btn" @tap="scanToRide">{{ L.scan }}</button>
    </view>

    <view class="metric-grid">
      <view class="metric">
        <text class="metric-value">{{ availableCount }}</text>
        <text class="metric-label">{{ lang === 'en' ? 'Available' : '可租车辆' }}</text>
      </view>
      <view class="metric">
        <text class="metric-value">{{ storeList.length }}</text>
        <text class="metric-label">{{ lang === 'en' ? 'Stores' : '附近门店' }}</text>
      </view>
      <view class="metric">
        <text class="metric-value">{{ active ? '1' : '0' }}</text>
        <text class="metric-label">{{ lang === 'en' ? 'Active' : '进行中订单' }}</text>
      </view>
    </view>

    <view v-if="active" class="card active-card">
      <view>
        <text class="section-kicker">{{ lang === 'en' ? 'Current Order' : '当前订单' }}</text>
        <text class="card-title">{{ active.scooterId }} · {{ active.minutes }} {{ lang === 'en' ? 'min' : '分钟' }}</text>
        <text class="muted">{{ active.storeName }} · {{ active.createdAt }}</text>
      </view>
      <button class="ghost-btn compact" @tap="goBooking(active.id)">{{ lang === 'en' ? 'View' : '查看' }}</button>
    </view>

    <view class="section-title">
      <text>{{ lang === 'en' ? 'Recommended Stores' : '推荐门店' }}</text>
      <text class="section-link" @tap="goMap">{{ L.map }}</text>
    </view>
    <view class="store-list">
      <view v-for="store in recommendedStores" :key="store.id" class="card store-card">
        <view>
          <text class="card-title">{{ storeName(store) }}</text>
          <text class="muted">{{ storeAddress(store) }}</text>
          <text class="subtle">{{ store.open }} · {{ store.available }} {{ lang === 'en' ? 'available' : '辆可用' }}</text>
        </view>
        <button class="ghost-btn compact" @tap="openStore(store)">{{ lang === 'en' ? 'Navigate' : '导航' }}</button>
      </view>
    </view>

    <view class="section-title">
      <text>{{ lang === 'en' ? 'Available Scooters' : '可租车辆' }}</text>
      <text class="section-link" @tap="goScooters">{{ lang === 'en' ? 'All' : '全部' }}</text>
    </view>
    <view class="scooter-strip">
      <view v-for="item in topScooters" :key="item.id" class="card scooter-card" @tap="book(item)">
        <image class="scooter-img" :src="item.image" mode="aspectFill" />
        <text class="pill">{{ lang === 'en' ? 'Available' : '可租' }}</text>
        <text class="scooter-id">{{ item.id }}</text>
        <text class="muted">{{ item.model }}</text>
        <text class="subtle">{{ lang === 'en' ? 'Battery' : '电量' }} {{ item.battery }}% · {{ lang === 'en' ? 'Range' : '续航' }} {{ item.rangeKm }}km</text>
      </view>
    </view>

    <view class="section-title">
      <text>{{ lang === 'en' ? 'Safety & Support' : '安全与支持' }}</text>
    </view>
    <view class="ops-grid">
      <button class="ghost-btn" @tap="goSafety">{{ L.safety }}</button>
      <button class="ghost-btn" @tap="goFeedback">{{ lang === 'en' ? 'Report Issue' : '问题反馈' }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { activeBooking, getAvailableScooters, getCurrentUser, seedBookings, stores } from '../../data/mock'
import { fetchRemoteBookings, fetchRemoteScooters, fetchRemoteStores } from '../../data/mock'
import { currentCopy, ensureLanguage, getLang } from '../../data/i18n'
import { openLocation, scanCode } from '../../data/platform'
import { requireLogin } from '../../data/authGuard'

const active = ref(null)
const available = ref([])
const storeList = ref(stores)
const lang = ref('zh')
const L = ref(currentCopy())

const availableCount = computed(() => available.value.length)
const recommendedStores = computed(() => storeList.value.slice(0, 3))
const topScooters = computed(() => available.value.slice(0, 3))
const currentOrderStatuses = ['ongoing', 'overdue', 'returned']

function findCurrentBooking(bookings = []) {
  return currentOrderStatuses
    .map((status) => bookings.find((booking) => booking.status === status))
    .find(Boolean) || null
}

onShow(async () => {
  if (!ensureLanguage()) return
  lang.value = getLang() || 'zh'
  L.value = currentCopy()
  const currentUser = getCurrentUser()
  seedBookings()
  active.value = currentUser?.account ? activeBooking(currentUser.account) : null
  available.value = getAvailableScooters()
  try {
    const [remoteStores, remoteScooters] = await Promise.all([fetchRemoteStores(), fetchRemoteScooters()])
    if (Array.isArray(remoteStores) && remoteStores.length) storeList.value = remoteStores
    if (Array.isArray(remoteScooters) && remoteScooters.length) {
      available.value = remoteScooters.filter((item) => item.status === 'available')
    }
  } catch {
    storeList.value = stores
    available.value = getAvailableScooters()
  }
  if (!currentUser?.account) {
    active.value = null
    return
  }
  try {
    const remoteBookings = await fetchRemoteBookings(currentUser.account)
    active.value = Array.isArray(remoteBookings) ? findCurrentBooking(remoteBookings) : null
  } catch {
    active.value = activeBooking(currentUser.account)
  }
})

function scanToRide() {
  if (!requireLogin()) return
  scanCode({
    onlyFromCamera: false,
    success: (res) => {
      uni.navigateTo({ url: `/pages/booking/index?code=${encodeURIComponent(res.result)}` })
    },
    fail: () => {
      uni.showToast({ title: lang.value === 'en' ? 'Scan cancelled' : '扫码已取消', icon: 'none' })
    },
  })
}

function book(item) {
  if (!requireLogin()) return
  uni.navigateTo({ url: `/pages/booking/index?scooterId=${item.id}` })
}

function goScooters() {
  uni.switchTab({ url: '/pages/scooters/index' })
}

function goMap() {
  uni.switchTab({ url: '/pages/map/index' })
}

function goBooking(id) {
  uni.navigateTo({ url: `/pages/bookings/detail?id=${id}` })
}

function goSafety() {
  uni.navigateTo({ url: '/pages/safety/index' })
}

function goFeedback() {
  uni.navigateTo({ url: '/pages/feedback/index' })
}

function openStore(store) {
  openLocation({
    latitude: store.latitude,
    longitude: store.longitude,
    name: storeName(store),
    address: storeAddress(store),
  })
}

function storeName(store) {
  const zhById = {
    'st-01': '犀安路北门站',
    'st-02': '图书馆广场站',
    'st-03': '交大兴业北街站',
    'st-04': '南区生活广场站',
  }
  const zhByEnName = {
    'North Gate Station': '犀安路北门站',
    'Library Square Station': '图书馆广场站',
    'Metro Station Exit': '交大兴业北街站',
    'South Area Station': '南区生活广场站',
  }
  if (lang.value !== 'en') return zhById[store.id] || zhByEnName[store.name] || store.name
  return {
    'st-01': 'Xian Road North Gate',
    'st-02': 'Library Plaza',
    'st-03': 'Jiaoda Xingye North Street',
    'st-04': 'South Campus Plaza',
  }[store.id] || store.name
}

function storeAddress(store) {
  if (lang.value !== 'en') return store.address
  return {
    'st-01': 'North Gate, SWJTU Xipu Campus, Xian Road 999',
    'st-02': 'East side of Xipu Campus Library Plaza',
    'st-03': 'Near Jiaoda Xingye North Street metro exit',
    'st-04': 'South Campus Life Plaza, SWJTU Xipu Campus',
  }[store.id] || store.address
}
</script>

<style scoped>
.home-page {
  gap: 28rpx;
}

.hero {
  display: flex;
  flex-direction: column;
  gap: 34rpx;
  padding: 38rpx;
  background: #101114;
  color: #fff;
}

.eyebrow,
.section-kicker {
  display: block;
  color: #86efac;
  font-size: 23rpx;
  font-weight: 900;
  text-transform: uppercase;
}

.hero-title {
  display: block;
  margin-top: 16rpx;
  font-size: 56rpx;
  font-weight: 900;
  line-height: 1.05;
}

.hero-copy {
  display: block;
  margin-top: 20rpx;
  color: rgba(255, 255, 255, 0.78);
  font-size: 27rpx;
  line-height: 1.55;
}

.active-card,
.store-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 28rpx;
}

.card-title,
.scooter-id {
  display: block;
  color: #111827;
  font-size: 31rpx;
  font-weight: 900;
}

.section-link {
  color: #0f766e;
  font-size: 26rpx;
  font-weight: 900;
}

.store-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.scooter-strip {
  display: flex;
  gap: 18rpx;
  overflow-x: auto;
  padding-bottom: 8rpx;
}

.scooter-card {
  min-width: 280rpx;
  padding: 24rpx;
}

.scooter-img {
  width: 100%;
  height: 150rpx;
  margin-bottom: 16rpx;
  border-radius: 22rpx;
  background: #e2e8f0;
}

.ops-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16rpx;
}

.compact {
  min-width: 132rpx;
  min-height: 66rpx;
  font-size: 24rpx;
}
</style>
