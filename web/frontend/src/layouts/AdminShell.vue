<script setup>
import { computed, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const collapse = ref(false)

const adminMenu = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/users', label: 'User Records' },
  { path: '/admin/bookings', label: 'Booking Records' },
  { path: '/admin/scooters', label: 'Fleet Config' },
  { path: '/admin/revenue', label: 'Revenue Analytics' },
  { path: '/admin/issues', label: 'Issue Desk' },
]

const todayLabel = computed(() =>
  new Intl.DateTimeFormat('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).format(new Date()),
)
</script>

<template>
  <el-container class="admin-shell">
    <el-aside :width="collapse ? '84px' : '260px'" class="admin-sidebar">
      <div class="admin-brand">
        <span class="brand-mark">SR</span>
        <div v-if="!collapse" class="brand-copy">
          <strong>SwiftRide Ops</strong>
          <small>Fleet control</small>
        </div>
      </div>
      <el-menu :default-active="$route.path" router :collapse="collapse">
        <el-menu-item v-for="item in adminMenu" :key="item.path" :index="item.path">{{ item.label }}</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <div class="admin-head-copy">
          <p class="admin-eyebrow">Management Interface</p>
          <h1>Operations Control Center</h1>
        </div>
        <div class="admin-actions">
          <span class="admin-date">{{ todayLabel }}</span>
          <el-tag effect="dark" type="primary">{{ auth.user?.name || 'Manager' }}</el-tag>
          <el-button class="admin-action-btn" @click="collapse = !collapse">{{ collapse ? 'Expand' : 'Collapse' }}</el-button>
          <el-button class="admin-action-btn admin-action-btn--ghost" plain @click="$router.push('/')">Exit Admin</el-button>
        </div>
      </el-header>
      <el-main class="admin-main">
        <RouterView />
      </el-main>
      <footer class="site-footer admin-site-footer">
        <div class="site-footer-inner">
          <div class="site-footer-bottom">
            <span>2026 SwiftRide Admin Console</span>
            <div class="site-footer-bottom-links">
              <RouterLink to="/admin">Dashboard</RouterLink>
              <RouterLink to="/admin/users">Users</RouterLink>
              <RouterLink to="/admin/bookings">Bookings</RouterLink>
              <RouterLink to="/admin/scooters">Fleet Config</RouterLink>
              <RouterLink to="/admin/revenue">Revenue</RouterLink>
              <RouterLink to="/admin/issues">Issue Desk</RouterLink>
            </div>
          </div>
        </div>
      </footer>
    </el-container>
  </el-container>
</template>
