<template>
  <view class="page map-page">
    <map
      class="map"
      :latitude="center.latitude"
      :longitude="center.longitude"
      :markers="markers"
      :scale="14"
      show-location
      @markertap="markerTap"
    />

    <view class="locate-card card">
      <view>
        <text class="title">{{ isEn ? 'Campus Live Map' : '校园实时地图' }}</text>
        <text class="muted">{{ isEn ? 'Shows your location, stores, available scooters, and GPS points reported by scooter modules.' : '显示当前位置、门店、可租车辆和车辆通信模块上报的 GPS 点。' }}</text>
      </view>
      <button class="primary-btn locate-btn" @tap="locate">{{ isEn ? 'Locate' : '定位' }}</button>
    </view>

    <view class="store-list">
      <view v-for="store in rankedStores" :key="store.id" class="card store-card">
        <view>
          <text class="card-title">{{ storeName(store) }}</text>
          <text class="muted">{{ storeAddress(store) }}</text>
          <text class="subtle">{{ store.distanceText }} · {{ store.available }} {{ isEn ? 'available' : '辆可用' }} · {{ store.open }}</text>
        </view>
        <button class="ghost-btn compact" @tap="openStore(store)">{{ isEn ? 'Navigate' : '导航' }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { distanceKm, scooters, stores } from '../../data/mock'
import { getLang, setNavTitle } from '../../data/i18n'

const center = ref({ latitude: 30.7656, longitude: 103.9844 })
const located = ref(null)
const isEn = computed(() => getLang() === 'en')

const markers = computed(() => [
  ...stores.map((store, index) => ({
    id: index + 1,
    latitude: store.latitude,
    longitude: store.longitude,
    title: store.name,
    width: 28,
    height: 28,
  })),
  ...scooters
    .filter((item) => item.status === 'available')
    .map((item, index) => ({
      id: 100 + index,
      latitude: item.latitude,
      longitude: item.longitude,
      title: item.id,
      width: 24,
      height: 24,
    })),
])

const rankedStores = computed(() => {
  return stores
    .map((store) => {
      const distance = distanceKm(located.value, store)
      return { ...store, distance: distance || 999, distanceText: distance ? `${distance} km` : isEn.value ? 'Waiting for location' : '等待定位' }
    })
    .sort((a, b) => a.distance - b.distance)
})

onLoad(() => {
  setNavTitle('校园地图', 'Campus Map')
  locate()
})

function locate() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      located.value = { latitude: res.latitude, longitude: res.longitude }
      center.value = located.value
      uni.showToast({ title: isEn.value ? 'Located' : '定位成功', icon: 'success' })
    },
    fail: () => {
      uni.showToast({ title: isEn.value ? 'Location not authorized. Demo stores are shown.' : '定位未授权，已显示演示门店', icon: 'none' })
    },
  })
}

function storeName(store) {
  if (!isEn.value) return store.name
  return {
    'st-01': 'Xian Road North Gate',
    'st-02': 'Library Plaza',
    'st-03': 'Jiaoda Xingye North Street',
    'st-04': 'South Campus Plaza',
  }[store.id] || store.name
}

function storeAddress(store) {
  if (!isEn.value) return store.address
  return {
    'st-01': 'North Gate, SWJTU Xipu Campus, Xian Road 999',
    'st-02': 'East side of Xipu Campus Library Plaza',
    'st-03': 'Near Jiaoda Xingye North Street metro exit',
    'st-04': 'South Campus Life Plaza, SWJTU Xipu Campus',
  }[store.id] || store.address
}

function markerTap(event) {
  const id = event.detail.markerId
  const store = stores[id - 1]
  if (store) openStore(store)
}

function openStore(store) {
  uni.openLocation({
    latitude: store.latitude,
    longitude: store.longitude,
    name: store.name,
    address: store.address,
    scale: 16,
  })
}
</script>

<style scoped>
.map-page {
  padding-top: 0;
}

.map {
  width: 100%;
  height: 560rpx;
  border-radius: 0 0 34rpx 34rpx;
  overflow: hidden;
}

.locate-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: -52rpx;
  padding: 28rpx;
  position: relative;
}

.title {
  display: block;
  color: #111827;
  font-size: 40rpx;
  font-weight: 900;
}

.locate-btn,
.compact {
  min-width: 136rpx;
  min-height: 70rpx;
  font-size: 25rpx;
}

.store-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.store-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 26rpx;
}

.card-title {
  display: block;
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}
</style>
