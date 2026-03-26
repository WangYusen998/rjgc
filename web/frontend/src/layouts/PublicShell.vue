<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { useNotificationStore } from '@/stores/notifications'

const router = useRouter()
const auth = useAuthStore()
const notifications = useNotificationStore()
const search = ref('')
const showNotifications = ref(false)

const navItems = [
  { path: '/', label: 'Home' },
  { path: '/customer/scooters', label: 'Scooters' },
  { path: '/customer/map', label: 'Map' },
  { path: '/customer/history', label: 'My Bookings' },
  { path: '/customer/feedback', label: 'Feedback' },
]

function submitSearch() {
  router.push({ path: '/customer/scooters', query: search.value ? { q: search.value } : {} })
}

const isLoggedIn = computed(() => Boolean(auth.token))
const isAdmin = computed(() => auth.user?.role === 'admin')
const portalPath = computed(() => (isAdmin.value ? '/admin' : '/customer'))
const portalLabel = computed(() => (isAdmin.value ? 'Admin' : 'Dashboard'))

function logout() {
  auth.logout()
  ElMessage.success('Logged out.')
  router.push('/login')
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  if (showNotifications.value) notifications.markAllRead()
}
</script>

<template>
  <div class="public-shell">
    <header class="lime-nav-wrap">
      <nav class="lime-nav">
        <div class="nav-left">
          <RouterLink to="/" class="brand">
            <span class="brand-icon" aria-hidden="true">SR</span>
            <span class="brand-text">SwiftRide</span>
          </RouterLink>
        </div>

        <div class="nav-center">
          <RouterLink v-for="item in navItems" :key="item.path" :to="item.path" class="nav-link">{{ item.label }}</RouterLink>
        </div>

        <div class="nav-right">
          <form class="nav-search" @submit.prevent="submitSearch">
            <input v-model="search" class="search-input" placeholder="Search" aria-label="Search scooters" />
            <button type="submit" class="search-btn">Search</button>
          </form>
          <template v-if="!isLoggedIn">
            <RouterLink to="/login" class="auth-link">Login</RouterLink>
            <RouterLink to="/register" class="register-link">Register</RouterLink>
          </template>
          <template v-else>
            <div class="notify-wrap">
              <button type="button" class="notify-btn" @click="toggleNotifications">
                Bell
                <span v-if="notifications.unreadCount > 0" class="notify-count">{{ notifications.unreadCount }}</span>
              </button>
              <div v-if="showNotifications" class="notify-panel">
                <div class="notify-head">
                  <strong>Notifications</strong>
                  <button type="button" @click="notifications.markAllRead()">Read all</button>
                </div>
                <div v-if="notifications.items.length > 0" class="notify-list">
                  <article v-for="item in notifications.items.slice(0, 6)" :key="item.id" class="notify-item">
                    <p>{{ item.message }}</p>
                    <small>{{ item.createdAt }}</small>
                  </article>
                </div>
                <p v-else class="notify-empty">No notifications.</p>
              </div>
            </div>
            <RouterLink :to="portalPath" class="auth-link">{{ portalLabel }}</RouterLink>
            <button type="button" class="register-link logout-btn" @click="logout">Logout</button>
          </template>
        </div>
      </nav>
    </header>

    <main class="public-main">
      <RouterView />
    </main>

    <footer class="site-footer">
      <div class="site-footer-inner">
        <div class="site-footer-top">
          <div class="site-footer-brand">
            <div class="site-footer-mark">
              <span>SR</span>
              <strong>SwiftRide</strong>
            </div>
            <p>Smart scooter rental interface for quick booking, live map view, and ride management.</p>
          </div>

          <div class="site-footer-col">
            <h4>Customer</h4>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/customer/scooters">Scooters</RouterLink>
            <RouterLink to="/customer/map">Map</RouterLink>
            <RouterLink to="/customer/history">My Bookings</RouterLink>
            <RouterLink to="/customer/feedback">Feedback</RouterLink>
          </div>

          <div class="site-footer-col">
            <h4>Account</h4>
            <RouterLink to="/login">Login</RouterLink>
            <RouterLink to="/register">Register</RouterLink>
            <RouterLink v-if="isAdmin" to="/admin">Manager Interface</RouterLink>
          </div>

          <div class="site-footer-col">
            <h4>Project</h4>
            <span>COMP2913 Coursework</span>
            <span>Responsive UI</span>
            <span>Accessibility Focused</span>
          </div>
        </div>

        <div class="site-footer-bottom">
          <span>2026 SwiftRide</span>
          <div class="site-footer-bottom-links">
            <RouterLink to="/">Course Demo</RouterLink>
            <RouterLink to="/login">Privacy Notice</RouterLink>
            <RouterLink to="/register">User Agreement</RouterLink>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>
