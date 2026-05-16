<template>
  <view class="page">
    <view v-if="booking" class="card detail">
      <view class="row">
        <text class="title">{{ booking.id }}</text>
        <text :class="['pill', booking.status === 'ongoing' ? 'warn' : booking.status === 'cancelled' ? 'danger' : '']">
          {{ bookingStatusText(booking.status) }}
        </text>
      </view>
      <image class="scooter-image" :src="booking.scooterImage" mode="aspectFill" />
      <text class="muted">{{ booking.scooterId }} · {{ booking.scooterModel }}</text>
      <text class="subtle">{{ booking.storeName }} · {{ booking.createdAt }}</text>

      <view class="metric-grid inner">
        <view class="metric">
          <text class="metric-value">{{ booking.minutes }}</text>
          <text class="metric-label">{{ isEn ? 'Rental minutes' : '租用分钟' }}</text>
        </view>
        <view class="metric">
          <text class="metric-value">{{ booking.total }}</text>
          <text class="metric-label">{{ isEn ? 'Current amount' : '当前金额' }}</text>
        </view>
        <view class="metric">
          <text class="metric-value">{{ booking.insurance ? (isEn ? 'Selected' : '已选') : (isEn ? 'Not selected' : '未选') }}</text>
          <text class="metric-label">{{ isEn ? 'Ride insurance' : '骑行保险' }}</text>
        </view>
      </view>

      <view class="info-list">
        <view class="info-row">
          <text>{{ isEn ? 'Pickup battery' : '取车电量' }}</text>
          <text>{{ booking.startBattery }}%</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Return battery' : '还车电量' }}</text>
          <text>{{ booking.endBattery === null ? (isEn ? 'Pending' : '待录入') : `${booking.endBattery}%` }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Mileage change' : '里程变化' }}</text>
          <text>{{ booking.endMileage === null ? (isEn ? 'Riding' : '骑行中') : `${booking.startMileage} → ${booking.endMileage} km` }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Battery fee difference' : '电费差额' }}</text>
          <text>{{ booking.batteryFee || 0 }} {{ isEn ? 'CNY' : '元' }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Overdue fee' : '超时扣费' }}</text>
          <text>{{ booking.overdueFee || 0 }} {{ isEn ? 'CNY' : '元' }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Out-of-zone dispatch fee' : '异地还车调度费' }}</text>
          <text>{{ booking.dispatchFee || 0 }} {{ isEn ? 'CNY' : '元' }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Scooter damage' : '车辆损坏' }}</text>
          <text>{{ booking.damageReport || (isEn ? 'None' : '无') }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Payment method' : '支付方式' }}</text>
          <text>{{ booking.paymentMethod || (isEn ? 'Pending payment' : '待支付') }}</text>
        </view>
        <view class="info-row">
          <text>{{ isEn ? 'Latest action' : '最近操作' }}</text>
          <text>{{ isEn ? 'Waiting for user action' : (booking.lastAction || '等待用户操作') }}</text>
        </view>
      </view>

      <view class="return-form" v-if="booking.status === 'ongoing'">
        <text class="label">{{ isEn ? 'App return check' : 'APP 还车检查' }}</text>
        <input class="input" type="number" v-model="endBattery" :placeholder="isEn ? 'Return battery, e.g. 72' : '还车电量，例如 72'" />
        <input class="input" type="digit" v-model="endMileage" :placeholder="isEn ? 'Return mileage, e.g. 108' : '还车里程，例如 108'" />
        <textarea class="textarea" v-model="damageReport" :placeholder="isEn ? 'Damage report, or write None' : '车辆损坏情况，没有则填写“无”'" />
        <label class="check-row">
          <checkbox :checked="overdue" color="#0f766e" @tap="overdue = !overdue" />
          <text>{{ isEn ? 'Simulate overdue return: reminders and card/deposit charge' : '模拟超时未还，自动提醒并从信用卡/押金扣费' }}</text>
        </label>
        <button class="primary-btn" @tap="returnByApp">{{ isEn ? 'Check Return Zone and Return' : '检查还车位置并还车' }}</button>
        <button class="ghost-btn" @tap="extend">{{ isEn ? 'Extend 15 min' : '延期 15 分钟' }}</button>
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
          <checkbox-group @change="onInsuranceAgreementChange">
            <label class="check-row">
              <checkbox value="accepted" :checked="agreeInsurance" color="#0f766e" />
              <text>{{ isEn ? 'I have read and agree to the Ride Insurance and Traffic Safety Liability Agreement' : '我已阅读并同意《骑行保险与交通安全责任协议》' }}</text>
            </label>
          </checkbox-group>
          <checkbox-group @change="onDeductionAgreementChange">
            <label class="check-row">
              <checkbox value="accepted" :checked="agreeDeduction" color="#0f766e" />
              <text>{{ isEn ? 'I authorize overdue fees, damage compensation, and battery fee differences to be charged to the selected method' : '我确认可从所选付款方式扣除超时费、损坏赔偿和电费差额' }}</text>
            </label>
          </checkbox-group>
        </view>
        <button :class="['ghost-btn', canPay ? '' : 'disabled-btn']" @tap="pay">{{ isEn ? 'Confirm Agreements and Mock Pay' : '确认协议并模拟支付' }}</button>
        <button class="ghost-btn danger-btn" @tap="cancel">{{ isEn ? 'Cancel Order' : '取消订单' }}</button>
      </view>
      <view class="actions" v-else-if="booking.status === 'returned'">
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
          <checkbox-group @change="onInsuranceAgreementChange">
            <label class="check-row">
              <checkbox value="accepted" :checked="agreeInsurance" color="#0f766e" />
              <text>{{ isEn ? 'I have read and agree to the Ride Insurance and Traffic Safety Liability Agreement' : '我已阅读并同意《骑行保险与交通安全责任协议》' }}</text>
            </label>
          </checkbox-group>
          <checkbox-group @change="onDeductionAgreementChange">
            <label class="check-row">
              <checkbox value="accepted" :checked="agreeDeduction" color="#0f766e" />
              <text>{{ isEn ? 'I authorize overdue fees, damage compensation, and battery fee differences to be charged to the selected method' : '我确认可从所选付款方式扣除超时费、损坏赔偿和电费差额' }}</text>
            </label>
          </checkbox-group>
        </view>
        <button :class="['primary-btn', canPay ? '' : 'disabled-btn']" @tap="pay">{{ isEn ? 'Confirm Agreements and Mock Pay' : '确认协议并模拟支付' }}</button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import {
  bookingStatusText,
  canReturnAt,
  cancelBooking,
  extendBooking,
  finishReturn,
  mockPayBooking,
  getCurrentUser,
  readBookings,
} from '../../data/mock'
import { fetchRemoteBookings, updateRemoteBooking } from '../../data/mock'
import { getLang } from '../../data/i18n'

const booking = ref(null)
const endBattery = ref('')
const endMileage = ref('')
const damageReport = ref('无')
const overdue = ref(false)
const selectedPayment = ref('模拟钱包')
const agreeInsurance = ref(false)
const agreeDeduction = ref(false)
const user = ref(null)
const isEn = computed(() => getLang() === 'en')

const paymentMethods = computed(() => {
  const methods = ['模拟钱包']
  if (user.value?.bankCardLast4) {
    methods.push(`${user.value.bankName || '中国银行卡'} ****${user.value.bankCardLast4}`)
  }
  if (user.value?.cardLast4) {
    methods.push(`Credit Card ****${user.value.cardLast4}`)
  }
  methods.push('微信支付演示')
  return methods
})
const canPay = computed(() => Boolean(selectedPayment.value && agreeInsurance.value && agreeDeduction.value))

onLoad(async (query) => {
  user.value = getCurrentUser()
  booking.value = readBookings().find((item) => item.id === query.id)
  try {
    const remoteBookings = await fetchRemoteBookings(user.value?.account || '')
    const remoteBooking = Array.isArray(remoteBookings) ? remoteBookings.find((item) => item.id === query.id) : null
    if (remoteBooking) booking.value = remoteBooking
  } catch {
    booking.value = readBookings().find((item) => item.id === query.id)
  }
  if (user.value?.bankCardLast4) selectedPayment.value = `${user.value.bankName || '中国银行卡'} ****${user.value.bankCardLast4}`
  if (user.value?.cardLast4) selectedPayment.value = `Credit Card ****${user.value.cardLast4}`
})

async function persistBookingPatch(patch, localFallback) {
  try {
    booking.value = await updateRemoteBooking(booking.value.id, patch)
  } catch {
    booking.value = localFallback()
  }
  return booking.value
}

async function extend() {
  const nextMinutes = Number(booking.value.minutes || 0) + 15
  const extraFee = 18
  await persistBookingPatch(
    {
      minutes: nextMinutes,
      total: Number((Number(booking.value.total || 0) + extraFee).toFixed(2)),
      lastAction: `已延期 15 分钟，追加 ${extraFee} 元`,
    },
    () => extendBooking(booking.value.id, 15),
  )
  uni.showToast({ title: isEn.value ? 'Extended' : '已延期', icon: 'success' })
}

function onInsuranceAgreementChange(event) {
  agreeInsurance.value = event.detail.value.includes('accepted')
}

function onDeductionAgreementChange(event) {
  agreeDeduction.value = event.detail.value.includes('accepted')
}

async function pay() {
  if (!canPay.value) {
    uni.showToast({ title: isEn.value ? 'Choose payment and check both safety agreements' : '请先选择付款方式并勾选两个安全协议', icon: 'none' })
    return
  }
  await persistBookingPatch(
    {
      status: 'paid',
      paymentMethod: selectedPayment.value,
      lastAction: `模拟支付成功，支付方式：${selectedPayment.value}`,
    },
    () => mockPayBooking(booking.value.id, selectedPayment.value),
  )
  uni.showModal({
    title: isEn.value ? 'Mock Payment Successful' : '模拟支付成功',
    content: isEn.value ? `Order paid with ${booking.value.paymentMethod}, amount ${booking.value.total} CNY.` : `订单已支付，方式：${booking.value.paymentMethod}，金额 ${booking.value.total} 元。`,
    showCancel: false,
  })
}

function returnByApp() {
  uni.getLocation({
    type: 'gcj02',
    success: (res) => {
      const result = canReturnAt({ latitude: res.latitude, longitude: res.longitude }, booking.value.returnZoneId)
      if (!result.ok) {
        uni.showModal({
          title: isEn.value ? 'Outside Return Zone' : '未在指定还车区',
          content: isEn.value ? `You are about ${result.distanceM} m from the approved return zone. You may return out of zone with a 10 CNY dispatch fee.` : `当前距离${result.zone.name}约 ${result.distanceM} 米。可继续异地还车，但将加收 10 元调度费。`,
          cancelText: isEn.value ? 'Go to Zone' : '去指定点',
          confirmText: isEn.value ? 'Return Here' : '异地还车',
          success: (modalRes) => {
            if (!modalRes.confirm) return
            completeReturn(true, result.zone.name)
          },
        })
        return
      }
      completeReturn(false, result.zone.name)
    },
    fail: () => {
      uni.showModal({
        title: isEn.value ? 'Location Not Authorized' : '定位未授权',
        content: isEn.value ? 'The demo cannot access location. A real system requires location permission before checking return zones.' : '演示环境无法获取定位。实际系统会要求用户授权定位后检查可还车区域。',
        showCancel: false,
      })
    },
  })
}

async function completeReturn(outOfZone, zoneName) {
  const endBatteryValue = Number(endBattery.value || Math.max(Number(booking.value.startBattery || 80) - 12, 5))
  const endMileageValue = Number(endMileage.value || Number(booking.value.startMileage || 0) + 5)
  const batteryUsed = Math.max(Number(booking.value.startBattery || 0) - endBatteryValue, 0)
  const batteryFee = Number((batteryUsed * 0.12).toFixed(2))
  const overdueFee = overdue.value ? 20 : 0
  const dispatchFee = outOfZone ? 10 : 0
  const total = Number((Number(booking.value.total || 0) + batteryFee + overdueFee + dispatchFee).toFixed(2))
  await persistBookingPatch(
    {
      status: 'returned',
      endBattery: endBatteryValue,
      endMileage: endMileageValue,
      damageReport: damageReport.value,
      batteryFee,
      overdueFee,
      dispatchFee,
      returnOutOfZone: outOfZone,
      returnChecked: true,
      total,
      lastAction: outOfZone ? '未在指定还车区还车，已加收 10 元调度费。' : '已在指定还车区完成还车检查。',
    },
    () =>
      finishReturn(booking.value.id, {
    endBattery: endBattery.value,
    endMileage: endMileage.value,
    damageReport: damageReport.value,
    overdue: overdue.value,
    outOfZone,
      }),
  )
  uni.showModal({
    title: isEn.value ? 'Return Completed' : '还车完成',
    content: outOfZone
      ? (isEn.value ? `Returned out of zone with a 10 CNY dispatch fee. Final amount ${booking.value.total} CNY.` : `已异地还车并加收 10 元调度费，最终金额 ${booking.value.total} 元。`)
      : (isEn.value ? `Return-zone check passed. Final amount ${booking.value.total} CNY.` : `已通过 ${zoneName} 位置检查，最终金额 ${booking.value.total} 元。`),
    showCancel: false,
  })
}

function cancel() {
  uni.showModal({
    title: isEn.value ? 'Cancel Order' : '取消订单',
    content: isEn.value ? 'Cancelling will release the scooter and record the cancelled status. Continue?' : '取消后会释放车辆并记录取消状态，确认继续？',
    success: (res) => {
      if (!res.confirm) return
      persistBookingPatch(
        {
          status: 'cancelled',
          lastAction: '用户取消订单，车辆重新锁定并释放库存。',
        },
        () => cancelBooking(booking.value.id),
      )
      uni.showToast({ title: isEn.value ? 'Cancelled' : '已取消', icon: 'none' })
    },
  })
}
</script>

<style scoped>
.detail {
  padding: 30rpx;
}

.title {
  color: #111827;
  font-size: 40rpx;
  font-weight: 900;
}

.scooter-image {
  width: 100%;
  height: 330rpx;
  margin: 24rpx 0;
  border-radius: 28rpx;
  background: #e2e8f0;
}

.inner {
  margin-top: 30rpx;
}

.info-list {
  margin-top: 26rpx;
  border-top: 1rpx solid #e2e8f0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  padding: 20rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
  color: #334155;
  font-size: 26rpx;
}

.return-form {
  margin-top: 28rpx;
}

.label {
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}

.check-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
  margin: 24rpx 0;
  color: #111827;
  font-size: 25rpx;
}

.return-form button,
.actions button {
  margin-top: 18rpx;
}

.payment-box {
  margin-top: 28rpx;
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

.disabled-btn {
  opacity: 0.45;
}
</style>
