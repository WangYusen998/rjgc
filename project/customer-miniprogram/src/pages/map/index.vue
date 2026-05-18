<template>
  <view class="page map-page">
    <view class="map-shell">
      <!-- #ifdef H5 -->
      <view v-if="amapReady" id="amap-container" class="amap-container"></view>
      <view v-else class="fallback-map">
        <view class="map-halo halo-north"></view>
        <view class="map-halo halo-south"></view>
        <view class="map-grid"></view>
        <view class="campus-zone zone-teaching"></view>
        <view class="campus-zone zone-living"></view>
        <view class="road road-main"></view>
        <view class="road road-cross"></view>
        <view class="road road-south"></view>
        <view class="road road-ring ring-west"></view>
        <view class="road road-ring ring-east"></view>
        <view class="campus-water"></view>
        <view class="campus-block block-library">
          <text>图书馆</text>
        </view>
        <view class="campus-block block-gate">
          <text>北门</text>
        </view>
        <view class="campus-block block-life">
          <text>生活区</text>
        </view>
        <view
          v-for="point in visualPoints"
          :key="point.key"
          :class="['visual-marker', point.type, { active: activeStoreId === point.storeId }]"
          :style="{ left: point.left, top: point.top }"
          @tap.stop="point.store && selectStore(point.store)"
        >
          <text>{{ point.label }}</text>
        </view>
      </view>
      <!-- #endif -->

      <!-- #ifndef H5 -->
      <map
        class="native-map"
        :latitude="center.latitude"
        :longitude="center.longitude"
        :markers="markers"
        :scale="16"
        show-location
        @markertap="markerTap"
      />
      <!-- #endif -->

      <view class="map-tools">
        <button class="tool-btn" @tap="locate">定位</button>
        <button class="tool-btn quiet" @tap="openCampusMap">高德</button>
      </view>
      <view v-if="amapReady" class="map-source-badge">
        <text>高德地图 · 西南交大犀浦校区</text>
      </view>
    </view>

    <scroll-view class="station-tabs" scroll-x>
      <view class="tab-row">
        <view
          v-for="store in rankedStores"
          :key="store.id"
          :class="['station-chip', { active: activeStoreId === store.id }]"
          @tap="selectStore(store)"
        >
          <text class="chip-dot"></text>
          <text>{{ storeName(store) }}</text>
        </view>
      </view>
    </scroll-view>

    <view class="locate-card card">
      <view class="locate-copy">
        <text class="title">校园实时地图</text>
        <text class="muted">显示当前位置、门店、可租车辆和车辆通信模块上报的 GPS 点。</text>
      </view>
      <button class="primary-btn locate-btn" @tap="locate">定位</button>
    </view>

    <view class="store-list">
      <view
        v-for="store in rankedStores"
        :key="store.id"
        :class="['card store-card', { active: activeStoreId === store.id }]"
        @tap="selectStore(store)"
      >
        <view class="store-main">
          <view class="store-heading">
            <text class="card-title">{{ storeName(store) }}</text>
            <text class="store-badge">{{ store.available }} 辆可用</text>
          </view>
          <text class="muted">{{ storeAddress(store) }}</text>
          <text class="subtle">{{ store.distanceText }} · {{ store.open }} · 评分 {{ store.rating }}</text>
        </view>
        <button class="ghost-btn compact" @tap.stop="openStore(store)">导航</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { distanceKm, scooters, stores } from '../../data/mock'
import { getLang, setNavTitle } from '../../data/i18n'
import { getLocation, openLocation } from '../../data/platform'

const campusLocation = { latitude: 30.7663, longitude: 103.9847 }
const campusName = '西南交通大学犀浦校区'
const center = ref(campusLocation)
const located = ref(null)
const activeStoreId = ref(stores[1]?.id || stores[0]?.id || '')
const amapReady = ref(false)
const isEn = computed(() => getLang() === 'en')

let amap = null
let amapMarkers = []

const markers = computed(() => [
  ...stores.map((store, index) => ({
    id: index + 1,
    latitude: store.latitude,
    longitude: store.longitude,
    title: storeName(store),
    width: 30,
    height: 30,
    callout: {
      content: storeName(store),
      color: '#111827',
      fontSize: 13,
      borderRadius: 8,
      bgColor: '#ffffff',
      padding: 8,
      display: activeStoreId.value === store.id ? 'ALWAYS' : 'BYCLICK',
    },
  })),
  ...availableScooters.value.map((item, index) => ({
    id: 100 + index,
    latitude: item.latitude,
    longitude: item.longitude,
    title: item.id,
    width: 24,
    height: 24,
  })),
])

