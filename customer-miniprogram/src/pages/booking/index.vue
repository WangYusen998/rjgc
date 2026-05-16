<template>
  <view class="page booking-page">
    <view class="card booking-head">
      <text class="title">{{ isEn ? 'Book Scooter' : '预约用车' }}</text>
      <text class="muted">{{ isEn ? 'Choose rental mode, model, and insurance. Pricing updates automatically by model.' : '选择租赁方式、车型和保险，系统会按车型自动调整租金。' }}</text>
    </view>

    <view class="mode-strip">
      <button
        v-for="mode in rentalModes"
        :key="mode.id"
        :class="['mode-tab', selectedMode === mode.id ? 'active' : '']"
        @tap="selectedMode = mode.id"
      >
        {{ modeText(mode.scene) }}
      </button>
    </view>

    <view class="card mode-card">
      <text class="mode-title">{{ modeText(currentMode.name) }} · {{ modeText(currentMode.scene) }}</text>
      <text class="muted">{{ modeText(currentMode.requirement) }}</text>
    </view>

    <view class="model-strip">
      <view
        v-for="model in scooterModels"
        :key="model.id"
        :class="['model-card', selectedModel === model.id ? 'active' : '']"
        @tap="selectModel(model)"
      >
        <image class="model-thumb" :src="model.image" mode="aspectFill" />
        <text class="model-name">{{ modelName(model) }}</text>
        <text class="model-price">{{ model.price }} {{ isEn ? 'CNY/min' : '元/分钟' }}</text>
      </view>
    </view>

    <view v-if="scooter" class="card scooter-panel">
      <image class="scooter-image" :src="model.image" mode="aspectFill" :style="{ transform: `rotateY(${rotate}deg)` }" @tap="previewImage" />
      <slider :value="rotate" min="0" max="360" step="15" activeColor="#0f766e" @change="onRotate" />
      <text class="hint">{{ isEn ? 'Drag the slider to simulate 3D rotation. Tap the image to enlarge.' : '拖动滑杆模拟 3D 旋转，点击图片可放大查看。' }}</text>
      <button class="ghost-btn viewer-btn" @tap="open3d">{{ isEn ? 'Open Full 3D View' : '进入完整 3D 模式' }}</button>

      <view class="row">
        <text class="card-title">{{ scooter.id }} · {{ modelName(model) }}</text>
        <text class="pill">{{ statusText(scooter.status) }}</text>
      </view>
      <text class="muted">{{ storeName(store) }} · {{ storeAddress(store) }}</text>
      <text class="subtle">{{ isEn ? 'Module' : '通信模块' }}: {{ tv(scooter.commStatus) }} · {{ isEn ? 'E-lock' : '电子锁' }}: {{ tv(scooter.lockStatus) }}</text>

      <view class="metric-grid inner">
        <view class="metric">
          <text class="metric-value">{{ scooter.battery }}%</text>
          <text class="metric-label">{{ isEn ? 'Start battery' : '租时电量' }}</text>
        </view>
        <view class="metric">
          <text class="metric-value">{{ scooter.mileage }}</text>
          <text class="metric-label">{{ isEn ? 'Current mileage' : '当前里程' }}</text>
        </view>
        <view class="metric">
          <text class="metric-value">{{ model.range }}</text>
          <text class="metric-label">{{ isEn ? 'Rated range' : '标称续航' }}</text>
        </view>
      </view>

      <view class="spec-list">
        <text>{{ isEn ? 'Top speed' : '极速' }} {{ model.topSpeed }}</text>
        <text>{{ isEn ? 'Motor' : '电机' }} {{ model.motor }}</text>
        <text>{{ isEn ? 'Battery' : '电池' }} {{ model.batterySpec }}</text>
      </view>
      <text class="description">{{ modelDescription(model) }}</text>
    </view>

    <view v-else class="card empty-state">
      <text class="empty-title">{{ isEn ? 'Scooter not found' : '未找到车辆' }}</text>
      <text class="muted">{{ isEn ? 'Scan again or choose an available scooter from the list.' : '请重新扫码，或从车辆列表选择一辆可用车辆。' }}</text>
      <button class="primary-btn" @tap="scanAgain">{{ isEn ? 'Scan Again' : '重新扫码' }}</button>
    </view>

    <view class="card form-card">
      <text class="label">{{ isEn ? 'Rental duration' : '租用时长' }}</text>
      <slider :value="minutes" min="15" max="180" step="15" activeColor="#0f766e" @change="onMinutes" />
      <view class="row">
        <text class="muted">{{ minutes }} {{ isEn ? 'min' : '分钟' }}</text>
        <text class="price">{{ isEn ? 'Estimated' : '预计' }} {{ total }} {{ isEn ? 'CNY' : '元' }}</text>
      </view>
      <label class="check-row">
        <checkbox :checked="insurance" color="#0f766e" @tap="insurance = !insurance" />
        <text>{{ isEn ? 'Add ride insurance and liability statement (CNY 2)' : '加入骑行保险与责任声明（2 元）' }}</text>
      </label>

      <view class="payment-box">
        <text class="label">{{ isEn ? 'Payment method' : '付款方式' }}</text>
        <view class="payment-grid">
          <button
            v-for="method in paymentMethods"
            :key="method"
            :class="['pay-method', selectedPayment === method ? 'active' : '']"
            @tap="selectedPayment = method"
          >
            {{ method }}
          </button>
        </view>
        <checkbox-group @change="onSafetyAgreementChange">
          <label class="check-row compact-check">
            <checkbox value="accepted" :checked="agreeSafety" color="#0f766e" />
            <text>{{ isEn ? 'I have read and agree to the Ride Insurance and Traffic Safety Liability Agreement' : '我已阅读并同意《骑行保险与交通安全责任协议》' }}</text>
          </label>
        </checkbox-group>
        <checkbox-group @change="onDeductionAgreementChange">
          <label class="check-row compact-check">
            <checkbox value="accepted" :checked="agreeDeduction" color="#0f766e" />
            <text>{{ isEn ? 'I authorize overdue fees, damage compensation, and battery fee differences to be charged to the selected method' : '我确认可从所选付款方式扣除超时费、损坏赔偿和电费差额' }}</text>
          </label>
        </checkbox-group>
      </view>

      <button :class="['primary-btn', !canSubmit ? 'disabled-btn' : '']" @tap="submit">
        {{ isEn ? 'Confirm Payment, Book, and Unlock' : '确认付款、下单并扫码解锁' }}
      </button>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  createBooking,
  getCurrentUser,
  getScooter,
  getScooterModel,
  getStore,
  getAvailableScooters,
  rentalModes,
  scooterModels,
  statusText,
} from '../../data/mock'
import { createRemoteBooking } from '../../data/mock'
import { getLang, setNavTitle, translateValue } from '../../data/i18n'

