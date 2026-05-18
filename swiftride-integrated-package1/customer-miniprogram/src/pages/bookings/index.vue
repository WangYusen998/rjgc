<template>
  <view class="page">
    <view class="card head">
      <text class="title">{{ isEn ? 'My Orders' : '我的订单' }}</text>
      <text class="muted">{{ isEn ? 'View QR rentals, store rentals, remote reservations, app returns, and exception handling.' : '查看共享扫码、到店租还、远程预约订单，支持 APP 还车和异常处理。' }}</text>
    </view>

    <view v-if="loginRequired" class="card empty-state">
      <text class="empty-title">{{ isEn ? 'Log in required' : '请先登录' }}</text>
      <text class="muted">{{ isEn ? 'Log in to view your own orders.' : '登录后才能查看你自己的订单。' }}</text>
      <button class="primary-btn" @tap="goLogin">{{ isEn ? 'Log In' : '去登录' }}</button>
    </view>

    <view v-else-if="!bookings.length" class="card empty-state">
      <text class="empty-title">{{ isEn ? 'No orders yet' : '暂无订单' }}</text>
      <text class="muted">{{ isEn ? 'Scan or choose a scooter to start your first ride.' : '去扫码或选择车辆开始第一段骑行。' }}</text>
      <button class="primary-btn" @tap="goScooters">{{ isEn ? 'Choose Scooter' : '选择车辆' }}</button>
    </view>

    <view v-else class="booking-list">
      <view v-for="item in bookings" :key="item.id" class="card booking-card" @tap="detail(item)">
        <view class="row">
          <text class="card-title">{{ item.id }}</text>
          <text :class="['pill', item.status === 'cancelled' ? 'danger' : item.status === 'ongoing' ? 'warn' : '']">
            {{ bookingStatusText(item.status) }}
          </text>
        </view>
        <text class="muted">{{ item.scooterId }} · {{ item.scooterModel }}</text>
        <text class="subtle">{{ item.storeName }} · {{ item.createdAt }}</text>
        <view class="row footer">
          <text class="price">{{ item.total }} {{ isEn ? 'CNY' : '元' }}</text>
          <text class="muted">{{ item.minutes }} {{ isEn ? 'min' : '分钟' }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { bookingStatusText, getCurrentUser, readBookings } from '../../data/mock'
import { fetchRemoteBookings } from '../../data/mock'
import { getLang, setNavTitle } from '../../data/i18n'

const bookings = ref([])
const loginRequired = ref(false)
const isEn = computed(() => getLang() === 'en')

onShow(async () => {
  setNavTitle('我的订单', 'My Orders')
  const account = getCurrentUser()?.account || ''
  if (!account) {
    loginRequired.value = true
    bookings.value = []
    return
  }

  loginRequired.value = false
  bookings.value = localUserBookings(account)
  try {
    const remoteBookings = await fetchRemoteBookings(account)
    if (Array.isArray(remoteBookings)) bookings.value = remoteBookings
  } catch {
    bookings.value = localUserBookings(account)
  }
})

function localUserBookings(account) {
  if (!account) return []
  return readBookings().filter((item) => item.account === account)
}

function detail(item) {
  uni.navigateTo({ url: `/pages/bookings/detail?id=${item.id}` })
}

function goScooters() {
  uni.switchTab({ url: '/pages/scooters/index' })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}
</script>

<style scoped>
.head,
.booking-card {
  padding: 28rpx;
}

.title {
  display: block;
  color: #111827;
  font-size: 44rpx;
  font-weight: 900;
}

.booking-list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.card-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}

.footer {
  margin-top: 20rpx;
}

.price {
  color: #0f766e;
  font-size: 30rpx;
  font-weight: 900;
}
</style>
