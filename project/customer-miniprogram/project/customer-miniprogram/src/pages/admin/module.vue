<template>
  <view class="page admin-module-page">
    <view class="module-head">
      <view>
        <text class="kicker">Admin Module</text>
        <text class="title">{{ currentModule.title }}</text>
        <text class="copy">{{ currentModule.desc }}</text>
      </view>
      <button class="small-btn" @tap="reload">刷新</button>
    </view>

    <view v-if="type === 'overview'" class="section-list">
      <view class="metric-grid">
        <view class="metric"><text class="metric-value">{{ dashboard.usage.activeUsers }}</text><text class="metric-label">注册用户</text></view>
        <view class="metric"><text class="metric-value">{{ dashboard.usage.availableScooters }}</text><text class="metric-label">可用车辆</text></view>
        <view class="metric"><text class="metric-value">{{ dashboard.usage.totalMinutes }}</text><text class="metric-label">租用分钟</text></view>
      </view>
      <view class="card manage-card">
        <text class="item-title">需求覆盖</text>
        <view class="requirement-grid">
          <text>FR27 用户记录：{{ dashboard.users.length }} 条</text>
          <text>FR28 预订记录：{{ dashboard.bookings.length }} 条</text>
          <text>FR29 收入统计：{{ dashboard.finance.revenue }} 元</text>
          <text>FR30 价格配置：{{ dashboard.priceSettings.length }} 个车型</text>
          <text>FR24 问题查看：{{ dashboard.issues.length }} 条</text>
          <text>FR31 折扣促销：{{ dashboard.promotions.length }} 个规则</text>
        </view>
      </view>
      <view class="card manage-card">
        <text class="item-title">系统使用情况</text>
        <view class="fee-list">
          <view><text>进行中订单</text><text>{{ dashboard.usage.activeOrders }}</text></view>
          <view><text>已还车订单</text><text>{{ dashboard.finance.returned }}</text></view>
          <view><text>待处理问题</text><text>{{ openIssues }}</text></view>
          <view><text>当前启用促销</text><text>{{ activePromotions }}</text></view>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'users'" class="section-list">
      <view v-for="item in dashboard.frequentUsers" :key="item.account" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.name }} · {{ item.account }}</text>
            <text class="muted">{{ item.phone || item.email || '未填写联系方式' }}</text>
          </view>
          <text class="stock">{{ item.country }}</text>
        </view>
        <view class="fee-list">
          <view><text>实名认证</text><text>{{ item.realNameVerified ? '已完成' : '未完成' }}</text></view>
          <view><text>银行卡</text><text>{{ item.bankCardLast4 ? `****${item.bankCardLast4}` : '未绑定' }}</text></view>
          <view><text>信用卡</text><text>{{ item.cardLast4 ? `****${item.cardLast4}` : '未绑定' }}</text></view>
          <view><text>历史订单</text><text>{{ item.bookingCount }} 单</text></view>
          <view><text>高频用户</text><text>{{ item.bookingCount >= 3 ? '是' : '否' }}</text></view>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'bookings'" class="section-list">
      <view v-for="item in dashboard.bookings" :key="item.id" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.id }}</text>
            <text class="muted">{{ item.account || 'guest' }} · {{ item.scooterId }} · {{ item.createdAt }}</text>
          </view>
          <text :class="['pill', item.status === 'ongoing' ? 'warn' : item.status === 'cancelled' ? 'danger' : '']">
            {{ bookingStatusText(item.status) }}
          </text>
        </view>
        <view class="fee-list">
          <view><text>租用时长</text><text>{{ item.minutes }} 分钟</text></view>
          <view><text>当前金额</text><text>{{ item.total }} 元</text></view>
          <view><text>支付方式</text><text>{{ item.paymentMethod || '未支付' }}</text></view>
          <view><text>最近操作</text><text>{{ item.lastAction || '无' }}</text></view>
        </view>
        <view class="button-grid">
          <button class="mini-action" @tap="extendOrder(item.id)">延期 15 分钟</button>
          <button class="mini-action" @tap="payOrder(item.id)">模拟支付</button>
          <button class="mini-action" @tap="returnOrder(item.id)">后台还车</button>
          <button class="mini-action danger" @tap="cancelOrder(item.id)">取消订单</button>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'revenue'" class="section-list">
      <view class="metric-grid">
        <view class="metric"><text class="metric-value">{{ dashboard.finance.revenue }}</text><text class="metric-label">总收入</text></view>
        <view class="metric"><text class="metric-value">{{ dashboard.finance.paidRevenue }}</text><text class="metric-label">已支付</text></view>
        <view class="metric"><text class="metric-value">{{ dashboard.finance.unpaid }}</text><text class="metric-label">待支付</text></view>
      </view>
      <view v-for="item in dashboard.bookings" :key="item.id" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.id }}</text>
            <text class="muted">{{ bookingStatusText(item.status) }} · {{ item.paymentMethod || '未支付' }}</text>
          </view>
          <text class="stock">{{ item.total }} 元</text>
        </view>
        <view class="fee-list">
          <view><text>基础租金/总额</text><text>{{ item.total }} 元</text></view>
          <view><text>电费差额</text><text>{{ item.batteryFee || 0 }} 元</text></view>
          <view><text>超时扣费</text><text>{{ item.overdueFee || 0 }} 元</text></view>
          <view><text>异地调度费</text><text>{{ item.dispatchFee || 0 }} 元</text></view>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'pricing'" class="section-list">
      <view v-for="item in dashboard.priceSettings" :key="item.model" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.model }}</text>
            <text class="muted">{{ item.displayName }} · {{ item.status }}</text>
          </view>
          <text class="stock">{{ item.minutePrice }} 元/分钟</text>
        </view>
        <text class="label">分钟租金</text>
        <input class="input compact-input" type="digit" v-model="item.minutePrice" />
        <text class="label">到店日租价</text>
        <input class="input compact-input" type="digit" v-model="item.storePrice" />
        <text class="label">押金</text>
        <input class="input compact-input" type="digit" v-model="item.deposit" />
        <view class="button-grid">
          <button class="mini-action" @tap="savePrice(item)">保存价格</button>
          <button class="mini-action" @tap="togglePrice(item)">{{ item.status === '启用' ? '暂停车型' : '启用车型' }}</button>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'issues'" class="section-list">
      <view v-for="item in dashboard.issues" :key="item.id" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.id }} · {{ item.type }}</text>
            <text class="muted">{{ item.account }} · {{ item.scooterId || '无车辆编号' }} · {{ item.createdAt }}</text>
          </view>
          <text :class="['pill', item.priority === '高' ? 'danger' : item.priority === '中' ? 'warn' : '']">{{ item.priority }}</text>
        </view>
        <text class="issue-message">{{ item.message }}</text>
        <view class="fee-list">
          <view><text>处理状态</text><text>{{ item.status }}</text></view>
        </view>
        <view class="button-grid">
          <button class="mini-action danger" @tap="setIssue(item.id, { priority: '高' })">高优先级</button>
          <button class="mini-action" @tap="setIssue(item.id, { status: '处理中' })">开始处理</button>
          <button class="mini-action" @tap="setIssue(item.id, { status: '已解决' })">标记解决</button>
          <button class="mini-action" @tap="setIssue(item.id, { priority: '低' })">低优先级</button>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'promotions'" class="section-list">
      <view v-for="item in dashboard.promotions" :key="item.id" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.name }}</text>
            <text class="muted">{{ item.rule }}</text>
          </view>
          <text class="stock">{{ item.status }}</text>
        </view>
        <text class="label">优惠比例（%）</text>
        <input class="input compact-input" type="number" v-model="item.discount" />
        <view class="button-grid">
          <button class="mini-action" @tap="savePromotion(item)">保存优惠</button>
          <button class="mini-action" @tap="togglePromotion(item)">{{ item.status === '启用' ? '暂停' : '启用' }}</button>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'scooters'" class="section-list">
      <view v-for="item in dashboard.scooters" :key="item.id" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.id }} · {{ item.model }}</text>
            <text class="muted">{{ item.commStatus }} · {{ item.lockStatus }} · {{ item.latitude }}, {{ item.longitude }}</text>
          </view>
          <text :class="['pill', item.status === 'charging' ? 'warn' : item.status === 'maintenance' ? 'danger' : '']">
            {{ statusText(item.status) }}
          </text>
        </view>
        <view class="fee-list">
          <view><text>电量</text><text>{{ item.battery }}%</text></view>
          <view><text>里程</text><text>{{ item.mileage }} km</text></view>
          <view><text>分钟价</text><text>{{ item.price }} 元/分钟</text></view>
          <view><text>头盔</text><text>{{ item.helmet ? '正常' : '缺失' }}</text></view>
        </view>
        <view class="button-grid">
          <button class="mini-action" @tap="setScooter(item.id, { status: 'available', lockStatus: '已上锁', commStatus: '在线' })">设为可用</button>
          <button class="mini-action" @tap="setScooter(item.id, { status: 'charging', lockStatus: '充电锁定' })">设为充电</button>
          <button class="mini-action danger" @tap="setScooter(item.id, { status: 'maintenance', lockStatus: '维修锁定' })">设为维修</button>
          <button class="mini-action" @tap="setScooter(item.id, { battery: Math.min(100, item.battery + 10) })">电量 +10</button>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'stores'" class="section-list">
      <view v-for="item in dashboard.stores" :key="item.id" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.name }}</text>
            <text class="muted">{{ item.address }}</text>
          </view>
          <text class="stock">{{ item.available }} 辆</text>
        </view>
        <view class="fee-list">
          <view><text>营业时间</text><text>{{ item.open }}</text></view>
          <view><text>经纬度</text><text>{{ item.latitude }}, {{ item.longitude }}</text></view>
        </view>
        <view class="button-grid">
          <button class="mini-action" @tap="setStore(item.id, { available: item.available + 1 })">补车 +1</button>
          <button class="mini-action" @tap="setStore(item.id, { available: Math.max(0, item.available - 1) })">调走 -1</button>
          <button class="mini-action" @tap="setStore(item.id, { open: '24 小时' })">设为 24 小时</button>
        </view>
      </view>
    </view>

    <view v-else-if="type === 'charging'" class="section-list">
      <view v-for="item in dashboard.chargingQueue" :key="item.scooterId" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.scooterId }} 充电任务</text>
            <text class="muted">{{ item.targetStore }} · 优先级 {{ item.priority }}</text>
          </view>
          <text class="stock">{{ item.battery }}%</text>
        </view>
        <button class="primary-btn action-full" @tap="finishCharge(item.scooterId)">充电完成并恢复可租</button>
      </view>
    </view>

    <view v-else-if="type === 'faults'" class="section-list">
      <view v-for="item in faultItems" :key="item.scooterId" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.scooterId }} 故障单</text>
            <text class="muted">{{ item.issue }} · {{ item.status }}</text>
          </view>
          <text class="pill danger">待处理</text>
        </view>
        <view class="fee-list">
          <view><text>车辆状态</text><text>{{ statusText(item.scooter.status) }}</text></view>
          <view><text>头盔</text><text>{{ item.scooter.helmet ? '正常' : '缺失' }}</text></view>
          <view><text>通信</text><text>{{ item.scooter.commStatus }}</text></view>
        </view>
        <button class="primary-btn action-full" @tap="resolveFault(item.scooterId)">维修完成并上架</button>
      </view>
    </view>

    <view v-else-if="type === 'staff'" class="section-list">
      <view v-for="item in dashboard.staff" :key="item.id" class="card manage-card">
        <view class="row">
          <view>
            <text class="item-title">{{ item.name }}</text>
            <text class="muted">{{ item.role }} · {{ item.task }}</text>
          </view>
          <text class="stock">{{ item.status }}</text>
        </view>
        <view class="button-grid">
          <button class="mini-action" @tap="setStaff(item.id, { status: '待出发' })">待出发</button>
          <button class="mini-action" @tap="setStaff(item.id, { status: '执行中' })">执行中</button>
          <button class="mini-action" @tap="setStaff(item.id, { status: '已完成' })">已完成</button>
        </view>
      </view>
    </view>

    <view v-else class="card manage-card">
      <text class="item-title">板块正在刷新</text>
      <text class="muted">请返回管理员首页重新进入，或点击右上角刷新。</text>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import {
  adminDashboard,
  adminModuleMeta,
  bookingStatusText,
  cancelBooking,
  extendBooking,
  getCurrentAdmin,
  mockPayBooking,
  statusText,
  updateBooking,
  updateIssue,
  updatePriceSetting,
  updatePromotion,
  updateScooterAdmin,
  updateStaffAdmin,
  updateStoreAdmin,
} from '../../data/mock'
import { fetchRemoteAdminDashboard, updateRemoteBooking, updateRemoteIssue, updateRemoteScooter } from '../../data/mock'

