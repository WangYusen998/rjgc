<template>
  <view class="page auth-page">
    <view class="hero-card auth-hero">
      <text class="kicker">{{ isEn ? 'Log in to SwiftRide' : '登录 SwiftRide' }}</text>
      <text class="title">{{ isEn ? 'Continue your ride.' : '继续你的校园骑行。' }}</text>
      <text class="copy">{{ isEn ? 'Use account, phone, or email. Demo: student001 / 123456.' : '可用账号、手机号或邮箱登录。演示账号：student001 / 123456。' }}</text>
    </view>

    <view class="card auth-card">
      <text class="label">{{ isEn ? 'Account / phone / email' : '账号 / 手机号 / 邮箱' }}</text>
      <input class="input" v-model="form.account" placeholder="student001" />
      <text class="label">{{ isEn ? 'Password' : '密码' }}</text>
      <input class="input" password v-model="form.password" :placeholder="isEn ? 'At least 6 characters' : '至少 6 位'" />
      <button class="primary-btn submit" @tap="submit">{{ isEn ? 'Log In' : '登录' }}</button>
      <view class="auth-links">
        <text @tap="goRegister">{{ isEn ? 'Create account' : '没有账号，去注册' }}</text>
        <text @tap="goForgot">{{ isEn ? 'Forgot account/password' : '忘记账号/密码' }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { loginUser, syncSessionUser } from '../../data/mock'
import { remoteLogin } from '../../data/mock'
import { getLang, setNavTitle } from '../../data/i18n'

const form = reactive({ account: '', password: '' })
const isEn = computed(() => getLang() === 'en')

onShow(() => setNavTitle('登录', 'Log In'))

async function submit() {
  try {
    try {
      const result = await remoteLogin(form)
      syncSessionUser(result.user)
    } catch {
      loginUser(form)
    }
    uni.showToast({ title: isEn.value ? 'Logged in' : '登录成功', icon: 'success' })
    setTimeout(() => uni.switchTab({ url: '/pages/profile/index' }), 400)
  } catch (error) {
    uni.showToast({ title: error.message, icon: 'none' })
  }
}

function goRegister() {
  uni.redirectTo({ url: '/pages/auth/register' })
}

function goForgot() {
  uni.navigateTo({ url: '/pages/auth/forgot' })
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
.copy {
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

.auth-card {
  padding: 30rpx;
}

.label {
  display: block;
  margin-top: 20rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 900;
}

.submit {
  margin-top: 30rpx;
}

.auth-links {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  margin-top: 26rpx;
  color: #0f766e;
  font-size: 25rpx;
  font-weight: 900;
}
</style>
