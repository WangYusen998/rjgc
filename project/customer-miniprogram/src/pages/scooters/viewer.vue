<template>
  <view class="page viewer-page">
    <view v-if="model" class="hero-card viewer-card">
      <text class="kicker">3D Mode</text>
      <text class="title">{{ modelName(model) }} · {{ model.id }}</text>
      <view class="stage">
        <view class="scooter-object" :style="{ transform: `rotateY(${angle}deg) rotateX(${tilt}deg)` }">
          <image class="scooter-face front" :src="model.image" mode="aspectFill" />
          <view class="scooter-face side"></view>
        </view>
      </view>
      <text class="hint">{{ isEn ? 'Drag the sliders to rotate the scooter and preview the 3D model for presentation.' : '拖动滑杆旋转车辆，模拟 PPT/视频中可展示的 3D 车型查看。' }}</text>
    </view>

    <view class="card control-card">
      <view class="row">
        <text class="label">{{ isEn ? 'Horizontal rotation' : '水平旋转' }}</text>
        <text class="muted">{{ angle }}°</text>
      </view>
      <slider :value="angle" min="0" max="360" step="5" activeColor="#0f766e" @changing="onAngle" @change="onAngle" />
      <view class="row">
        <text class="label">{{ isEn ? 'Tilt angle' : '俯仰角度' }}</text>
        <text class="muted">{{ tilt }}°</text>
      </view>
      <slider :value="tilt" min="-20" max="20" step="2" activeColor="#0f766e" @changing="onTilt" @change="onTilt" />
      <button class="primary-btn" @tap="preview">{{ isEn ? 'Enlarge Real Scooter Photo' : '放大查看真实车辆图片' }}</button>
    </view>

    <view class="card spec-card">
      <view class="spec-row"><text>{{ isEn ? 'Top speed' : '最高速度' }}</text><text>{{ model.topSpeed }}</text></view>
      <view class="spec-row"><text>{{ isEn ? 'Range' : '续航' }}</text><text>{{ model.range }}</text></view>
      <view class="spec-row"><text>{{ isEn ? 'Motor' : '电机' }}</text><text>{{ model.motor }}</text></view>
      <view class="spec-row"><text>{{ isEn ? 'Battery' : '电池' }}</text><text>{{ model.batterySpec }}</text></view>
      <view class="spec-row"><text>{{ isEn ? 'Weight' : '重量' }}</text><text>{{ model.weight }}</text></view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getScooterModel } from '../../data/mock'
import { getLang } from '../../data/i18n'

const model = ref(null)
const angle = ref(25)
const tilt = ref(0)
const isEn = computed(() => getLang() === 'en')

onLoad((query) => {
  model.value = getScooterModel(decodeURIComponent(query.model || 'Swift One'))
})

function onAngle(event) {
  angle.value = Number(event.detail.value)
}

function onTilt(event) {
  tilt.value = Number(event.detail.value)
}

function preview() {
  uni.previewImage({ urls: [model.value.image], current: model.value.image })
}

function modelName(item) {
  if (!isEn.value) return item.name
  return { 'Swift One': 'Light Commuter', 'Swift Plus': 'Long Range', 'Swift City': 'City Durable' }[item.id] || item.name
}
</script>

<style scoped>
.viewer-page {
  gap: 24rpx;
}

.viewer-card {
  padding: 34rpx;
  background: #101114;
  color: #fff;
}

.kicker,
.title,
.hint,
.label {
  display: block;
}

.kicker {
  color: #86efac;
  font-size: 24rpx;
  font-weight: 900;
}

.title {
  margin-top: 12rpx;
  font-size: 42rpx;
  font-weight: 900;
}

.stage {
  height: 520rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 900rpx;
}

.scooter-object {
  width: 560rpx;
  height: 360rpx;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.2s ease;
}

.scooter-face {
  position: absolute;
  inset: 0;
  border-radius: 30rpx;
  overflow: hidden;
  box-shadow: 0 24rpx 50rpx rgba(0, 0, 0, 0.35);
}

.front {
  transform: translateZ(34rpx);
}

.side {
  width: 68rpx;
  left: auto;
  background: linear-gradient(180deg, #64748b, #1f2937);
  transform: rotateY(90deg) translateZ(526rpx);
  transform-origin: right center;
}

.hint {
  color: rgba(255, 255, 255, 0.74);
  font-size: 25rpx;
  line-height: 1.5;
}

.control-card,
.spec-card {
  padding: 30rpx;
}

.label {
  color: #111827;
  font-size: 27rpx;
  font-weight: 900;
}

.spec-row {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  padding: 22rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
  color: #334155;
  font-size: 27rpx;
}

.spec-row:last-child {
  border-bottom: none;
}
</style>