const type = ref('overview')
const dashboard = ref({
  users: [],
  frequentUsers: [],
  bookings: [],
  issues: [],
  priceSettings: [],
  promotions: [],
  scooters: [],
  stores: [],
  staff: [],
  chargingQueue: [],
  faults: [],
  usage: { activeUsers: 0, availableScooters: 0, totalMinutes: 0, activeOrders: 0 },
  finance: { revenue: 0, paidRevenue: 0, unpaid: 0, returned: 0 },
})
const modules = ref([])

const legacyModules = {
  stores: { title: '门店管理', desc: '门店车辆数、营业时间、还车点' },
  charging: { title: '充电管理', desc: '低电量车辆、充电完成' },
  faults: { title: '故障处理', desc: '故障车、头盔缺失、维修恢复' },
  staff: { title: '人员调度', desc: '部署/收集人员与任务状态' },
}

const typeAliases = {
  vehicles: 'scooters',
  orders: 'bookings',
  finance: 'revenue',
}

const currentModule = computed(() => {
  return modules.value.find((item) => item.type === type.value) || legacyModules[type.value] || { title: '管理模块', desc: '' }
})

const openIssues = computed(() => {
  return dashboard.value.issues.filter((item) => item.status !== '已解决').length
})

const activePromotions = computed(() => {
  return dashboard.value.promotions.filter((item) => item.status === '启用').length
})