const availableScooters = computed(() => scooters.filter((item) => item.status === 'available'))

const rankedStores = computed(() => {
  return stores
    .map((store) => {
      const distance = distanceKm(located.value, store)
      return {
        ...store,
        distance: distance || 999,
        distanceText: distance ? `${distance} km` : '约 0.3 km',
      }
    })
    .sort((a, b) => a.distance - b.distance)
})

const visualPoints = computed(() => {
  const bounds = {
    minLat: 30.7586,
    maxLat: 30.7732,
    minLng: 103.9796,
    maxLng: 103.9914,
  }
  const project = (point) => ({
    left: `${((point.longitude - bounds.minLng) / (bounds.maxLng - bounds.minLng)) * 100}%`,
    top: `${(1 - (point.latitude - bounds.minLat) / (bounds.maxLat - bounds.minLat)) * 100}%`,
  })

  return [
    ...stores.map((store) => ({
      key: store.id,
      type: 'store',
      store,
      storeId: store.id,
      label: shortStoreName(store),
      ...project(store),
    })),
    ...availableScooters.value.map((item) => ({
      key: item.id,
      type: 'scooter',
      label: item.id.replace('SC', ''),
      ...project(item),
    })),
    {
      key: 'me',
      type: 'me',
      label: '我',
      ...project(center.value),
    },
  ]
})

onLoad(() => {
  setNavTitle('校园地图', 'Campus Map')
  locate()
})

onMounted(() => {
  // #ifdef H5
  initAmap()
  // #endif
})

onUnmounted(() => {
  destroyAmap()
})

watch([center, activeStoreId], () => {
  // #ifdef H5
  refreshAmapMarkers()
  // #endif
})

function locate() {
  getLocation({
    type: 'gcj02',
    success: (res) => {
      const userPoint = { latitude: res.latitude, longitude: res.longitude }
      const nearCampus = Number(distanceKm(userPoint, campusLocation)) <= 5
      located.value = nearCampus ? userPoint : campusLocation
      center.value = located.value
      panAmap(center.value)
      uni.showToast({ title: nearCampus ? '定位成功' : '已切到校园地图', icon: nearCampus ? 'success' : 'none' })
    },
    fail: () => {
      located.value = campusLocation
      center.value = campusLocation
      panAmap(center.value)
      uni.showToast({ title: '已使用校园演示定位', icon: 'none' })
    },
  })
}

async function initAmap() {
  const { key, securityJsCode } = await getAmapConfig()
  if (!key || typeof window === 'undefined') return

  try {
    if (securityJsCode) {
      window._AMapSecurityConfig = { securityJsCode }
    }
    await loadAmap(key)
    await nextTick()
    const AMap = window.AMap
    amap = new AMap.Map('amap-container', {
      zoom: 17,
      center: [campusLocation.longitude, campusLocation.latitude],
      resizeEnable: true,
      mapStyle: 'amap://styles/normal',
      viewMode: '2D',
      features: ['bg', 'road', 'building', 'point'],
    })
    amapReady.value = true
    AMap.plugin(['AMap.Scale', 'AMap.ToolBar'], () => {
      amap.addControl(new AMap.Scale())
      amap.addControl(new AMap.ToolBar({ position: { right: '12px', top: '12px' } }))
    })
    refreshAmapMarkers()
  } catch (error) {
    amapReady.value = false
    console.warn('AMap load failed:', error)
  }
}

async function getAmapConfig() {
  const runtime = typeof window !== 'undefined' ? window.__SWIFTRIDE_AMAP__ || {} : {}
  const config = {
    key: runtime.key || import.meta.env.VITE_AMAP_KEY || '',
    securityJsCode: runtime.securityJsCode || import.meta.env.VITE_AMAP_SECURITY_JS_CODE || '',
  }
  if (!config.key && typeof fetch === 'function') {
    try {
      const res = await fetch('/amap-config.json', { cache: 'no-store' })
      if (res.ok) {
        const remote = await res.json()
        config.key = remote.key || ''
        config.securityJsCode = remote.securityJsCode || ''
      }
    } catch {
      // Keep the illustrated campus fallback when no runtime map config exists.
    }
  }
  return config
}

