<template>
  <div class="admin-app">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">SR</span>
        <div>
          <strong>SwiftRide</strong>
          <small>Operations Center</small>
        </div>
      </div>

      <nav class="nav">
        <button
          v-for="item in tabs"
          :key="item.key"
          class="nav-item"
          :class="{ active: activeTab === item.key }"
          type="button"
          @click="activeTab = item.key"
        >
          <span>{{ item.label }}</span>
          <small>{{ item.count }}</small>
        </button>
      </nav>

      <div class="connection">
        <span class="dot" :class="{ ok: healthOk }"></span>
        <div>
          <strong>{{ healthOk ? 'MySQL 已连接' : '等待连接' }}</strong>
          <small>{{ apiBase }}</small>
        </div>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <p class="eyebrow">Backend Operations</p>
          <h1>运营管理后台</h1>
          <p class="topbar-subtitle">车辆、订单、收入、问题反馈与站点状态集中管理。</p>
        </div>

        <div class="actions">
          <el-input v-model="apiBase" class="api-input" size="large" @change="saveApiBase">
            <template #prepend>API</template>
          </el-input>
          <el-button :icon="Refresh" size="large" :loading="loading" type="primary" @click="loadAll">刷新</el-button>
          <el-button :icon="Link" size="large" tag="a" :href="apiBase" target="_blank">打开 API</el-button>
        </div>
      </header>

      <section v-if="errorMessage" class="notice">
        <strong>连接失败</strong>
        <span>{{ errorMessage }}</span>
      </section>

      <section class="metrics">
        <article>
          <span>注册用户</span>
          <strong>{{ users.length }}</strong>
          <small>{{ frequentUsers }} 位高频用户</small>
        </article>
        <article>
          <span>可用车辆</span>
          <strong>{{ availableScooters }}</strong>
          <small>{{ scooters.length }} 辆总库存</small>
        </article>
        <article>
          <span>订单收入</span>
          <strong>{{ money(finance.revenue) }}</strong>
          <small>{{ bookings.length }} 条订单</small>
        </article>
        <article>
          <span>待处理问题</span>
          <strong>{{ openIssues }}</strong>
          <small>{{ faults.length }} 条车辆故障</small>
        </article>
      </section>

      <section v-show="activeTab === 'overview'" class="panel">
        <div class="panel-head">
          <div>
            <h2>实时概览</h2>
            <p>数据来自当前 Node/Express 后端和 MySQL 数据库。</p>
          </div>
          <span class="panel-badge">最后刷新：{{ refreshedAt || '尚未刷新' }}</span>
        </div>

        <div class="overview-grid">
          <div class="summary-block">
            <h3>车辆状态</h3>
            <div class="status-list">
              <span v-for="item in scooterStatusRows" :key="item.status">
                {{ statusLabel(item.status) }} <strong>{{ item.count }}</strong>
              </span>
            </div>
          </div>

          <div class="summary-block">
            <h3>站点库存</h3>
            <el-table :data="stores" height="286">
              <el-table-column prop="name" label="站点" min-width="160" />
              <el-table-column prop="available" label="可用" width="90" />
              <el-table-column prop="open" label="开放时间" width="130" />
              <el-table-column prop="rating" label="评分" width="90" />
            </el-table>
          </div>
        </div>
      </section>

      <section v-show="activeTab === 'scooters'" class="panel">
        <div class="panel-head">
          <div>
            <h2>车辆管理</h2>
            <p>状态、电量、通信与头盔记录会直接写入 MySQL。</p>
          </div>
          <div class="panel-actions">
            <el-switch v-model="showMaintenance" active-text="含维修中" inactive-text="仅运营车辆" />
            <el-button type="primary" @click="openAddScooter">添加车辆</el-button>
          </div>
        </div>

        <el-table :data="visibleScooters" height="560">
          <el-table-column prop="id" label="编号" width="100" />
          <el-table-column prop="model" label="型号" width="130" />
          <el-table-column prop="storeName" label="站点" min-width="170" />
          <el-table-column label="状态" width="150">
            <template #default="{ row }">
              <el-select :model-value="row.status" @change="(value) => updateScooter(row, { status: value })">
                <el-option v-for="status in scooterStatuses" :key="status" :label="statusLabel(status)" :value="status" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="电量" width="110">
            <template #default="{ row }">{{ row.battery }}%</template>
          </el-table-column>
          <el-table-column label="续航" width="100">
            <template #default="{ row }">{{ row.rangeKm }} km</template>
          </el-table-column>
          <el-table-column label="里程" width="110">
            <template #default="{ row }">{{ row.mileage }} km</template>
          </el-table-column>
          <el-table-column label="头盔" width="90">
            <template #default="{ row }">{{ row.helmet ? '正常' : '缺失' }}</template>
          </el-table-column>
          <el-table-column prop="commStatus" label="通信" width="110" />
          <el-table-column prop="lockStatus" label="锁状态" min-width="130" />
          <el-table-column label="快捷操作" min-width="300" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" type="success" @click="markScooterAvailable(row)">设为可用</el-button>
                <el-button size="small" @click="markScooterCharging(row)">设为充电</el-button>
                <el-button size="small" type="danger" plain @click="markScooterMaintenance(row)">设为维修</el-button>
                <el-button size="small" @click="boostBattery(row)">电量 +10</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-show="activeTab === 'bookings'" class="panel">
        <div class="panel-head">
          <div>
            <h2>订单记录</h2>
            <p>可处理延期、模拟支付、后台还车和取消订单。</p>
          </div>
          <span class="panel-badge">{{ bookings.length }} 条订单</span>
        </div>

        <el-table :data="bookings" height="560">
          <el-table-column prop="id" label="订单号" width="130" />
          <el-table-column prop="account" label="账号" width="120" />
          <el-table-column prop="scooterId" label="车辆" width="100" />
          <el-table-column prop="storeName" label="站点" min-width="170" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">
              <span class="pill" :class="statusClass(row.status)">{{ bookingStatusLabel(row.status) }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="minutes" label="分钟" width="90" />
          <el-table-column label="金额" width="110">
            <template #default="{ row }">{{ money(row.total) }}</template>
          </el-table-column>
          <el-table-column label="支付方式" min-width="170">
            <template #default="{ row }">{{ row.paymentMethod || '未支付' }}</template>
          </el-table-column>
          <el-table-column label="最近操作" min-width="240">
            <template #default="{ row }">{{ row.lastAction || '无' }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="290" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" @click="extendBooking(row)">延期 15 分钟</el-button>
                <el-button size="small" type="success" @click="payBooking(row)">模拟支付</el-button>
                <el-button size="small" type="primary" @click="returnBooking(row)">后台还车</el-button>
                <el-button size="small" type="danger" plain @click="cancelBooking(row)">取消</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-show="activeTab === 'users'" class="panel">
        <div class="panel-head">
          <div>
            <h2>用户记录</h2>
            <p>展示用户档案、实名状态、银行卡与历史订单数量。</p>
          </div>
        </div>

        <el-table :data="users" height="560">
          <el-table-column prop="account" label="账号" width="130" />
          <el-table-column prop="name" label="姓名" width="130" />
          <el-table-column prop="phone" label="电话" width="140" />
          <el-table-column prop="email" label="邮箱" min-width="200" />
          <el-table-column prop="country" label="国家/地区" width="120" />
          <el-table-column label="实名认证" width="110">
            <template #default="{ row }">
              <span class="pill" :class="row.realNameVerified ? 'success' : 'muted'">
                {{ row.realNameVerified ? '已完成' : '未完成' }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="银行卡" width="110">
            <template #default="{ row }">{{ row.bankCardLast4 || '-' }}</template>
          </el-table-column>
          <el-table-column label="信用卡" width="110">
            <template #default="{ row }">{{ row.cardLast4 || '-' }}</template>
          </el-table-column>
          <el-table-column prop="bookingCount" label="历史订单" width="100" />
          <el-table-column label="操作" width="130" fixed="right">
            <template #default="{ row }">
              <el-button size="small" type="danger" plain @click="deleteUser(row)">删除用户</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-show="activeTab === 'revenue'" class="panel">
        <div class="panel-head">
          <div>
            <h2>收入统计</h2>
            <p>展示总收入、已支付收入，以及电费差额、超时费和调度费构成。</p>
          </div>
          <span class="panel-badge">{{ money(finance.revenue) }}</span>
        </div>

        <div class="finance-grid">
          <article>
            <span>总收入</span>
            <strong>{{ money(finance.revenue) }}</strong>
          </article>
          <article>
            <span>已支付</span>
            <strong>{{ money(finance.paidRevenue) }}</strong>
          </article>
          <article>
            <span>未支付订单</span>
            <strong>{{ finance.unpaid || 0 }}</strong>
          </article>
        </div>

        <el-table :data="bookings" height="440">
          <el-table-column prop="id" label="订单号" width="130" />
          <el-table-column label="状态" width="110">
            <template #default="{ row }">{{ bookingStatusLabel(row.status) }}</template>
          </el-table-column>
          <el-table-column label="总额" width="110">
            <template #default="{ row }">{{ money(row.total) }}</template>
          </el-table-column>
          <el-table-column label="电费差额" width="110">
            <template #default="{ row }">{{ money(row.batteryFee) }}</template>
          </el-table-column>
          <el-table-column label="超时扣费" width="110">
            <template #default="{ row }">{{ money(row.overdueFee) }}</template>
          </el-table-column>
          <el-table-column label="异地调度费" width="120">
            <template #default="{ row }">{{ money(row.dispatchFee) }}</template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" />
        </el-table>
      </section>

      <section v-show="activeTab === 'stores'" class="panel">
        <div class="panel-head">
          <div>
            <h2>站点管理</h2>
            <p>站点库存和开放状态来自 MySQL，目前后台接口提供只读展示。</p>
          </div>
          <span class="panel-badge">{{ stores.length }} 个站点</span>
        </div>

        <el-table :data="stores" height="560">
          <el-table-column prop="name" label="站点" min-width="180" />
          <el-table-column prop="address" label="地址" min-width="260" />
          <el-table-column prop="available" label="车辆库存" width="100" />
          <el-table-column prop="open" label="开放时间" width="140" />
          <el-table-column prop="rating" label="评分" width="90" />
          <el-table-column label="经纬度" width="190">
            <template #default="{ row }">{{ Number(row.latitude).toFixed(4) }}, {{ Number(row.longitude).toFixed(4) }}</template>
          </el-table-column>
        </el-table>
      </section>

      <section v-show="activeTab === 'charging'" class="panel">
        <div class="panel-head">
          <div>
            <h2>充电管理</h2>
            <p>处理低电量车辆的回收充电队列。</p>
          </div>
          <span class="panel-badge">{{ chargingQueue.length }} 条任务</span>
        </div>

        <el-table :data="chargingQueue" height="560">
          <el-table-column prop="scooterId" label="车辆" width="120" />
          <el-table-column prop="targetStore" label="目标站点" min-width="180" />
          <el-table-column label="电量" width="100">
            <template #default="{ row }">{{ row.battery }}%</template>
          </el-table-column>
          <el-table-column prop="priority" label="优先级" width="100" />
          <el-table-column label="操作" min-width="180">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="finishCharging(row)">充电完成并恢复可租</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-show="activeTab === 'faults'" class="panel">
        <div class="panel-head">
          <div>
            <h2>故障处理</h2>
            <p>处理头盔缺失、维修中车辆和故障恢复。</p>
          </div>
          <span class="panel-badge">{{ faults.length }} 条故障</span>
        </div>

        <el-table :data="faults" height="560">
          <el-table-column prop="scooterId" label="车辆" width="120" />
          <el-table-column prop="issue" label="故障描述" min-width="180" />
          <el-table-column label="车辆状态" width="120">
            <template #default="{ row }">{{ statusLabel(findScooter(row.scooterId)?.status) }}</template>
          </el-table-column>
          <el-table-column label="头盔" width="90">
            <template #default="{ row }">{{ findScooter(row.scooterId)?.helmet ? '正常' : '缺失' }}</template>
          </el-table-column>
          <el-table-column label="操作" min-width="180">
            <template #default="{ row }">
              <el-button size="small" type="success" @click="repairScooter(row)">维修完成并上架</el-button>
            </template>
          </el-table-column>
        </el-table>
      </section>

      <section v-show="activeTab === 'issues'" class="panel">
        <div class="panel-head">
          <div>
            <h2>问题处理</h2>
            <p>优先级调整、开始处理和标记已解决会写入 MySQL。</p>
          </div>
          <span class="panel-badge">{{ openIssues }} 条待处理</span>
        </div>

        <el-table :data="issues" height="560">
          <el-table-column prop="id" label="编号" width="130" />
          <el-table-column prop="scooterId" label="车辆" width="100" />
          <el-table-column prop="type" label="类型" width="140" />
          <el-table-column prop="account" label="账号" width="120" />
          <el-table-column label="优先级" width="130">
            <template #default="{ row }">
              <el-select :model-value="row.priority" @change="(value) => updateIssue(row, { priority: value })">
                <el-option v-for="level in issuePriorities" :key="level" :label="level" :value="level" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column label="状态" width="150">
            <template #default="{ row }">
              <el-select :model-value="row.status" @change="(value) => updateIssue(row, { status: value })">
                <el-option v-for="status in issueStatuses" :key="status" :label="status" :value="status" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="message" label="内容" min-width="260" />
          <el-table-column prop="createdAt" label="创建时间" width="160" />
          <el-table-column label="操作" min-width="260" fixed="right">
            <template #default="{ row }">
              <div class="table-actions">
                <el-button size="small" type="danger" plain @click="updateIssue(row, { priority: '高' })">高优先级</el-button>
                <el-button size="small" @click="updateIssue(row, { status: '处理中' })">开始处理</el-button>
                <el-button size="small" type="success" @click="updateIssue(row, { status: '已解决' })">标记解决</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </section>
    </main>

    <el-dialog v-model="addScooterVisible" title="添加车辆" width="560px">
      <el-form :model="newScooter" label-width="96px">
        <el-form-item label="车辆编号">
          <el-input v-model="newScooter.code" placeholder="留空自动生成，如 SC107" />
        </el-form-item>
        <el-form-item label="车型">
          <el-select v-model="newScooter.model">
            <el-option label="Swift One" value="Swift One" />
            <el-option label="Swift Plus" value="Swift Plus" />
            <el-option label="Swift City" value="Swift City" />
          </el-select>
        </el-form-item>
        <el-form-item label="所在站点">
          <el-select v-model="newScooter.storeId">
            <el-option v-for="store in stores" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
        <div class="form-grid">
          <el-form-item label="状态">
            <el-select v-model="newScooter.status">
              <el-option v-for="status in scooterStatuses" :key="status" :label="statusLabel(status)" :value="status" />
            </el-select>
          </el-form-item>
          <el-form-item label="电量">
            <el-input-number v-model="newScooter.battery" :min="0" :max="100" />
          </el-form-item>
          <el-form-item label="续航">
            <el-input-number v-model="newScooter.rangeKm" :min="0" :max="120" />
          </el-form-item>
          <el-form-item label="里程">
            <el-input-number v-model="newScooter.mileage" :min="0" :max="99999" />
          </el-form-item>
        </div>
        <el-form-item label="头盔">
          <el-switch v-model="newScooter.helmet" active-text="正常" inactive-text="缺失" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addScooterVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingScooter" @click="createScooter">确认添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Link, Refresh } from '@element-plus/icons-vue'

const defaultApiBase = import.meta.env.VITE_API_BASE_URL || '/api'
const apiBase = ref(localStorage.getItem('swiftride_management_api_base') || defaultApiBase)
const activeTab = ref('overview')
const loading = ref(false)
const healthOk = ref(false)
const errorMessage = ref('')
const refreshedAt = ref('')
const showMaintenance = ref(true)
const addScooterVisible = ref(false)
const savingScooter = ref(false)
const newScooter = ref(defaultScooterForm())
const dashboard = ref({
  users: [],
  scooters: [],
  stores: [],
  bookings: [],
  issues: [],
  chargingQueue: [],
  faults: [],
  usage: {},
  finance: {},
})

const scooterStatuses = ['available', 'reserved', 'charging', 'maintenance']
const issueStatuses = ['待处理', '处理中', '已解决', '寰呭鐞?', '澶勭悊涓?', '宸茶В鍐?']
const issuePriorities = ['高', '中', '低', '楂?', '涓?', '浣?']

const users = computed(() => dashboard.value.users || [])
const stores = computed(() => dashboard.value.stores || [])
const bookings = computed(() => dashboard.value.bookings || [])
const issues = computed(() => dashboard.value.issues || [])
const finance = computed(() => dashboard.value.finance || {})
const chargingQueue = computed(() => dashboard.value.chargingQueue || lowBatteryQueue.value)
const faults = computed(() => dashboard.value.faults || faultRows.value)

const storeNameById = computed(() => new Map(stores.value.map((store) => [store.id, store.name])))
const scooters = computed(() =>
  (dashboard.value.scooters || []).map((scooter) => ({
    ...scooter,
    storeName: storeNameById.value.get(scooter.storeId) || scooter.storeId,
  })),
)
const visibleScooters = computed(() => (showMaintenance.value ? scooters.value : scooters.value.filter((item) => item.status !== 'maintenance')))
const availableScooters = computed(() => scooters.value.filter((item) => item.status === 'available').length)
const frequentUsers = computed(() => users.value.filter((item) => Number(item.bookingCount || 0) >= 3).length)
const openIssues = computed(() => issues.value.filter((item) => !isResolvedIssue(item.status)).length)
const lowBatteryQueue = computed(() =>
  scooters.value
    .filter((item) => Number(item.battery || 0) < 45)
    .map((item) => ({
      scooterId: item.id,
      battery: item.battery,
      targetStore: item.storeName,
      priority: Number(item.battery || 0) < 30 ? '高' : '中',
    })),
)
const faultRows = computed(() =>
  scooters.value
    .filter((item) => item.status === 'maintenance' || !item.helmet)
    .map((item) => ({
      scooterId: item.id,
      issue: item.helmet ? '待检修' : '头盔缺失',
      status: '待处理',
    })),
)
const scooterStatusRows = computed(() =>
  scooterStatuses.map((status) => ({
    status,
    count: scooters.value.filter((item) => item.status === status).length,
  })),
)
const tabs = computed(() => [
  { key: 'overview', label: '概览', count: healthOk.value ? 'OK' : '--' },
  { key: 'scooters', label: '车辆管理', count: scooters.value.length },
  { key: 'bookings', label: '订单记录', count: bookings.value.length },
  { key: 'users', label: '用户记录', count: users.value.length },
  { key: 'revenue', label: '收入统计', count: money(finance.value.revenue) },
  { key: 'stores', label: '站点管理', count: stores.value.length },
  { key: 'charging', label: '充电管理', count: chargingQueue.value.length },
  { key: 'faults', label: '故障处理', count: faults.value.length },
  { key: 'issues', label: '问题反馈', count: openIssues.value },
])

function defaultScooterForm() {
  return {
    code: '',
    model: 'Swift One',
    storeId: 'st-01',
    status: 'available',
    battery: 100,
    rangeKm: 35,
    mileage: 0,
    helmet: true,
  }
}

function saveApiBase() {
  apiBase.value = apiBase.value.replace(/\/$/, '')
  localStorage.setItem('swiftride_management_api_base', apiBase.value)
}

async function api(path, options = {}) {
  const response = await fetch(`${apiBase.value}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  })
  if (!response.ok) {
    let message = `HTTP ${response.status}`
    try {
      const body = await response.json()
      message = body?.message || message
    } catch {
      // Keep the HTTP status message when the response is not JSON.
    }
    throw new Error(message)
  }
  return response.json()
}

async function loadAll() {
  loading.value = true
  errorMessage.value = ''
  saveApiBase()
  try {
    const [health, data] = await Promise.all([api('/health'), api('/admin/dashboard')])
    healthOk.value = Boolean(health.ok)
    dashboard.value = data
    refreshedAt.value = new Date().toLocaleString()
  } catch (error) {
    healthOk.value = false
    errorMessage.value = error.message || '无法连接后端'
  } finally {
    loading.value = false
  }
}

async function updateScooter(row, patch, message = `${row.id} 已更新`) {
  try {
    await api(`/scooters/${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    ElMessage.success(message)
    await loadAll()
  } catch (error) {
    ElMessage.error(error.message || '车辆更新失败')
  }
}

function openAddScooter() {
  newScooter.value = {
    ...defaultScooterForm(),
    storeId: stores.value[0]?.id || 'st-01',
  }
  addScooterVisible.value = true
}

async function createScooter() {
  savingScooter.value = true
  try {
    const payload = {
      ...newScooter.value,
      code: String(newScooter.value.code || '').trim() || undefined,
    }
    await api('/scooters', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    ElMessage.success('车辆已添加')
    addScooterVisible.value = false
    await loadAll()
  } catch (error) {
    ElMessage.error(error.message || '添加车辆失败')
  } finally {
    savingScooter.value = false
  }
}

function markScooterAvailable(row) {
  return updateScooter(row, {
    status: 'available',
    helmet: true,
    lockStatus: '已上锁',
    commStatus: '在线',
  }, `${row.id} 已恢复可用`)
}

function markScooterCharging(row) {
  return updateScooter(row, {
    status: 'charging',
    lockStatus: '充电锁定',
    commStatus: '在线',
  }, `${row.id} 已进入充电`)
}

function markScooterMaintenance(row) {
  return updateScooter(row, {
    status: 'maintenance',
    lockStatus: '维修锁定',
  }, `${row.id} 已标记维修`)
}

function boostBattery(row) {
  return updateScooter(row, { battery: Math.min(100, Number(row.battery || 0) + 10) }, `${row.id} 电量已更新`)
}

function finishCharging(row) {
  const scooter = findScooter(row.scooterId)
  if (!scooter) return
  return updateScooter(scooter, {
    status: 'available',
    battery: Math.max(90, Number(scooter.battery || 0)),
    lockStatus: '已上锁',
    commStatus: '在线',
  }, `${scooter.id} 已完成充电`)
}

function repairScooter(row) {
  const scooter = findScooter(row.scooterId)
  if (!scooter) return
  return updateScooter(scooter, {
    status: 'available',
    helmet: true,
    lockStatus: '已上锁',
    commStatus: '在线',
  }, `${scooter.id} 已维修完成`)
}

async function updateBooking(row, patch, message = `${row.id} 已更新`) {
  try {
    await api(`/bookings/${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    ElMessage.success(message)
    await loadAll()
  } catch (error) {
    ElMessage.error(error.message || '订单更新失败')
  }
}

function extendBooking(row) {
  const minutes = Number(row.minutes || 0) + 15
  const total = Number(row.total || 0) + 18
  return updateBooking(row, {
    minutes,
    total: Number(total.toFixed(2)),
    lastAction: '后台已延期 15 分钟',
  }, `${row.id} 已延期`)
}

function payBooking(row) {
  return updateBooking(row, {
    status: row.status === 'ongoing' ? 'paid' : row.status,
    paymentMethod: row.paymentMethod || '后台模拟支付',
    lastAction: '后台模拟支付成功',
  }, `${row.id} 已模拟支付`)
}

function returnBooking(row) {
  const total = Number(row.total || 0) + Number(row.batteryFee || 0) + Number(row.overdueFee || 0) + Number(row.dispatchFee || 0)
  return updateBooking(row, {
    status: 'returned',
    returnChecked: true,
    endBattery: row.endBattery ?? Math.max(Number(row.startBattery || 80) - 12, 5),
    endMileage: row.endMileage ?? Number(row.startMileage || 0) + 5,
    damageReport: '无',
    total: Number(total.toFixed(2)),
    lastAction: '后台完成还车检查',
  }, `${row.id} 已还车`)
}

function cancelBooking(row) {
  return updateBooking(row, {
    status: 'cancelled',
    lastAction: '后台取消订单，车辆重新释放',
  }, `${row.id} 已取消`)
}

async function updateIssue(row, patch, message = `${row.id} 已更新`) {
  try {
    await api(`/issues/${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    })
    ElMessage.success(message)
    await loadAll()
  } catch (error) {
    ElMessage.error(error.message || '问题更新失败')
  }
}

async function deleteUser(row) {
  try {
    await ElMessageBox.confirm(
      `确定删除用户 ${row.account} 吗？该用户的订单记录也会从数据库删除，问题反馈会保留但解绑用户。`,
      '删除用户',
      { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
    )
    await api(`/admin/users/${encodeURIComponent(row.account)}`, { method: 'DELETE' })
    ElMessage.success(`${row.account} 已删除`)
    await loadAll()
  } catch (error) {
    if (error === 'cancel') return
    ElMessage.error(error.message || '删除用户失败')
  }
}

function findScooter(id) {
  return scooters.value.find((item) => item.id === id)
}

function statusLabel(status = '') {
  return {
    available: '可用',
    reserved: '已预约',
    charging: '充电中',
    maintenance: '维修中',
  }[status] || status || '未知'
}

function bookingStatusLabel(status = '') {
  return {
    ongoing: '进行中',
    paid: '已支付',
    returned: '已还车',
    cancelled: '已取消',
    overdue: '已超时',
  }[status] || status || '未知'
}

function statusClass(status = '') {
  if (['available', 'paid', 'returned'].includes(status)) return 'success'
  if (['charging', 'ongoing', 'reserved'].includes(status)) return 'warn'
  if (['maintenance', 'cancelled', 'overdue'].includes(status)) return 'danger'
  return 'muted'
}

function isResolvedIssue(status = '') {
  return ['已解决', 'resolved', '宸茶В鍐?'].includes(status)
}

function money(value) {
  return `¥${Number(value || 0).toFixed(2)}`
}

onMounted(loadAll)
</script>
