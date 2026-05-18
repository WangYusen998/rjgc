<template>
  <view class="page auth-page">
    <view class="hero-card auth-hero">
      <text class="kicker">{{ isEn ? 'Create Account' : '创建账号' }}</text>
      <text class="title">{{ isEn ? 'Register before renting.' : '一分钟注册，马上能预约车辆。' }}</text>
      <text class="copy">{{ isEn ? 'China mode verifies real identity and bank card; UK mode binds a credit card.' : '中国场景完成实名认证并绑定银行卡；英国场景绑定信用卡。手机号或邮箱用于找回账号和重置密码。' }}</text>
    </view>

    <view class="card auth-card">
      <text class="label">{{ isEn ? 'Account' : '账号' }}</text>
      <input class="input" v-model="form.account" :placeholder="isEn ? 'e.g. swjtu2026' : '例如 swjtu2026'" />
      <text class="label">{{ isEn ? 'Display name' : '昵称' }}</text>
      <input class="input" v-model="form.name" :placeholder="isEn ? 'How should we call you?' : '怎么称呼你'" />
      <text class="label">{{ isEn ? 'Phone' : '手机号' }}</text>
      <input class="input" v-model="form.phone" :placeholder="isEn ? 'For account recovery' : '用于找回账号'" />
      <text class="label">{{ isEn ? 'Email' : '邮箱' }}</text>
      <input class="input" v-model="form.email" :placeholder="isEn ? 'For password reset' : '用于找回密码'" />
      <text class="label">{{ isEn ? 'Password' : '密码' }}</text>
      <input class="input" password v-model="form.password" :placeholder="isEn ? 'At least 6 characters' : '至少 6 位'" />
      <text class="label">{{ isEn ? 'Registration scenario' : '注册场景' }}</text>
      <view class="segment">
        <button :class="['segment-btn', form.country === '中国' ? 'active' : '']" @tap="form.country = '中国'">{{ isEn ? 'China: real-name + bank card' : '中国实名认证+银行卡' }}</button>
        <button :class="['segment-btn', form.country === '英国' ? 'active' : '']" @tap="form.country = '英国'">{{ isEn ? 'UK: credit card' : '英国绑信用卡' }}</button>
      </view>
      <template v-if="form.country === '中国'">
        <text class="label">{{ isEn ? 'Legal name' : '真实姓名' }}</text>
        <input class="input" v-model="form.realName" :placeholder="isEn ? 'For real-name verification demo' : '用于实名认证演示'" />
        <text class="label">{{ isEn ? 'ID number' : '证件号' }}</text>
        <input class="input" v-model="form.idNumber" :placeholder="isEn ? 'Demo only, last 4 digits are OK' : '演示用，可填后四位'" />
        <text class="label">{{ isEn ? 'Bind bank card' : '绑定银行卡' }}</text>
        <input class="input" v-model="form.bankName" :placeholder="isEn ? 'e.g. Bank of China / ICBC' : '例如 中国银行 / 工商银行'" />
        <input class="input" type="number" v-model="form.bankCardLast4" :placeholder="isEn ? 'Bank card last 4 digits' : '银行卡后四位'" />
      </template>
      <template v-else>
        <text class="label">{{ isEn ? 'Bind credit card' : '绑定信用卡' }}</text>
        <input class="input" v-model="form.bankName" :placeholder="isEn ? 'e.g. Visa / Mastercard' : '例如 Visa / Mastercard'" />
        <input class="input" type="number" v-model="form.cardLast4" :placeholder="isEn ? 'e.g. 1234' : '例如 1234'" />
      </template>
      <button class="primary-btn submit" @tap="submit">{{ isEn ? 'Register and log in' : '注册并登录' }}</button>
      <text class="login-link" @tap="goLogin">{{ isEn ? 'Already have an account' : '已有账号，直接登录' }}</text>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { registerUser, syncSessionUser } from '../../data/mock'
import { remoteRegister } from '../../data/mock'
import { getLang, setNavTitle } from '../../data/i18n'

const form = reactive({
  account: '',
  name: '',
  phone: '',
  email: '',
  password: '',
  country: '中国',
  realName: '',
  idNumber: '',
  cardLast4: '',
  bankName: '',
  bankCardLast4: '',
})
const isEn = computed(() => getLang() === 'en')

onShow(() => setNavTitle('注册', 'Register'))

async function submit() {
  if (!form.phone && !form.email) {
    uni.showToast({ title: isEn.value ? 'Enter at least phone or email' : '请至少填写手机号或邮箱', icon: 'none' })
    return
  }
  if (form.country === '中国' && (!form.realName || !form.idNumber)) {
    uni.showToast({ title: isEn.value ? 'Complete real-name verification info' : '请补全实名认证信息', icon: 'none' })
    return
  }
  if (form.country === '中国' && (!form.bankName || form.bankCardLast4.length !== 4)) {
    uni.showToast({ title: isEn.value ? 'Bind a China bank card' : '请绑定中国银行卡', icon: 'none' })
    return
  }
  if (form.country === '英国' && form.cardLast4.length !== 4) {
    uni.showToast({ title: isEn.value ? 'Enter credit card last 4 digits' : '请填写信用卡后四位', icon: 'none' })
    return
  }
  try {
    try {
      const result = await remoteRegister({
        ...form,
        identityNumber: form.idNumber,
      })
      syncSessionUser(result.user)
    } catch {
      registerUser(form)
    }
    uni.showToast({ title: isEn.value ? 'Registered' : '注册成功', icon: 'success' })
    setTimeout(() => uni.switchTab({ url: '/pages/profile/index' }), 450)
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
  font-size: 46rpx;
  font-weight: 900;
  line-height: 1.14;
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
  margin-top: 18rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 900;
}

.submit {
  margin-top: 30rpx;
}

.login-link {
  margin-top: 24rpx;
  color: #0f766e;
  font-size: 26rpx;
  font-weight: 900;
  text-align: center;
}

.segment {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14rpx;
  margin-top: 16rpx;
}

.segment-btn {
  min-height: 74rpx;
  border-radius: 20rpx;
  background: #f1f5f9;
  color: #475569;
  font-size: 24rpx;
  font-weight: 900;
}

.segment-btn.active {
  background: #101114;
  color: #fff;
}
</style>
