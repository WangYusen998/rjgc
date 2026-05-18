<template>
  <view class="page">
    <view v-if="scooter" class="card detail">
      <view class="row">
        <text class="title">{{ scooter.id }}</text>
        <text :class="['pill', scooter.status !== 'available' ? 'warn' : '']">{{ statusText(scooter.status) }}</text>
      </view>
      <text class="muted">{{ scooter.model }} · {{ storeName(store) }}</text>
      <text class="subtle">{{ storeAddress(store) }}</text>

      <view class="inline-3d">
        <view class="stage">
          <view class="scooter-object" :style="{ transform: `rotateY(${angle}deg) rotateX(${tilt}deg)` }">
            <image class="scooter-face front" :src="scooter.image" mode="aspectFill" @tap="preview" />
            <view class="scooter-face side"></view>
          </view>
        </view>
        <view class="row">
          <text class="three-title">{{ isEn ? 'Scooter 3D Mode' : '车辆 3D 模式' }}</text>
          <text class="muted">{{ angle }}°</text>
        </view>
        <slider :value="angle" min="0" max="360" step="10" activeColor="#0f766e" @changing="onAngle" @change="onAngle" />
        <slider :value="tilt" min="-18" max="18" step="3" activeColor="#0f766e" @changing="onTilt" @change="onTilt" />
        <text class="subtle">{{ isEn ? 'Drag the sliders to rotate the scooter. Tap the image to enlarge the real scooter photo.' : '拖动滑杆可旋转车辆；点击车辆图片可放大查看真实车辆图。' }}</text>
      </view>

      <view class="metric-grid inner">
        <view class="metric">
          <text class="metric-value">{{ scooter.battery }}%</text>
          <text class="metric-label">{{ isEn ? 'Live battery' : '实时电量' }}</text>
        </view>
        <view class="metric">
          <text class="metric-value">{{ scooter.rangeKm }}</text>
          <text class="metric-label">{{ isEn ? 'Range km' : '续航 km' }}</text>
        </view>
        <view class="metric">
          <text class="metric-value">{{ scooter.mileage }}</text>
          <text class="metric-label">{{ isEn ? 'Mileage' : '行驶里程' }}</text>
        </view>
      </view>

      <view class="info-list">
        <view class="info-row">
          <text>{{ isEn ? 'QR code' : '二维码编号' }}</text>
          <text>{{ scooter.qr }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Communication module' : '通信模块' }}</text>
          <text>{{ tv(scooter.commStatus) }} · {{ scooter.lastTelemetryAt }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'E-lock' : '电子锁' }}</text>
          <text>{{ tv(scooter.lockStatus) }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Helmet' : '头盔' }}</text>
          <text>{{ scooter.helmet ? (isEn ? 'Available' : '可用') : (isEn ? 'Missing' : '缺失') }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Price' : '租金' }}</text>
          <text>{{ scooter.price }} {{ isEn ? 'CNY/min' : '元/分钟' }}</text>
        </view>
      </view>

      <button class="primary-btn" :disabled="scooter.status !== 'available'" @tap="book">{{ isEn ? 'Book This Scooter' : '预约这辆车' }}</button>
      <button class="ghost-btn" @tap="viewer">{{ isEn ? 'View 3D Mode' : '3D 模式查看' }}</button>
      <button class="ghost-btn" @tap="openLocation">{{ isEn ? 'View Location' : '查看位置' }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { fetchRemoteScooters, getScooter, getScooterModel, getStore, statusText } from '../../data/mock'
import { getLang, translateValue } from '../../data/i18n'
import { openLocation as openMapLocation } from '../../data/platform'
import { requireLogin } from '../../data/authGuard'

const scooter = ref(null)
const store = computed(() => (scooter.value ? getStore(scooter.value.storeId) : {}))
const model = computed(() => (scooter.value ? getScooterModel(scooter.value.model) : null))
const angle = ref(25)
const tilt = ref(0)
const isEn = computed(() => getLang() === 'en')

onLoad(async (query) => {
  scooter.value = getScooter(query.id)
  try {
    const list = await fetchRemoteScooters()
    if (Array.isArray(list) && list.length) {
      scooter.value = list.find((item) => item.id === query.id || item.qr === query.id) || scooter.value
    }
  } catch {
    // Keep local demo data when the backend is unavailable.
  }
})

function book() {
  if (!requireLogin()) return
  uni.navigateTo({ url: `/pages/booking/index?scooterId=${scooter.value.id}` })
}

function openLocation() {
  openMapLocation({
    latitude: scooter.value.latitude,
    longitude: scooter.value.longitude,
    name: scooter.value.id,
    address: store.value.address,
  })
}

function preview() {
  uni.previewImage({ urls: [scooter.value.image], current: scooter.value.image })
}

function viewer() {
  uni.navigateTo({ url: `/pages/scooters/viewer?model=${encodeURIComponent(scooter.value.model)}` })
}

function onAngle(event) {
  angle.value = Number(event.detail.value)
}

function onTilt(event) {
  tilt.value = Number(event.detail.value)
}

function tv(value) {
  return translateValue(value)
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
</script>

<style scoped>
.detail {
  display: flex;
  flex-direction: column;
  gap: 22rpx;
  padding: 30rpx;
}

.title {
  color: #111827;
  font-size: 46rpx;
  font-weight: 900;
}

.inner {
  margin-top: 6rpx;
}

.inline-3d {
  padding: 24rpx;
  border-radius: 28rpx;
  background: #101114;
  color: #fff;
}

.stage {
  height: 390rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 900rpx;
}

.scooter-object {
  width: 560rpx;
  height: 310rpx;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.2s ease;
}

.scooter-face {
  position: absolute;
  inset: 0;
  border-radius: 26rpx;
  overflow: hidden;
  box-shadow: 0 20rpx 44rpx rgba(0, 0, 0, 0.36);
}

.front {
  transform: translateZ(32rpx);
}

.side {
  width: 64rpx;
  left: auto;
  background: linear-gradient(180deg, #64748b, #1f2937);
  transform: rotateY(90deg) translateZ(526rpx);
  transform-origin: right center;
}

.three-title {
  color: #fff;
  font-size: 28rpx;
  font-weight: 900;
}

.info-list {
  border-top: 1rpx solid #e2e8f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 20rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
  color: #334155;
  font-size: 27rpx;
}
</style>