function loadAmap(key) {
  if (window.AMap) return Promise.resolve()
  if (window.__swiftrideAmapLoading) return window.__swiftrideAmapLoading

  window.__swiftrideAmapLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `https://webapi.amap.com/maps?v=2.0&key=${encodeURIComponent(key)}`
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
  return window.__swiftrideAmapLoading
}

function refreshAmapMarkers() {
  if (!amap || !window.AMap) return
  const AMap = window.AMap
  amapMarkers.forEach((marker) => marker.setMap(null))
  amapMarkers = []

  const makeMarker = ({ point, type, label, store }) => {
    const marker = new AMap.Marker({
      position: [point.longitude, point.latitude],
      content: `<div class="amap-pin amap-pin--${type}">${label}</div>`,
      offset: new AMap.Pixel(-18, -18),
      zIndex: type === 'store' ? 120 : 100,
    })
    if (store) marker.on('click', () => selectStore(store))
    amapMarkers.push(marker)
  }

  stores.forEach((store) => makeMarker({ point: store, type: activeStoreId.value === store.id ? 'active' : 'store', label: shortStoreName(store), store }))
  availableScooters.value.forEach((item) => makeMarker({ point: item, type: 'scooter', label: item.id.replace('SC', '') }))
  makeMarker({ point: center.value, type: 'me', label: '我' })
  amap.add(amapMarkers)
  amap.setFitView(amapMarkers, false, [54, 34, 118, 34], 17)
}

function panAmap(point) {
  if (!amap) return
  amap.setCenter([point.longitude, point.latitude])
}

function destroyAmap() {
  if (amap) {
    amap.destroy()
    amap = null
  }
  amapMarkers = []
}

function selectStore(store) {
  activeStoreId.value = store.id
  center.value = { latitude: store.latitude, longitude: store.longitude }
  panAmap(store)
}

function storeName(store) {
  if (isEn.value) {
    return {
      'st-01': 'Xian Road North Gate',
      'st-02': 'Library Plaza',
      'st-03': 'Jiaoda Xingye North Street',
      'st-04': 'South Campus Plaza',
    }[store.id] || store.name
  }
  return {
    'st-01': '犀安路北门站',
    'st-02': '图书馆广场站',
    'st-03': '交大兴业北街站',
    'st-04': '南区生活广场站',
  }[store.id] || store.name
}

function shortStoreName(store) {
  return {
    'st-01': '北门',
    'st-02': '图书馆',
    'st-03': '兴业',
    'st-04': '南区',
  }[store.id] || storeName(store).slice(0, 2)
}

function storeAddress(store) {
  if (isEn.value) {
    return {
      'st-01': 'North Gate, SWJTU Xipu Campus, Xian Road 999',
      'st-02': 'East side of Xipu Campus Library Plaza',
      'st-03': 'Near Jiaoda Xingye North Street metro exit',
      'st-04': 'South Campus Life Plaza, SWJTU Xipu Campus',
    }[store.id] || store.address
  }
  return {
    'st-01': '西南交通大学犀浦校区北门 · 犀安路 999 号',
    'st-02': '犀浦校区图书馆东侧广场',
    'st-03': '地铁 6 号线交大兴业北街站出口附近',
    'st-04': '西南交通大学犀浦校区南区生活广场',
  }[store.id] || store.address
}

function markerTap(event) {
  const id = event.detail.markerId
  const store = stores[id - 1]
  if (store) selectStore(store)
}

function openStore(store) {
  openLocation({
    latitude: store.latitude,
    longitude: store.longitude,
    name: storeName(store),
    address: storeAddress(store),
    scale: 16,
  })
}

function openCampusMap() {
  openLocation({
    latitude: campusLocation.latitude,
    longitude: campusLocation.longitude,
    name: campusName,
    scale: 17,
  })
}
</script>

