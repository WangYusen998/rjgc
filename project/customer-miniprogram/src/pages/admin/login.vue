<template>
  <view class="page admin-login-page">
    <view class="hero-card hero">
      <text class="kicker">Admin</text>
      <text class="title">{{ isEn ? 'Admin Login' : '管理员登录' }}</text>
      <text class="copy">{{ isEn ? 'Demo account: admin / 123456. Log in to manage scooters, orders, stores, dispatch, faults, and finance.' : '演示账号：admin / 123456。登录后进入车辆、订单、门店、调度、故障和财务管理系统。' }}</text>
    </view>

    <view class="card form-card">
      <text class="label">{{ isEn ? 'Admin account' : '管理员账号' }}</text>
      <input class="input" v-model="form.account" placeholder="admin" />
      <text class="label">{{ isEn ? 'Password' : '密码' }}</text>
      <input class="input" password v-model="form.password" placeholder="123456" />
      <button class="primary-btn submit" @tap="submit">{{ isEn ? 'Enter Admin System' : '进入管理员系统' }}</button>
    </view>

    <view class="card ops-card" @tap="operations">
      <view>
        <text class="ops-title">{{ isEn ? 'Backend Operations Demo' : '后台运营演示' }}</text>
        <text class="ops-copy">{{ isEn ? 'View scooter telemetry, charging queue, dispatch tasks, and fault management demo.' : '查看车辆通信上报、充电队列、调度任务和故障车管理演示。' }}</text>
      </view>
      <text class="ops-link">{{ isEn ? 'Enter' : '进入' }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { loginAdmin } from '../../data/mock'
import { getLang } from '../../data/i18n'

const form = reactive({ account: 'admin', password: '123456' })
const isEn = computed(() => getLang() === 'en')

function submit() {
  try {
    loginAdmin(form)
    uni.showToast({ title: isEn.value ? 'Logged in' : '登录成功', icon: 'success' })
    setTimeout(() => uni.redirectTo({ url: '/pages/admin/index' }), 350)
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

function operations() {
  uni.navigateTo({ url: '/pages/operations/index' })
}
</script>

<style scoped>
.admin-login-page {
  gap: 24rpx;
}

.hero {
  padding: 38rpx;
  background: #101114;
  color: #fff;
}

.kicker,
.title,
.copy,
.label {
  display: block;
}

.kicker {
  color: #86efac;
  font-size: 24rpx;
  font-weight: 900;
}

.title {
  margin-top: 14rpx;
  font-size: 50rpx;
  font-weight: 900;
}

.copy {
  margin-top: 16rpx;
  color: rgba(255, 255, 255, 0.75);
  font-size: 26rpx;
  line-height: 1.5;
}

.form-card {
  padding: 30rpx;
}

.label {
  margin-top: 20rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 900;
}

.submit {
  margin-top: 30rpx;
}

.ops-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18rpx;
  padding: 28rpx;
}

.ops-title,
.ops-copy {
  display: block;
}

.ops-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}

.ops-copy {
  margin-top: 8rpx;
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.45;
}

.ops-link {
  color: #0f766e;
  font-size: 25rpx;
  font-weight: 900;
}
</style>
