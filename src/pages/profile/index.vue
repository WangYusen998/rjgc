<template>
  <view class="page profile-page">
    <view v-if="!user.account" class="profile-card guest-panel">
      <text class="kicker">{{ isEn ? 'SwiftRide Account' : 'SwiftRide 账号' }}</text>
      <text class="guest-title">{{ isEn ? 'Log in to manage your campus rides.' : '登录后管理你的校园骑行资料。' }}</text>
      <text class="muted">{{ isEn ? 'Local data can be synced to the MySQL backend after login.' : '登录后可把微信开发者工具本地数据同步到 MySQL 后端。' }}</text>
      <view class="action-row">
        <button class="primary-btn" @tap="goLogin">{{ isEn ? 'Log In' : '登录' }}</button>
        <button class="ghost-btn" @tap="goRegister">{{ isEn ? 'Register' : '注册' }}</button>
      </view>
      <text class="link" @tap="goForgot">{{ isEn ? 'Forgot account or password?' : '找回账号或重置密码' }}</text>
    </view>

    <view v-else>
      <view class="profile-card hero-panel">
        <view class="avatar">{{ initial }}</view>
        <view class="hero-text">
          <text class="name">{{ user.name || user.account }}</text>
          <text class="muted">@{{ user.account }} · {{ user.campus || defaultCampus }}</text>
        </view>
        <button class="small-btn" @tap="goLogin">{{ isEn ? 'Switch' : '切换' }}</button>
      </view>

      <view class="stats-grid">
        <view class="stat-card">
          <text class="stat-value">{{ completedCount }}</text>
          <text class="stat-label">{{ isEn ? 'Completed' : '完成骑行' }}</text>
        </view>
        <view class="stat-card">
          <text class="stat-value">{{ ongoingCount }}</text>
          <text class="stat-label">{{ isEn ? 'Ongoing' : '进行中' }}</text>
        </view>
        <view class="stat-card">
          <text class="stat-label">{{ isEn ? 'Database' : '数据库' }}</text>
        </view>
      </view>

      <view class="section-head">
        <text>{{ isEn ? 'Account Modules' : '账号资料模块' }}</text>
        <text class="link" @tap="syncNow">{{ syncing ? (isEn ? 'Syncing' : '同步中') : (isEn ? 'Sync' : '同步') }}</text>
      </view>

      <view class="module-list">
        <view class="module-card" @tap="openModule('basic')">
          <text class="module-icon">ID</text>
          <view class="module-text">
            <text class="module-title">{{ isEn ? 'Basic Profile' : '基础资料' }}</text>
            <text class="muted">{{ user.phone || (isEn ? 'Phone not set' : '未填写手机号') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="module-card" @tap="openModule('verify')">
          <text class="module-icon">PAY</text>
          <view class="module-text">
            <text class="module-title">{{ isEn ? 'Verification & Payment' : '认证与支付' }}</text>
            <text class="muted">{{ paymentSummary }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="module-card" @tap="openModule('campus')">
          <text class="module-icon">LOC</text>
          <view class="module-text">
            <text class="module-title">{{ isEn ? 'Campus & Emergency' : '校区与紧急联系人' }}</text>
            <text class="muted">{{ user.campus || defaultCampus }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view v-if="false" class="module-card" @tap="openModule('sync')">
          <text class="module-icon">DB</text>
          <view class="module-text">
            <text class="module-title">{{ isEn ? 'Sync Local Data' : '同步本地数据' }}</text>
            <text class="muted">{{ syncText || (isEn ? 'Upload local cache to MySQL' : '上传本地缓存到 MySQL') }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
        <view class="module-card" @tap="openModule('tools')">
          <text class="module-icon">SET</text>
          <view class="module-text">
            <text class="module-title">{{ isEn ? 'Account Tools' : '账号工具' }}</text>
            <text class="muted">{{ isEn ? 'Language, safety, feedback, admin' : '语言、安全、反馈、管理入口' }}</text>
          </view>
          <text class="arrow">›</text>
        </view>
      </view>

      <view v-if="activeModule" class="sheet-mask" @tap="closeModule">
        <view class="sheet" @tap.stop>
          <view class="sheet-head">
            <view>
              <text class="kicker">{{ moduleKicker }}</text>
              <text class="sheet-title">{{ moduleTitle }}</text>
            </view>
            <button class="close-btn" @tap="closeModule">×</button>
          </view>

          <view v-if="activeModule === 'basic'" class="sheet-body">
            <view class="field">
              <text class="label">{{ isEn ? 'Account' : '账号' }}</text>
              <input class="input" v-model="user.account" />
            </view>
            <view class="field">
              <text class="label">{{ isEn ? 'Name' : '昵称' }}</text>
              <input class="input" v-model="user.name" />
            </view>
            <view class="field">
              <text class="label">{{ isEn ? 'Phone' : '手机号' }}</text>
              <input class="input" v-model="user.phone" />
            </view>
            <view class="field">
              <text class="label">{{ isEn ? 'Email' : '邮箱' }}</text>
              <input class="input" v-model="user.email" />
            </view>
            <button class="primary-btn full" @tap="saveAndSync">{{ isEn ? 'Save and Sync' : '保存并同步' }}</button>
          </view>

          <view v-else-if="activeModule === 'verify'" class="sheet-body">
            <view class="field">
              <text class="label">{{ isEn ? 'Legal name' : '真实姓名' }}</text>
              <input class="input" v-model="user.realName" />
            </view>
            <view class="field">
              <text class="label">{{ isEn ? 'ID number' : '证件号' }}</text>
              <input class="input" v-model="user.idNumber" />
            </view>
            <view class="field">
              <text class="label">{{ isEn ? 'Bank name' : '银行/卡组织' }}</text>
              <input class="input" v-model="user.bankName" />
            </view>
            <view class="field">
              <text class="label">{{ isEn ? 'Bank card last 4' : '银行卡后四位' }}</text>
              <input class="input" v-model="user.bankCardLast4" />
            </view>
            <view class="field">
              <text class="label">{{ isEn ? 'Credit card last 4' : '信用卡后四位' }}</text>
              <input class="input" v-model="user.cardLast4" />
            </view>
            <button class="primary-btn full" @tap="saveAndSync">{{ isEn ? 'Save and Sync' : '保存并同步' }}</button>
          </view>

          <view v-else-if="activeModule === 'campus'" class="sheet-body">
            <view class="field">
              <text class="label">{{ isEn ? 'Campus' : '常用校区' }}</text>
              <input class="input" v-model="user.campus" />
            </view>
            <view class="field">
              <text class="label">{{ isEn ? 'Emergency contact' : '紧急联系人' }}</text>
              <input class="input" v-model="user.emergency" />
            </view>
            <text class="muted">{{ isEn ? 'Used for pickup, return-zone hints, and issue handling.' : '用于取车、还车点提示和问题反馈处理。' }}</text>
            <button class="primary-btn full" @tap="saveAndSync">{{ isEn ? 'Save and Sync' : '保存并同步' }}</button>
          </view>

          <view v-else-if="activeModule === 'sync'" class="sheet-body">
            <view class="sync-box">
              <text class="sync-title">{{ isEn ? 'Local cache to MySQL' : '本地缓存同步到 MySQL' }}</text>
              <text class="muted">{{ isEn ? 'This uploads local users, bookings, scooters, and issue reports to the backend database.' : '会把本地用户、订单、车辆状态和反馈问题上传到后端数据库。' }}</text>
              <text class="sync-result">{{ syncText || '--' }}</text>
            </view>
            <button class="primary-btn full" :disabled="syncing" @tap="syncNow">{{ syncing ? (isEn ? 'Syncing...' : '同步中...') : (isEn ? 'Sync Now' : '立即同步') }}</button>
          </view>

          <view v-else class="sheet-body">
            <button class="tool-btn" @tap="goLanguage">{{ isEn ? 'Change language' : '切换语言 / Change language' }}</button>
            <button class="tool-btn" @tap="goForgot">{{ isEn ? 'Recover account' : '找回账号 / 重置密码' }}</button>
            <button class="tool-btn" @tap="goFeedback">{{ isEn ? 'Issue report' : '车辆故障反馈' }}</button>
            <button class="tool-btn" @tap="goSafety">{{ isEn ? 'Safety and insurance' : '安全责任与保险' }}</button>
            <button class="tool-btn" @tap="goAdmin">{{ isEn ? 'Admin login' : '管理员登录' }}</button>
          </view>
        </view>
      </view>

      <button class="logout-btn" @tap="logout">{{ isEn ? 'Log Out' : '退出登录' }}</button>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import {
  fetchRemoteBookings,
  getCurrentUser,
  logoutUser,
  readBookings,
  readIssues,
  readManagedScooters,
  readUsers,
  saveProfile,
} from '../../data/mock'
import { syncLocalData } from '../../data/mock'
import { applyTabBarLanguage, getLang, setNavTitle } from '../../data/i18n'

const defaultCampus = '西南交通大学犀浦校区'

function emptyUser() {
  return {
    account: '',
    name: '',
    phone: '',
    email: '',
    country: '中国',
    realName: '',
    idNumber: '',
    bankName: '',
    bankCardLast4: '',
    cardLast4: '',
    campus: defaultCampus,
    emergency: '',
  }
}

const user = reactive(emptyUser())
const bookings = ref([])
const activeModule = ref('')
const syncing = ref(false)
const syncText = ref('')
const isEn = computed(() => getLang() === 'en')

const initial = computed(() => (user.name || user.account || 'S').slice(0, 1).toUpperCase())
const syncLabel = computed(() => (syncText.value ? 'OK' : '--'))
const completedCount = computed(() => {
  let count = 0
  bookings.value.forEach((item) => {
    if (item.status === 'paid' || item.status === 'returned') count += 1
  })
  return count
})
const ongoingCount = computed(() => {
  let count = 0
  bookings.value.forEach((item) => {
    if (item.status === 'ongoing') count += 1
  })
  return count
})
const paymentSummary = computed(() => {
  if (user.cardLast4) return `Credit Card ****${user.cardLast4}`
  if (user.bankCardLast4) return `${user.bankName || '中国银行卡'} ****${user.bankCardLast4}`
  return isEn.value ? 'No payment binding' : '未绑定支付方式'
})
const moduleKicker = computed(() => (isEn.value ? 'Account module' : '账号模块'))
const moduleTitle = computed(() => {
  const titles = {
    basic: isEn.value ? 'Basic Profile' : '基础资料',
    verify: isEn.value ? 'Verification & Payment' : '认证与支付',
    campus: isEn.value ? 'Campus & Emergency' : '校区与紧急联系人',
    sync: isEn.value ? 'Sync Local Data' : '同步本地数据',
    tools: isEn.value ? 'Account Tools' : '账号工具',
  }
  return titles[activeModule.value] || ''
})

onShow(() => {
  setNavTitle('我的', 'Profile')
  loadUser()
})

async function loadUser() {
  Object.assign(user, emptyUser())
  const current = getCurrentUser()
  if (current) Object.assign(user, current)
  bookings.value = localUserBookings()
  try {
    const remoteBookings = await fetchRemoteBookings(user.account || '')
    if (Array.isArray(remoteBookings)) bookings.value = remoteBookings
  } catch {
    bookings.value = localUserBookings()
  }
}

function localUserBookings() {
  if (!user.account) return []
  return readBookings().filter((item) => item.account === user.account)
}

function openModule(key) {
  activeModule.value = key
  uni.hideTabBar?.()
}

function closeModule() {
  activeModule.value = ''
  uni.showTabBar?.()
}

function buildSyncPayload() {
  const currentUser = { ...user }
  const users = readUsers()
  let exists = false
  users.forEach((item) => {
    if (item.account === currentUser.account) exists = true
  })
  return {
    currentUser,
    users: exists ? users : [currentUser, ...users],
    bookings: readBookings(),
    scooters: readManagedScooters(),
    issues: readIssues(),
  }
}

async function saveAndSync() {
  try {
    const saved = saveProfile({ ...user })
    if (saved) Object.assign(user, saved)
    await syncNow(false)
    uni.showToast({ title: isEn.value ? 'Saved' : '已保存', icon: 'success' })
  } catch (error) {
    uni.showToast({ title: error.message || 'Error', icon: 'none' })
  }
}

async function syncNow(showToast = true) {
  if (syncing.value) return
  syncing.value = true
  try {
    const result = await syncLocalData(buildSyncPayload())
    const synced = result.synced || {}
    syncText.value = `用户${synced.users || 0} · 订单${synced.bookings || 0} · 车辆${synced.scooters || 0} · 反馈${synced.issues || 0}`
    if (showToast) uni.showToast({ title: isEn.value ? 'Synced' : '已同步', icon: 'success' })
  } catch (error) {
    syncText.value = isEn.value ? 'Sync failed, kept locally' : '同步失败，已保留本地'
    if (showToast) uni.showToast({ title: syncText.value, icon: 'none' })
    throw error
  } finally {
    syncing.value = false
  }
}

function logout() {
  uni.showModal({
    title: isEn.value ? 'Log out' : '退出登录',
    content: isEn.value ? 'You need to log in again before booking.' : '退出后预约前需要重新登录。',
    success: (res) => {
      if (!res.confirm) return
      logoutUser()
      Object.assign(user, emptyUser())
      activeModule.value = ''
      uni.showToast({ title: isEn.value ? 'Logged out' : '已退出', icon: 'none' })
    },
  })
}

function goLogin() {
  uni.navigateTo({ url: '/pages/auth/login' })
}

function goRegister() {
  uni.navigateTo({ url: '/pages/auth/register' })
}

function goForgot() {
  closeModule()
  uni.navigateTo({ url: '/pages/auth/forgot' })
}

function goFeedback() {
  closeModule()
  uni.navigateTo({ url: '/pages/feedback/index' })
}

function goSafety() {
  closeModule()
  uni.navigateTo({ url: '/pages/safety/index' })
}

function goAdmin() {
  closeModule()
  uni.navigateTo({ url: '/pages/admin/login' })
}

function goLanguage() {
  closeModule()
  uni.reLaunch({ url: '/pages/language/index' })
  applyTabBarLanguage()
}
</script>

<style scoped>
.profile-page {
  padding-bottom: 44rpx;
}

.profile-card,
.stat-card,
.module-card,
.sheet {
  background: #ffffff;
  border: 1rpx solid #e2e8f0;
  border-radius: 16rpx;
  box-shadow: 0 10rpx 26rpx rgba(15, 23, 42, 0.05);
}

.guest-panel {
  padding: 36rpx;
}

.kicker {
  display: block;
  color: #0f766e;
  font-size: 22rpx;
  font-weight: 800;
  letter-spacing: 0;
}

.guest-title {
  display: block;
  margin-top: 12rpx;
  color: #111827;
  font-size: 42rpx;
  font-weight: 900;
  line-height: 1.25;
}

.muted {
  color: #64748b;
  font-size: 24rpx;
  line-height: 1.45;
}

.action-row {
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.primary-btn,
.ghost-btn,
.small-btn,
.tool-btn,
.logout-btn {
  border-radius: 12rpx;
  font-size: 26rpx;
}

.primary-btn {
  background: #0f766e;
  color: #ffffff;
  font-weight: 800;
}

.ghost-btn,
.small-btn,
.tool-btn {
  background: #f8fafc;
  color: #0f172a;
  border: 1rpx solid #dbe4ee;
}

.link {
  color: #0f766e;
  font-size: 24rpx;
  font-weight: 800;
}

.hero-panel {
  display: flex;
  align-items: center;
  gap: 22rpx;
  padding: 28rpx;
}

.avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 94rpx;
  height: 94rpx;
  border-radius: 50%;
  background: #0f766e;
  color: #ffffff;
  font-size: 38rpx;
  font-weight: 900;
}

.hero-text {
  flex: 1;
  min-width: 0;
}

.name {
  display: block;
  color: #111827;
  font-size: 34rpx;
  font-weight: 900;
}

.small-btn {
  width: 120rpx;
  height: 58rpx;
  line-height: 58rpx;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-top: 18rpx;
}

.stats-grid .stat-card:nth-child(3),
.section-head .link {
  display: none;
}

.stat-card {
  padding: 22rpx 10rpx;
  text-align: center;
}

.stat-value {
  display: block;
  color: #111827;
  font-size: 34rpx;
  font-weight: 900;
}

.stat-label {
  display: block;
  margin-top: 6rpx;
  color: #64748b;
  font-size: 22rpx;
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 32rpx 4rpx 16rpx;
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}

.module-list {
  display: flex;
  flex-direction: column;
  gap: 16rpx;
}

.module-card {
  display: flex;
  align-items: center;
  gap: 18rpx;
  padding: 24rpx;
}

.module-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 76rpx;
  height: 76rpx;
  border-radius: 14rpx;
  background: #ecfeff;
  color: #0f766e;
  font-size: 22rpx;
  font-weight: 900;
}

.module-text {
  flex: 1;
  min-width: 0;
}

.module-title {
  display: block;
  color: #111827;
  font-size: 28rpx;
  font-weight: 900;
}

.arrow {
  color: #94a3b8;
  font-size: 42rpx;
}

.sheet-mask {
  position: fixed;
  inset: 0;
  z-index: 2147483647;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32rpx;
  box-sizing: border-box;
  background: rgba(15, 23, 42, 0.36);
}

.sheet {
  width: 100%;
  max-width: 920rpx;
  height: min(72vh, 820rpx);
  padding: 30rpx 30rpx 0;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sheet-head {
  flex: 0 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16rpx;
}

.sheet-title {
  display: block;
  margin-top: 8rpx;
  color: #111827;
  font-size: 34rpx;
  font-weight: 900;
}

.close-btn {
  width: 58rpx;
  height: 58rpx;
  line-height: 54rpx;
  border-radius: 50%;
  background: #f1f5f9;
  color: #0f172a;
  font-size: 34rpx;
}

.sheet-body {
  flex: 1;
  min-height: 0;
  margin-top: 24rpx;
  padding-bottom: 30rpx;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.field {
  margin-bottom: 18rpx;
}

.label {
  display: block;
  margin-bottom: 10rpx;
  color: #475569;
  font-size: 23rpx;
  font-weight: 800;
}

.input {
  height: 78rpx;
  padding: 0 22rpx;
  border-radius: 12rpx;
  background: #f8fafc;
  border: 1rpx solid #dbe4ee;
  color: #111827;
  font-size: 27rpx;
}

.full {
  width: 100%;
  margin-top: 12rpx;
}

.sync-box {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
  padding: 24rpx;
  border-radius: 14rpx;
  background: #f8fafc;
}

.sync-title {
  color: #111827;
  font-size: 28rpx;
  font-weight: 900;
}

.sync-result {
  color: #0f766e;
  font-size: 26rpx;
  font-weight: 900;
}

.tool-btn {
  width: 100%;
  margin-bottom: 14rpx;
  text-align: left;
}

.logout-btn {
  width: 100%;
  margin-top: 24rpx;
  background: #fff1f2;
  color: #be123c;
  border: 1rpx solid #fecdd3;
  font-weight: 800;
}
</style>