<style scoped>
.map-page {
  padding: 0 0 44rpx;
  background: linear-gradient(180deg, #eef6f2 0%, #f7f9fc 52%, #ffffff 100%);
}

.map-shell {
  position: relative;
  width: calc(100% - 28rpx);
  height: min(760rpx, 46vh);
  min-height: 560rpx;
  max-height: 760rpx;
  margin: 0 14rpx;
  overflow: hidden;
  border-radius: 0 0 34rpx 34rpx;
  background: #dcefe7;
  box-shadow: 0 22rpx 64rpx rgba(15, 74, 66, 0.14);
}

.amap-container,
.native-map,
.fallback-map {
  width: 100%;
  height: 100%;
}

.fallback-map {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 52% 42%, rgba(255, 255, 255, 0.72), rgba(255, 255, 255, 0) 26%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0) 46%),
    #d7eee3;
}

.map-halo {
  position: absolute;
  border-radius: 999rpx;
  pointer-events: none;
}

.halo-north {
  left: 8%;
  top: 8%;
  width: 46%;
  height: 42%;
  background: rgba(17, 132, 116, 0.08);
  filter: blur(8rpx);
}

.halo-south {
  right: 4%;
  bottom: -10%;
  width: 44%;
  height: 50%;
  background: rgba(64, 137, 203, 0.08);
  filter: blur(10rpx);
}

.map-grid {
  position: absolute;
  inset: -18%;
  background-image:
    linear-gradient(rgba(49, 129, 103, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(49, 129, 103, 0.07) 1px, transparent 1px);
  background-size: 78rpx 78rpx;
  transform: rotate(-8deg);
}

.campus-zone {
  position: absolute;
  border: 2rpx solid rgba(15, 118, 110, 0.08);
  border-radius: 44rpx;
  background: rgba(255, 255, 255, 0.16);
}

.zone-teaching {
  left: 25%;
  top: 18%;
  width: 42%;
  height: 34%;
  transform: rotate(-8deg);
}

.zone-living {
  left: 28%;
  top: 57%;
  width: 36%;
  height: 27%;
  transform: rotate(7deg);
}

.road {
  position: absolute;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: inset 0 0 0 2rpx rgba(32, 108, 88, 0.08);
}

.road-main {
  left: 12%;
  top: 45%;
  width: 76%;
  height: 54rpx;
  transform: rotate(-8deg);
}

.road-cross {
  left: 50%;
  top: 0;
  width: 52rpx;
  height: 94%;
  transform: rotate(13deg);
}

.road-south {
  left: 23%;
  top: 70%;
  width: 56%;
  height: 42rpx;
  transform: rotate(7deg);
}

.road-ring {
  width: 25%;
  height: 34%;
  border: 28rpx solid rgba(255, 255, 255, 0.88);
  background: transparent;
  box-shadow: none;
}

.ring-west {
  left: 18%;
  top: 27%;
  transform: rotate(-12deg);
}

.ring-east {
  right: 16%;
  top: 25%;
  transform: rotate(9deg);
}

.campus-water {
  position: absolute;
  left: 8%;
  top: 16%;
  width: 180rpx;
  height: 118rpx;
  border-radius: 42rpx;
  background: linear-gradient(135deg, rgba(94, 177, 210, 0.28), rgba(94, 177, 210, 0.12));
}

.campus-block {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 118rpx;
  height: 62rpx;
  border-radius: 18rpx;
  background: rgba(16, 121, 106, 0.82);
  color: #ffffff;
  font-size: 22rpx;
  font-weight: 900;
  box-shadow: 0 14rpx 30rpx rgba(15, 87, 78, 0.18);
}

.block-library {
  left: 52%;
  top: 32%;
}

.block-gate {
  left: 67%;
  top: 22%;
}

.block-life {
  left: 39%;
  top: 66%;
}

.visual-marker {
  position: absolute;
  z-index: 3;
  min-width: 54rpx;
  height: 54rpx;
  padding: 0 14rpx;
  border: 5rpx solid #ffffff;
  border-radius: 999rpx;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 21rpx;
  font-weight: 900;
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.25);
}

.visual-marker.store {
  background: #0f766e;
}

.visual-marker.store.active {
  background: #063f3c;
  transform: translate(-50%, -50%) scale(1.12);
}

.visual-marker.scooter {
  min-width: 48rpx;
  height: 48rpx;
  background: #2563eb;
}

.visual-marker.me {
  background: #111827;
}

.map-tools {
  position: absolute;
  z-index: 5;
  right: 22rpx;
  bottom: 96rpx;
  display: grid;
  gap: 14rpx;
}

