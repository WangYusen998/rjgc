<template>
  <div class="admin-app">
    <aside class="sidebar">
      <div class="brand">
        <span class="brand-mark">SR</span>
        <div>
          <strong>SwiftRide</strong>
          <small>Management Web</small>
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
          <strong>{{ healthOk ? '后端�?MySQL 已连�? : '等待连接' }}</strong>
          <small>{{ apiBase }}</small>
        </div>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div>
          <p class="eyebrow">Backend Operations</p>
          <h1>运营管理后台</h1>
        </div>

        <div class="actions">
          <el-input v-model="apiBase" class="api-input" size="large" @change="saveApiBase" />
          <el-button :icon="Refresh" size="large" :loading="loading" @click="loadAll">刷新</el-button>
          <el-button :icon="Link" size="large" tag="a" :href="apiBase" target="_blank">API</el-button>
        </div>
      </header>

      <section v-if="errorMessage" class="notice">
        <strong>连接失败</strong>
        <span>{{ errorMessage }}</span>
      </section>

      <section class="metrics">
        <article>
          <span>用户</span>
          <strong>{{ users.length }}</strong>
        </article>
        <article>
          <span>可用车辆</span>
          <strong>{{ availableScooters }}</strong>
        </article>
        <article>
          <span>订单收入</span>
          <strong>{{ money(finance.revenue) }}</strong>
        </article>
        <article>
          <span>待处理问�?/span>
          <strong>{{ openIssues }}</strong>
        </article>
      </section>

      <section v-show="activeTab === 'overview'" class="panel">
        <div class="panel-head">
          <div>
            <h2>实时概览</h2>
            <p>数据来自当前 Node 后端�?MySQL 数据库�?/p>
          </div>
          <span class="timestamp">最后刷新：{{ refreshedAt || '尚未刷新' }}</span>
        </div>

        <div class="overview-grid">
          <div class="summary-block">
            <h3>车辆状�?/h3>
            <div class="status-list">
              <span v-for="item in scooterStatusRows" :key="item.status">
                {{ item.status }} <strong>{{ item.count }}</strong>
              </span>
            </div>
          </div>
          <div class="summary-block">
            <h3>站点</h3>
            <el-table :data="stores" height="260">
              <el-table-column prop="name" label="站点" min-width="160" />
              <el-table-column prop="available" label="可用" width="90" />
              <el-table-column prop="open" label="开放时�? width="130" />
            </el-table>
          </div>
        </div>
      </section>

      <section v-show="activeTab === 'scooters'" class="panel">
        <div class="panel-head">
          <div>
            <h2>车辆管理</h2>
            <p>车辆状态修改会直接写入 MySQL�?/p>
          </div>
        </div>
        <el-table :data="scooters" height="560">
          <el-table-column prop="id" label="编号" width="100" />
          <el-table-column prop="model" label="型号" width="130" />
          <el-table-column prop="storeName" label="站点" min-width="180" />
          <el-table-column prop="battery" label="电量" width="100">
            <template #default="{ row }">{{ row.battery }}%</template>
          </el-table-column>
          <el-table-column prop="mileage" label="里程" width="110">
            <template #default="{ row }">{{ row.mileage }} km</template>
          </el-table-column>
          <el-table-column label="状�? width="180">
            <template #default="{ row }">
              <el-select :model-value="row.status" @change="(value) => setScooterStatus(row, value)">
                <el-option v-for="status in scooterStatuses" :key="status" :label="status" :value="status" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="lockStatus" label="锁状�? min-width="130" />
        </el-table>
      </section>

      <section v-show="activeTab === 'bookings'" class="panel">
        <div class="panel-head">
          <div>
            <h2>订单记录</h2>
            <p>小程序和网页产生的订单会汇总到这里�?/p>
          </div>
        </div>
        <el-table :data="bookings" height="560">
          <el-table-column prop="id" label="订单�? width="130" />
          <el-table-column prop="account" label="账号" width="130" />
          <el-table-column prop="scooterId" label="车辆" width="100" />
          <el-table-column prop="storeName" label="站点" min-width="170" />
          <el-table-column prop="status" label="状�? width="110" />
          <el-table-column prop="minutes" label="分钟" width="90" />
          <el-table-column prop="total" label="金额" width="110">
            <template #default="{ row }">{{ money(row.total) }}</template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" />
        </el-table>
      </section>

      <section v-show="activeTab === 'users'" class="panel">
        <div class="panel-head">
          <div>
            <h2>用户记录</h2>
            <p>当前展示后端返回的用户档案与订单数量�?/p>
          </div>
        </div>
        <el-table :data="users" height="560">
          <el-table-column prop="account" label="账号" width="130" />
          <el-table-column prop="name" label="姓名" width="130" />
          <el-table-column prop="phone" label="电话" width="140" />
          <el-table-column prop="email" label="邮箱" min-width="190" />
          <el-table-column prop="country" label="国家/地区" width="120" />
          <el-table-column prop="bookingCount" label="订单�? width="100" />
        </el-table>
      </section>

      <section v-show="activeTab === 'issues'" class="panel">
        <div class="panel-head">
          <div>
            <h2>问题处理</h2>
            <p>反馈状态修改会同步�?MySQL�?/p>
          </div>
        </div>
        <el-table :data="issues" height="560">
          <el-table-column prop="id" label="编号" width="130" />
          <el-table-column prop="scooterId" label="车辆" width="100" />
          <el-table-column prop="type" label="类型" width="120" />
          <el-table-column prop="message" label="内容" min-width="240" />
          <el-table-column prop="priority" label="优先�? width="100" />
          <el-table-column label="状�? width="160">
            <template #default="{ row }">
              <el-select :model-value="row.status" @change="(value) => setIssueStatus(row, value)">
                <el-option v-for="status in issueStatuses" :key="status" :label="status" :value="status" />
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" width="160" />
        </el-table>
      </section>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Link, Refresh } from '@element-plus/icons-vue'

const defaultApiBase = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8080/api'
const apiBase = ref(localStorage.getItem('swiftride_management_api_base') || defaultApiBase)
const activeTab = ref('overview')
const loading = ref(false)
const healthOk = ref(false)
const errorMessage = ref('')
const refreshedAt = ref('')
const dashboard = ref({
  users: [],
  scooters: [],
  stores: [],
  bookings: [],
  issues: [],
  usage: {},
  finance: {},
})

const scooterStatuses = ['available', 'reserved', 'charging', 'maintenance']
const issueStatuses = ['待处�?, '处理�?, '已解�?]

const users = computed(() => dashboard.value.users || [])
const scooters = computed(() => {
  const storesById = new Map((dashboard.value.stores || []).map((store) => [store.id, store.name]))
  return (dashboard.value.scooters || []).map((scooter) => ({
    ...scooter,
    storeName: storesById.get(scooter.storeId) || scooter.storeId,
  }))
})
const stores = computed(() => dashboard.value.stores || [])
const bookings = computed(() => dashboard.value.bookings || [])
const issues = computed(() => dashboard.value.issues || [])
const finance = computed(() => dashboard.value.finance || {})
const availableScooters = computed(() => scooters.value.filter((item) => item.status === 'available').length)
const openIssues = computed(() => issues.value.filter((item) => item.status !== '已解�? && item.status !== 'resolved').length)
const scooterStatusRows = computed(() =>
  scooterStatuses.map((status) => ({
    status,
    count: scooters.value.filter((item) => item.status === status).length,
  })),
)

const tabs = computed(() => [
  { key: 'overview', label: '概览', count: healthOk.value ? 'OK' : '--' },
  { key: 'scooters', label: '车辆', count: scooters.value.length },
  { key: 'bookings', label: '订单', count: bookings.value.length },
  { key: 'users', label: '用户', count: users.value.length },
  { key: 'issues', label: '问题', count: openIssues.value },
])

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

async function setScooterStatus(row, status) {
  try {
    await api(`/scooters/${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    ElMessage.success(`${row.id} 状态已更新`)
    await loadAll()
  } catch (error) {
    ElMessage.error(error.message || '车辆状态更新失�?)
  }
}

async function setIssueStatus(row, status) {
  try {
    await api(`/issues/${encodeURIComponent(row.id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    ElMessage.success(`${row.id} 状态已更新`)
    await loadAll()
  } catch (error) {
    ElMessage.error(error.message || '问题状态更新失�?)
  }
}

function money(value) {
  return `¥${Number(value || 0).toFixed(2)}`
}

onMounted(loadAll)
</script>

