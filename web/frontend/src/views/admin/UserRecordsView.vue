<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useUserStore } from '@/stores/users'

const users = useUserStore()
const search = ref('')
const role = ref('all')
const status = ref('all')

onMounted(async () => {
  await users.hydrate()
})

const filteredUsers = computed(() =>
  users.records.filter((item) => {
    const keyword = search.value.toLowerCase()
    const matchesKeyword =
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword) ||
      String(item.id).toLowerCase().includes(keyword)
    const matchesRole = role.value === 'all' || item.role === role.value
    const matchesStatus = status.value === 'all' || item.status === status.value
    return matchesKeyword && matchesRole && matchesStatus
  }),
)

const stats = computed(() => ({
  total: users.records.length,
  active: users.records.filter((item) => item.status === 'active').length,
  admins: users.records.filter((item) => item.role === 'admin').length,
  totalSpent: users.records.reduce((sum, item) => sum + Number(item.totalSpent || 0), 0),
}))

async function toggleStatus(user) {
  const nextStatus = user.status === 'active' ? 'suspended' : 'active'
  await users.setStatus(user.id, nextStatus)
  ElMessage.success(`${user.name} is now ${nextStatus}.`)
}
</script>

<template>
  <section class="admin-page">
    <header class="head">
      <div>
        <h1>User Records</h1>
        <p>Review customer accounts, activity summaries, and account status from one table.</p>
      </div>
    </header>

    <section class="stats-grid">
      <article class="card"><span>Total Users</span><strong>{{ stats.total }}</strong></article>
      <article class="card"><span>Active Users</span><strong>{{ stats.active }}</strong></article>
      <article class="card"><span>Admins</span><strong>{{ stats.admins }}</strong></article>
      <article class="card"><span>Total Spend</span><strong>GBP {{ stats.totalSpent.toFixed(2) }}</strong></article>
    </section>

    <section class="toolbar panel">
      <input v-model="search" type="text" placeholder="Search by name, email, or id" />
      <select v-model="role">
        <option value="all">All Roles</option>
        <option value="customer">Customers</option>
        <option value="admin">Admins</option>
      </select>
      <select v-model="status">
        <option value="all">All Statuses</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
      </select>
    </section>

    <section class="panel">
      <div v-if="filteredUsers.length > 0" class="table-wrap">
        <table class="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Bookings</th>
              <th>Spent</th>
              <th>Last Login</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredUsers" :key="item.id">
              <td>
                <strong>{{ item.name }}</strong>
                <small>{{ item.email }}</small>
                <small>{{ item.id }}</small>
              </td>
              <td>{{ item.role }}</td>
              <td>
                <span :class="['badge', item.status === 'active' ? 'ok' : 'warn']">{{ item.status }}</span>
              </td>
              <td>{{ item.totalBookings }} total / {{ item.activeBookings }} active</td>
              <td>GBP {{ Number(item.totalSpent || 0).toFixed(2) }}</td>
              <td>{{ item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString() : 'Never' }}</td>
              <td>
                <button class="btn" :disabled="item.role === 'admin'" @click="toggleStatus(item)">
                  {{ item.status === 'active' ? 'Suspend' : 'Activate' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-box">
        <h3>No records yet</h3>
        <p>Try changing the filters to show more users.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.admin-page { display: grid; gap: 14px; }
.head,
.panel,
.card {
  border: 1px solid rgba(146,170,214,.3);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(14,29,54,.78), rgba(10,23,43,.72));
  box-shadow: 0 18px 34px rgba(2, 10, 23, 0.16);
}
.head,
.panel { padding: 18px; }
h1 { margin: 0; }
.head p { margin: 6px 0 0; color: #9fb3d1; }
.stats-grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); }
.card { padding: 16px; }
.card span { color: #9fb3d1; font-size: 13px; }
.card strong { display: block; margin-top: 4px; font-size: 24px; color: #fff; }
.toolbar { display: grid; gap: 10px; grid-template-columns: 1.2fr 180px 180px; }
input,
select {
  border: 1px solid rgba(146,170,214,.35);
  border-radius: 12px;
  padding: 12px 14px;
  background: rgba(6,19,40,.65);
  color: #e2e8f0;
}
.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 980px; }
.table th,
.table td { border-bottom: 1px solid rgba(146,170,214,.14); padding: 14px 10px; text-align: left; color: #dce9ff; }
.table th { color: #9fb3d1; font-size: 12px; letter-spacing: .08em; text-transform: uppercase; }
.table td strong { display: block; }
.table td small { display: block; color: #9fb3d1; margin-top: 4px; }
.badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
}
.badge.ok { background: rgba(22,163,74,.18); color: #8ef0af; }
.badge.warn { background: rgba(239,68,68,.18); color: #feb2b2; }
.btn {
  border: 1px solid rgba(96,165,250,.34);
  border-radius: 10px;
  padding: 8px 12px;
  background: linear-gradient(180deg, rgba(59,130,246,.18), rgba(59,130,246,.08));
  color: #eff6ff;
  cursor: pointer;
}
.btn:hover:not(:disabled) { border-color: rgba(147,197,253,.5); }
.btn:disabled { opacity: .45; cursor: not-allowed; }
.empty-box { text-align: center; color: #b9cbe3; }
.empty-box h3 { margin: 0; color: #f8fbff; }
.empty-box p { margin: 8px 0 0; }
@media (max-width: 1100px) { .stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 760px) {
  .stats-grid,
  .toolbar { grid-template-columns: 1fr; }
}
</style>