.tool-btn {
  min-width: 104rpx;
  min-height: 58rpx;
  padding: 0 18rpx;
  border-radius: 999rpx;
  background: #0f766e;
  color: #ffffff;
  font-size: 23rpx;
  font-weight: 900;
  box-shadow: 0 12rpx 28rpx rgba(15, 118, 110, 0.24);
}

.tool-btn.quiet {
  background: rgba(255, 255, 255, 0.94);
  color: #0f172a;
}

.map-source-badge {
  position: absolute;
  left: 24rpx;
  top: 24rpx;
  z-index: 6;
  display: inline-flex;
  align-items: center;
  min-height: 54rpx;
  padding: 0 20rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.94);
  color: #0f766e;
  font-size: 22rpx;
  font-weight: 900;
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.12);
}

.station-tabs {
  position: relative;
  z-index: 6;
  height: 88rpx;
  width: calc(100% - 28rpx);
  margin: -84rpx 14rpx 0;
  overflow: hidden;
  white-space: nowrap;
}

.tab-row {
  display: inline-flex;
  gap: 14rpx;
  height: 88rpx;
  padding: 0 28rpx 18rpx;
  align-items: flex-start;
}

.station-chip {
  display: inline-flex;
  align-items: center;
  gap: 10rpx;
  max-width: 300rpx;
  min-height: 58rpx;
  padding: 0 22rpx;
  border: 2rpx solid rgba(15, 118, 110, 0.12);
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.94);
  color: #111827;
  font-size: 24rpx;
  font-weight: 900;
  box-shadow: 0 12rpx 28rpx rgba(15, 23, 42, 0.12);
}

.station-chip.active {
  background: #0f766e;
  color: #ffffff;
}

.chip-dot {
  width: 16rpx;
  height: 16rpx;
  flex: 0 0 16rpx;
  border-radius: 999rpx;
  background: currentColor;
}

.locate-card {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 22rpx;
  margin: 14rpx 28rpx 18rpx;
  padding: 30rpx;
  border-radius: 28rpx;
}

.locate-copy {
  flex: 1;
  min-width: 0;
}

.title {
  display: block;
  color: #111827;
  font-size: 40rpx;
  font-weight: 900;
  line-height: 1.2;
}

.muted,
.subtle {
  display: block;
  line-height: 1.45;
}

.muted {
  margin-top: 8rpx;
  font-size: 27rpx;
}

.subtle {
  margin-top: 6rpx;
  font-size: 24rpx;
}

.locate-btn,
.compact {
  min-width: 136rpx;
  min-height: 72rpx;
  font-size: 25rpx;
  border-radius: 22rpx;
}

.store-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
  padding: 0 28rpx;
}

.store-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 28rpx;
  border-radius: 28rpx;
}

.store-card.active {
  border-color: rgba(15, 118, 110, 0.28);
  box-shadow: 0 20rpx 54rpx rgba(15, 118, 110, 0.12);
}

.store-main {
  flex: 1;
  min-width: 0;
}

.store-heading {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.card-title {
  display: block;
  min-width: 0;
  color: #111827;
  font-size: 31rpx;
  font-weight: 900;
  line-height: 1.25;
}

.store-badge {
  flex: 0 0 auto;
  padding: 8rpx 14rpx;
  border-radius: 999rpx;
  background: #e7f7f1;
  color: #087162;
  font-size: 21rpx;
  font-weight: 900;
}

:global(.amap-pin) {
  min-width: 36px;
  height: 36px;
  padding: 0 8px;
  border: 3px solid #fff;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 12px;
  font-weight: 900;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.22);
  box-sizing: border-box;
}

:global(.amap-pin--store) {
  background: #0f766e;
}

:global(.amap-pin--active) {
  background: #063f3c;
  transform: scale(1.1);
}

:global(.amap-pin--scooter) {
  min-width: 34px;
  height: 34px;
  background: #2563eb;
}

:global(.amap-pin--me) {
  background: #111827;
}

@media screen and (min-width: 960px) {
  .map-page {
    max-width: 920px;
    min-height: 100vh;
    margin: 0 auto;
    padding-bottom: 56px;
  }

  .map-shell {
    width: 100%;
    height: 420px;
    min-height: 420px;
    max-height: 420px;
    margin: 0;
    border-radius: 0 0 24px 24px;
  }

  .station-tabs {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
