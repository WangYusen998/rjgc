<template>
  <view class="page auth-page">
    <view class="hero-card auth-hero">
      <text class="kicker">{{ isEn ? 'Recover Account / Password' : '找回账号 / 密码' }}</text>
      <text class="title">{{ isEn ? 'No need to register again.' : '不用重新注册。' }}</text>
      <text class="copy">{{ isEn ? 'Use the phone or email from registration to recover your account or reset password.' : '用注册时留下的手机号或邮箱找回账号，也可以为已有账号重置密码。' }}</text>
    </view>

    <view class="segmented">
      <button :class="mode === 'account' ? 'active' : ''" @tap="mode = 'account'">{{ isEn ? 'Recover Account' : '找回账号' }}</button>
      <button :class="mode === 'password' ? 'active' : ''" @tap="mode = 'password'">{{ isEn ? 'Reset Password' : '重置密码' }}</button>
    </view>

    <view v-if="mode === 'account'" class="card auth-card">
      <text class="label">{{ isEn ? 'Phone' : '手机号' }}</text>
      <input class="input" v-model="accountForm.phone" :placeholder="isEn ? 'Phone used at registration' : '注册时填写的手机号'" />
      <text class="label">{{ isEn ? 'Email' : '邮箱' }}</text>
      <input class="input" v-model="accountForm.email" :placeholder="isEn ? 'Or registered email' : '或注册邮箱'" />
      <button class="primary-btn submit" @tap="findAccount">{{ isEn ? 'Recover Account' : '找回账号' }}</button>
      <view v-if="foundAccount" class="result-box">
        <text>{{ isEn ? 'Your account is' : '你的账号是' }}</text>
        <text class="result">{{ foundAccount }}</text>
      </view>
    </view>

    <view v-else class="card auth-card">
      <text class="label">{{ isEn ? 'Account' : '账号' }}</text>
      <input class="input" v-model="passwordForm.account" :placeholder="isEn ? 'Account to reset' : '需要重置的账号'" />
      <text class="label">{{ isEn ? 'Phone or email' : '手机号或邮箱' }}</text>
      <input class="input" v-model="passwordForm.contact" :placeholder="isEn ? 'For identity verification' : '用于验证身份'" />
      <text class="label">{{ isEn ? 'New password' : '新密码' }}</text>
      <input class="input" password v-model="passwordForm.password" :placeholder="isEn ? 'At least 6 characters' : '至少 6 位'" />
      <button class="primary-btn submit" @tap="changePassword">{{ isEn ? 'Reset Password' : '重置密码' }}</button>
    </view>

    <text class="login-link" @tap="goLogin">{{ isEn ? 'Back to login' : '返回登录' }}</text>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { recoverAccount, resetPassword } from '../../data/mock'
import { getLang, setNavTitle } from '../../data/i18n'

const mode = ref('account')
const foundAccount = ref('')
const accountForm = reactive({ phone: '', email: '' })
const passwordForm = reactive({ account: '', contact: '', password: '' })
const isEn = computed(() => getLang() === 'en')

onShow(() => setNavTitle('找回账号/密码', 'Recover Account / Password'))

function findAccount() {
  try {
    foundAccount.value = recoverAccount(accountForm)
  } catch (error) {
    foundAccount.value = ''
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

function changePassword() {
  try {
    resetPassword(passwordForm)
    uni.showToast({ title: isEn.value ? 'Password reset' : '密码已重置', icon: 'success' })
    setTimeout(() => uni.redirectTo({ url: '/pages/auth/login' }), 500)
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

function goLogin() {
  uni.redirectTo({ url: '/pages/auth/login' })
}
</script>

<style scoped>
.auth-page {
  gap: 24rpx;
}

.auth-hero {
  padding: 36rpx;
  background: #101114;
  color: #fff;
}

.kicker,
.title,
.copy,
.login-link {
  display: block;
}

.kicker {
  color: #86efac;
  font-size: 24rpx;
  font-weight: 900;
}

.title {
  margin-top: 14rpx;
  font-size: 48rpx;
  font-weight: 900;
  line-height: 1.12;
}

.copy {
  margin-top: 16rpx;
  color: rgba(255, 255, 255, 0.72);
  font-size: 26rpx;
  line-height: 1.5;
}

.segmented {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12rpx;
  padding: 8rpx;
  border-radius: 24rpx;
  background: #e2e8f0;
}

.segmented button {
  min-height: 70rpx;
  border-radius: 20rpx;
  background: transparent;
  color: #475569;
  font-size: 26rpx;
  font-weight: 900;
}

.segmented button.active {
  background: #fff;
  color: #111827;
  box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.08);
}

.auth-card {
  padding: 30rpx;
}

.label {
  display: block;
  margin-top: 18rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 900;
}

.submit {
  margin-top: 30rpx;
}

.result-box {
  margin-top: 24rpx;
  padding: 24rpx;
  border-radius: 22rpx;
  background: #ecfdf5;
  color: #047857;
  font-size: 26rpx;
  font-weight: 800;
}

.result {
  display: block;
  margin-top: 8rpx;
  color: #064e3b;
  font-size: 34rpx;
  font-weight: 900;
}

.login-link {
  color: #0f766e;
  font-size: 26rpx;
  font-weight: 900;
  text-align: center;
}
</style>
