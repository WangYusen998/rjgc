<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const collapse = ref(false)

const adminMenu = [
  { path: '/admin', label: 'Dashboard' },
  { path: '/admin/scooters', label: 'Fleet Config' },
  { path: '/admin/revenue', label: 'Revenue Analytics' },
  { path: '/admin/issues', label: 'Issue Desk' },
]
</script>

<template>
  <el-container class="admin-shell">
    <el-aside :width="collapse ? '84px' : '260px'" class="admin-sidebar">
      <div class="admin-brand">{{ collapse ? 'SF' : 'ScootFlow Ops' }}</div>
      <el-menu :default-active="$route.path" router :collapse="collapse">
        <el-menu-item v-for="item in adminMenu" :key="item.path" :index="item.path">{{ item.label }}</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="admin-header">
        <div>
          <p class="admin-eyebrow">Management Interface</p>
          <h1>Operations Control Center</h1>
        </div>
        <div class="admin-actions">
          <el-tag type="warning">{{ auth.user?.name || 'Manager' }}</el-tag>
          <el-button @click="collapse = !collapse">Toggle</el-button>
          <el-button plain @click="$router.push('/')">Exit Admin</el-button>
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