const scooter = ref(null)
const selectedModel = ref('Swift One')
const selectedMode = ref('sharing-cn')
const minutes = ref(30)
const insurance = ref(true)
const rotate = ref(0)
const user = ref(null)
const selectedPayment = ref('模拟钱包')
const agreeSafety = ref(false)
const agreeDeduction = ref(false)
const isEn = computed(() => getLang() === 'en')

const model = computed(() => getScooterModel(selectedModel.value))
const currentMode = computed(() => rentalModes.find((item) => item.id === selectedMode.value) || rentalModes[0])
const store = computed(() => (scooter.value ? getStore(scooter.value.storeId) : {}))
const paymentMethods = computed(() => {
  const methods = [isEn.value ? 'Mock Wallet' : '模拟钱包']
  if (user.value?.bankCardLast4) {
    methods.push(`${isEn.value ? 'China bank card' : user.value.bankName || '中国银行卡'} ****${user.value.bankCardLast4}`)
  }
  if (user.value?.cardLast4) {
    methods.push(`Credit Card ****${user.value.cardLast4}`)
  }
  methods.push(isEn.value ? 'WeChat Pay Demo' : '微信支付演示')
  return methods
})
const canSubmit = computed(() =>
  Boolean(scooter.value && scooter.value.status === 'available' && selectedPayment.value && agreeSafety.value && agreeDeduction.value),
)
const total = computed(() => {
  if (!scooter.value) return '0.00'
  const base =
    selectedMode.value === 'walk-in' || selectedMode.value === 'remote-store'
      ? model.value.storePrice
      : model.value.price * minutes.value
  const deposit = selectedMode.value === 'walk-in' ? model.value.deposit : 0
  return (base + deposit + (insurance.value ? 2 : 0)).toFixed(2)
})