const faultItems = computed(() => {
  return (dashboard.value.faults || []).map((item) => ({
    ...item,
    scooter: dashboard.value.scooters.find((scooter) => scooter.id === item.scooterId) || {},
  }))
})

onLoad((query) => {
  type.value = normalizeType(query.type)
})

onShow(() => {
  if (!getCurrentAdmin()) {
    uni.redirectTo({ url: '/pages/admin/login' })
    return
  }
  reload()
})

async function reload() {
  modules.value = adminModuleMeta()
  dashboard.value = adminDashboard()
  try {
    dashboard.value = await fetchRemoteAdminDashboard()
  } catch {
    dashboard.value = adminDashboard()
  }
}

function normalizeType(value) {
  const raw = value || 'overview'
  return typeAliases[raw] || raw
}

function toast(title = '已更新') {
  uni.showToast({ title, icon: 'success' })
}

async function extendOrder(id) {
  const item = dashboard.value.bookings.find((booking) => booking.id === id)
  try {
    await updateRemoteBooking(id, {
      minutes: Number(item?.minutes || 0) + 15,
      total: Number((Number(item?.total || 0) + 18).toFixed(2)),
      lastAction: '管理员后台延期 15 分钟。',
    })
  } catch {
    extendBooking(id, 15)
  }
  await reload()
  toast('已延期')
}

