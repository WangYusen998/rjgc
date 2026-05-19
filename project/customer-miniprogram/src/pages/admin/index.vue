<template>
  <view class="page admin-page">
    <view class="admin-head">
      <view>
        <text class="kicker">Admin Console</text>
        <text class="title">管理员系统</text>
        <text class="copy">{{ admin.name }} · {{ admin.role }}</text>
      </view>
      <button class="logout" @tap="logout">退出</button>
    </view>

    <view class="metric-grid">
      <view class="metric"><text class="metric-value">{{ data.scooters.length }}</text><text class="metric-label">车辆</text></view>
      <view class="metric"><text class="metric-value">{{ data.bookings.length }}</text><text class="metric-label">订单</text></view>
      <view class="metric"><text class="metric-value">{{ data.finance.revenue }}</text><text class="metric-label">收入</text></view>
    </view>

    <view class="section-title"><text>管理板块</text></view>
    <view class="module-grid">
      <view v-for="item in modules" :key="item.type" class="card module-card" @tap="openModule(item)">
        <view>
          <text class="module-title">{{ item.title }}</text>
          <text class="muted">{{ item.desc }}</text>
        </view>
        <view class="module-side">
          <text class="module-count">{{ item.count }}</text>
          <text class="module-arrow">进入</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { adminDashboard, adminModuleMeta, getCurrentAdmin, logoutAdmin } from '../../data/mock'
import { fetchRemoteAdminDashboard } from '../../data/mock'

const admin = ref({})
const data = ref({ scooters: [], bookings: [], finance: { revenue: 0 } })
const modules = ref([])

onShow(async () => {
  const current = getCurrentAdmin()
  if (!current) {
    uni.redirectTo({ url: '/pages/admin/login' })
    return
  }
  admin.value = current
  data.value = adminDashboard()
  modules.value = adminModuleMeta(data.value)
  try {
    data.value = await fetchRemoteAdminDashboard()
    modules.value = adminModuleMeta(data.value)
  } catch {
    data.value = adminDashboard()
    modules.value = adminModuleMeta(data.value)
    uni.showToast({ title: '后端连接失败，当前显示离线数据', icon: 'none' })
  }
})

function openModule(item) {
  uni.navigateTo({ url: `/pages/admin/module?type=${item.type}` })
}

function logout() {
  logoutAdmin()
  uni.redirectTo({ url: '/pages/admin/login' })
}
</script>

<style scoped>
.admin-page {
  gap: 22rpx;
}

.admin-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20rpx;
  padding: 34rpx;
  border-radius: 28rpx;
  background: #101114;
  color: #fff;
}

.kicker,
.title,
.copy,
.module-title {
  display: block;
}

.kicker {
  color: #86efac;
  font-size: 23rpx;
  font-weight: 900;
}

.title {
  margin-top: 10rpx;
  font-size: 46rpx;
  font-weight: 900;
}

.copy {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 25rpx;
}

.logout {
  min-width: 112rpx;
  min-height: 62rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 24rpx;
  font-weight: 900;
}

.module-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 18rpx;
}

.module-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 28rpx;
}

.module-title {
  color: #111827;
  font-size: 32rpx;
  font-weight: 900;
}

.module-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10rpx;
}

.module-count {
  min-width: 72rpx;
  height: 72rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 22rpx;
  background: #dcfce7;
  color: #0f766e;
  font-size: 28rpx;
  font-weight: 900;
}

.module-arrow {
  color: #64748b;
  font-size: 23rpx;
  font-weight: 800;
}
</style>