onLoad((query) => {
  setNavTitle('预约用车', 'Book Scooter')
  user.value = getCurrentUser()
  const id = query.scooterId || decodeURIComponent(query.code || '')
  scooter.value = getScooter(id) || getAvailableScooters()[0]
  if (scooter.value) selectedModel.value = scooter.value.model
  if (user.value?.bankCardLast4) selectedPayment.value = `${isEn.value ? 'China bank card' : user.value.bankName || '中国银行卡'} ****${user.value.bankCardLast4}`
  if (user.value?.cardLast4) selectedPayment.value = `Credit Card ****${user.value.cardLast4}`
})

function selectModel(modelItem) {
  selectedModel.value = modelItem.id
  const match = getAvailableScooters().find((item) => item.model === modelItem.id)
  if (match) scooter.value = match
}

function tv(value) {
  return translateValue(value)
}

function modelName(item) {
  if (!isEn.value) return item.name
  return { 'Swift One': 'Light Commuter', 'Swift Plus': 'Long Range', 'Swift City': 'City Durable' }[item.id] || item.name
}

function modelDescription(item) {
  if (!isEn.value) return item.description
  return {
    'Swift One': 'Lightweight and gentle acceleration for short campus trips and new riders.',
    'Swift Plus': 'Longer range, front suspension, and a larger deck for campus-to-metro connections.',
    'Swift City': 'Stable tires and a durable frame for store rental and high-frequency deployment.',
  }[item.id] || item.description
}