async function payOrder(id) {
  try {
    await updateRemoteBooking(id, {
      status: 'paid',
      paymentMethod: '管理员后台模拟支付',
      lastAction: '管理员后台模拟支付成功。',
    })
  } catch {
    mockPayBooking(id, '管理员后台模拟支付')
  }
  await reload()
  toast('已支付')
}

async function returnOrder(id) {
  const patch = {
    status: 'returned',
    returnChecked: true,
    lastAction: '管理员后台确认还车。',
  }
  try {
    await updateRemoteBooking(id, patch)
  } catch {
    updateBooking(id, patch)
  }
  await reload()
  toast('已还车')
}

async function cancelOrder(id) {
  try {
    await updateRemoteBooking(id, {
      status: 'cancelled',
      lastAction: '管理员后台取消订单。',
    })
  } catch {
    cancelBooking(id)
  }
  await reload()
  toast('已取消')
}

function savePrice(item) {
  updatePriceSetting(item.model, {
    minutePrice: item.minutePrice,
    storePrice: item.storePrice,
    deposit: item.deposit,
    status: item.status,
  })
  reload()
  toast('价格已保存')
}

function togglePrice(item) {
  updatePriceSetting(item.model, { status: item.status === '启用' ? '暂停' : '启用' })
  reload()
  toast()
}

