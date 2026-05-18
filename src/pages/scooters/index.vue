<template>
  <view class="page">
    <view class="toolbar card">
      <view>
        <text class="title">{{ isEn ? 'Nearby Scooters' : '附近车辆' }}</text>
        <text class="muted">{{ isEn ? 'Scooters are distributed around SWJTU Xipu Campus. QR unlock and store rental are supported.' : '车辆分散在西南交通大学犀浦校区周边，支持扫码解锁和门店租还。' }}</text>
      </view>
      <button class="primary-btn small-btn" @tap="scanToRide">{{ isEn ? 'Scan' : '扫码' }}</button>
    </view>

    <scroll-view scroll-x class="tabs">
      <button
        v-for="store in storeTabs"
        :key="store.id"
        :class="['tab', selectedStore === store.id ? 'active' : '']"
        @tap="selectedStore = store.id"
      >
        {{ storeName(store) }}
      </button>
    </scroll-view>

    <view class="scooter-list">
      <view v-for="item in filtered" :key="item.id" class="card scooter-row">
        <image class="scooter-photo" :src="item.image" mode="aspectFill" @tap.stop="preview(item)" />
        <view class="scooter-main">
          <view class="row">
            <text class="card-title">{{ item.id }} · {{ item.model }}</text>
            <text :class="['pill', item.status !== 'available' ? 'warn' : '']">{{ statusText(item.status) }}</text>
          </view>
          <text class="muted">{{ storeName(currentStore(item.storeId)) }}</text>
          <text class="subtle">{{ isEn ? 'Battery' : '电量' }} {{ item.battery }}% · {{ isEn ? 'Mileage' : '里程' }} {{ item.mileage }}km · GPS {{ item.lastTelemetryAt }}</text>
          <text class="subtle">{{ tv(item.commStatus) }} · {{ tv(item.lockStatus) }} · {{ item.price }} {{ isEn ? 'CNY/min' : '元/分钟' }}</text>
          <view class="actions">
            <button class="ghost-btn action" @tap="detail(item)">{{ isEn ? 'Details' : '详情' }}</button>
            <button class="ghost-btn action" @tap="viewer(item)">3D</button>
            <button
              :class="['primary-btn', 'action', item.status !== 'available' ? 'disabled' : '']"
              :disabled="item.status !== 'available'"
              @tap="book(item)"
            >
              {{ isEn ? 'Book' : '预约' }}
            </button>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { scooters, stores, getStore, statusText } from '../../data/mock'
import { fetchRemoteScooters, fetchRemoteStores } from '../../data/mock'
import { getLang, setNavTitle, translateValue } from '../../data/i18n'
import { scanCode } from '../../data/platform'
import { requireLogin } from '../../data/authGuard'

const selectedStore = ref('all')
const scooterList = ref(scooters)
const storeList = ref(stores)
const storeTabs = computed(() => [{ id: 'all', name: '全部' }, ...storeList.value])
const isEn = computed(() => getLang() === 'en')

const filtered = computed(() => {
  if (selectedStore.value === 'all') return scooterList.value
  return scooterList.value.filter((item) => item.storeId === selectedStore.value)
})

onShow(async () => {
  setNavTitle('附近车辆', 'Nearby Scooters')
  try {
    const [remoteStores, remoteScooters] = await Promise.all([fetchRemoteStores(), fetchRemoteScooters()])
    if (Array.isArray(remoteStores) && remoteStores.length) storeList.value = remoteStores
    if (Array.isArray(remoteScooters) && remoteScooters.length) scooterList.value = remoteScooters
  } catch {
    storeList.value = stores
    scooterList.value = scooters
  }
})

function tv(value) {
  return translateValue(value)
}

function storeName(store) {
  if (!store) return isEn.value ? 'All' : '全部'
  const enById = {
    all: 'All',
    'st-01': 'Xian Road North Gate',
    'st-02': 'Library Plaza',
    'st-03': 'Jiaoda Xingye North Street',
    'st-04': 'South Campus Plaza',
  }
  const zhById = {
    all: '全部',
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
  if (isEn.value) return enById[store.id] || store.name
  return zhById[store.id] || zhByEnName[store.name] || store.name
}

function currentStore(storeId) {
  return storeList.value.find((item) => item.id === storeId) || getStore(storeId)
}

function scanToRide() {
  if (!requireLogin()) return
  scanCode({
    success: (res) =>
      uni.navigateTo({ url: `/pages/booking/index?code=${encodeURIComponent(res.result)}` }),
  })
}

function book(item) {
  if (!requireLogin()) return
  uni.navigateTo({ url: `/pages/booking/index?scooterId=${item.id}` })
}

function detail(item) {
  uni.navigateTo({ url: `/pages/scooters/detail?id=${item.id}` })
}

function preview(item) {
  uni.previewImage({ urls: [item.image], current: item.image })
}

function viewer(item) {
  uni.navigateTo({ url: `/pages/scooters/viewer?model=${encodeURIComponent(item.model)}` })
}
</script>

<style scoped>
.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 28rpx;
}

.title {
  display: block;
  font-size: 44rpx;
  font-weight: 900;
}

.small-btn {
  min-width: 142rpx;
  min-height: 72rpx;
  font-size: 26rpx;
}

.tabs {
  white-space: nowrap;
}

.tab {
  display: inline-flex;
  align-items: center;
  min-height: 66rpx;
  margin-right: 14rpx;
  padding: 0 24rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #64748b;
  font-size: 25rpx;
  font-weight: 800;
}

.tab.active {
  background: #101114;
  color: #fff;
}

.scooter-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.scooter-row {
  display: flex;
  gap: 22rpx;
  padding: 24rpx;
}

.scooter-photo {
  width: 176rpx;
  height: 132rpx;
  flex: 0 0 176rpx;
  border-radius: 22rpx;
  background: #e2e8f0;
}

.scooter-main {
  flex: 1;
  min-width: 0;
}

.card-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}

.actions {
  display: flex;
  gap: 14rpx;
  margin-top: 20rpx;
}

.action {
  flex: 1;
  min-height: 70rpx;
  font-size: 25rpx;
}

.disabled {
  opacity: 0.45;
}
</style>