function modeText(value) {
  if (!isEn.value) return value
  return {
    共享扫码租车: 'Shared QR Rental',
    中国校园: 'China Campus',
    英国城市: 'UK City',
    门店: 'Store',
    '网页/APP 预约': 'Web/App Reservation',
    到店租还: 'Walk-in Store Rental',
    远程预约到店取车: 'Remote Reservation, Store Pickup',
    '注册时完成实名认证，扫码解锁，APP 内检查还车点后还车。': 'Complete real-name verification, scan to unlock, and return after app return-zone check.',
    '注册时绑定信用卡，扫码解锁，APP 内检查还车点后还车。': 'Bind a credit card, scan to unlock, and return after app return-zone check.',
    '店员录入资料并绑定信用卡，到店取车、到店还车。': 'Store staff records user details and binds a credit card. Pickup and return are handled in store.',
    '线上选择车型和门店，到店验车取车，到店还车结算。': 'Select model and store online, inspect and pick up in store, then return and settle in store.',
  }[value] || value
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

function onMinutes(event) {
  minutes.value = Number(event.detail.value)
}

function onRotate(event) {
  rotate.value = Number(event.detail.value)
}

function onSafetyAgreementChange(event) {
  agreeSafety.value = event.detail.value.includes('accepted')
}

function onDeductionAgreementChange(event) {
  agreeDeduction.value = event.detail.value.includes('accepted')
}

function previewImage() {
  uni.previewImage({ urls: [model.value.image], current: model.value.image })
}

function open3d() {
  uni.navigateTo({ url: `/pages/scooters/viewer?model=${encodeURIComponent(model.value.id)}` })
}

function scanAgain() {
  uni.scanCode({
    success: (res) => {
      scooter.value = getScooter(res.result)
      if (scooter.value) selectedModel.value = scooter.value.model
    },
  })
}

async function submit() {
  if (!scooter.value || scooter.value.status !== 'available') {
    uni.showToast({ title: isEn.value ? 'This scooter is not available' : '当前车辆不可预约', icon: 'none' })
    return
  }
  if (!selectedPayment.value) {
    uni.showToast({ title: isEn.value ? 'Please choose a payment method' : '请先选择付款方式', icon: 'none' })
    return
  }
  if (!agreeSafety.value || !agreeDeduction.value) {
    uni.showToast({ title: isEn.value ? 'Please confirm both safety agreements' : '请勾选两个安全协议确认', icon: 'none' })
    return
  }
  const payload = {
    account: user.value?.account || 'student001',
    scooterId: scooter.value.id,
    minutes: minutes.value,
    insurance: insurance.value,
    rentalMode: selectedMode.value,
    quotedTotal: Number(total.value),
    paymentMethod: selectedPayment.value,
    safetyAccepted: agreeSafety.value,
    deductionAccepted: agreeDeduction.value,
  }
  let booking
  try {
    booking = await createRemoteBooking(payload)
  } catch {
    booking = createBooking(payload)
  }
  uni.showModal({
    title: isEn.value ? 'Payment Confirmed and Unlock Sent' : '付款确认并解锁',
    content: isEn.value
      ? `Paid ${booking.total} CNY with ${selectedPayment.value}. Unlock command sent to ${booking.scooterId}.`
      : `已使用 ${selectedPayment.value} 模拟支付 ${booking.total} 元。${booking.unlockMessage}`,
    showCancel: false,
    success: () => uni.navigateTo({ url: `/pages/bookings/detail?id=${booking.id}` }),
  })
}
</script>

<style scoped>
.booking-page {
  gap: 22rpx;
}

.booking-head,
.scooter-panel,
.form-card,
.mode-card {
  padding: 30rpx;
}

.title {
  display: block;
  color: #111827;
  font-size: 44rpx;
  font-weight: 900;
}

.mode-strip,
.model-strip {
  display: flex;
  gap: 16rpx;
  overflow-x: auto;
  padding-bottom: 6rpx;
}

.mode-tab {
  min-width: 190rpx;
  min-height: 70rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #475569;
  font-size: 24rpx;
  font-weight: 900;
}

.mode-tab.active {
  background: #101114;
  color: #fff;
}

.mode-title,
.model-name,
.model-price,
.card-title,
.description {
  display: block;
}

.mode-title {
  margin-bottom: 10rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}

.model-card {
  min-width: 230rpx;
  padding: 16rpx;
  border: 2rpx solid transparent;
  border-radius: 26rpx;
  background: #fff;
}

.model-card.active {
  border-color: #0f766e;
}

.model-thumb {
  width: 100%;
  height: 130rpx;
  border-radius: 20rpx;
}

.model-name {
  margin-top: 12rpx;
  color: #111827;
  font-size: 27rpx;
  font-weight: 900;
}

.model-price {
  margin-top: 4rpx;
  color: #0f766e;
  font-size: 23rpx;
  font-weight: 800;
}

.scooter-image {
  width: 100%;
  height: 390rpx;
  border-radius: 28rpx;
  background: #e2e8f0;
}

.hint {
  display: block;
  margin-bottom: 18rpx;
  color: #64748b;
  font-size: 23rpx;
}

.card-title {
  color: #111827;
  font-size: 31rpx;
  font-weight: 900;
}

.inner {
  margin-top: 24rpx;
}

.spec-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12rpx;
  margin-top: 22rpx;
}

.spec-list text {
  padding: 10rpx 16rpx;
  border-radius: 999rpx;
  background: #f1f5f9;
  color: #334155;
  font-size: 23rpx;
  font-weight: 800;
}

.description {
  margin-top: 18rpx;
  color: #475569;
  font-size: 25rpx;
  line-height: 1.5;
}

.label {
  display: block;
  margin-bottom: 20rpx;
  color: #111827;
  font-size: 28rpx;
  font-weight: 900;
}

.price {
  color: #0f766e;
  font-size: 30rpx;
  font-weight: 900;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 28rpx 0;
  color: #111827;
  font-size: 27rpx;
}

.viewer-btn {
  margin-bottom: 20rpx;
}

.payment-box {
  margin: 28rpx 0;
  padding: 22rpx;
  border: 2rpx solid #e2e8f0;
  border-radius: 24rpx;
  background: #f8fafc;
}

.payment-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14rpx;
  margin-top: 18rpx;
}

.pay-method {
  min-height: 74rpx;
  border: 2rpx solid #dbe5ef;
  border-radius: 20rpx;
  background: #fff;
  color: #334155;
  font-size: 25rpx;
  font-weight: 900;
}

.pay-method.active {
  border-color: #0f766e;
  background: #dcfce7;
  color: #0f5132;
}

.compact-check {
  margin: 18rpx 0 0;
  align-items: flex-start;
}

.disabled-btn {
  opacity: 0.45;
}
</style>