async function setIssue(id, patch) {
  try {
    await updateRemoteIssue(id, patch)
  } catch {
    updateIssue(id, patch)
  }
  await reload()
  toast()
}

function savePromotion(item) {
  updatePromotion(item.id, { discount: item.discount, status: item.status })
  reload()
  toast('优惠已保存')
}

function togglePromotion(item) {
  updatePromotion(item.id, { status: item.status === '启用' ? '暂停' : '启用' })
  reload()
  toast()
}

async function setScooter(id, patch) {
  try {
    await updateRemoteScooter(id, { ...patch, lastTelemetryAt: '刚刚' })
  } catch {
    updateScooterAdmin(id, { ...patch, lastTelemetryAt: '刚刚' })
  }
  await reload()
  toast()
}

function setStore(id, patch) {
  updateStoreAdmin(id, patch)
  reload()
  toast()
}

function setStaff(id, patch) {
  updateStaffAdmin(id, patch)
  reload()
  toast()
}

function finishCharge(id) {
  setScooter(id, {
    status: 'available',
    battery: 100,
    rangeKm: 38,
    lockStatus: '已上锁',
    commStatus: '在线',
  })
}

function resolveFault(id) {
  setScooter(id, {
    status: 'available',
    helmet: true,
    lockStatus: '已上锁',
    commStatus: '在线',
  })
}
</script>

<style scoped>
.admin-module-page {
  gap: 22rpx;
}

.module-head {
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
.item-title,
.muted,
.label {
  display: block;
}

.kicker {
  color: #86efac;
  font-size: 23rpx;
  font-weight: 900;
}

.title {
  margin-top: 10rpx;
  font-size: 42rpx;
  font-weight: 900;
}

.copy {
  margin-top: 10rpx;
  color: rgba(255, 255, 255, 0.72);
  font-size: 24rpx;
  line-height: 1.45;
}

.small-btn {
  min-width: 100rpx;
  min-height: 62rpx;
  border-radius: 999rpx;
  background: rgba(255, 255, 255, 0.14);
  color: #fff;
  font-size: 24rpx;
  font-weight: 900;
}

.section-list {
  display: grid;
  gap: 20rpx;
}

.manage-card {
  padding: 28rpx;
}

.item-title {
  color: #111827;
  font-size: 30rpx;
  font-weight: 900;
}

.stock {
  color: #0f766e;
  font-size: 26rpx;
  font-weight: 900;
}

.requirement-grid {
  display: grid;
  gap: 14rpx;
  margin-top: 20rpx;
  color: #334155;
  font-size: 25rpx;
}

.fee-list {
  display: grid;
  margin-top: 18rpx;
  border-top: 1rpx solid #e2e8f0;
}

.fee-list > view {
  display: flex;
  justify-content: space-between;
  gap: 18rpx;
  padding: 17rpx 0;
  border-bottom: 1rpx solid #e2e8f0;
  color: #334155;
  font-size: 25rpx;
}

.button-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14rpx;
  margin-top: 22rpx;
}

.mini-action {
  min-height: 72rpx;
  border: 2rpx solid #dbe5ef;
  border-radius: 18rpx;
  background: #fff;
  color: #111827;
  font-size: 24rpx;
  font-weight: 900;
}

.mini-action.danger {
  border-color: #fecaca;
  background: #fff1f2;
  color: #b42318;
}

.label {
  margin-top: 20rpx;
  color: #334155;
  font-size: 24rpx;
  font-weight: 900;
}

.compact-input {
  min-height: 76rpx;
  margin-top: 10rpx;
}

.issue-message {
  display: block;
  margin-top: 18rpx;
  color: #111827;
  font-size: 26rpx;
  line-height: 1.5;
}

.action-full {
  margin-top: 24rpx;
}
</style>
