<template>
  <div class="app-shell">
    <header class="top-bar">
      <h1>SwiftRide</h1>
    </header>

    <main class="content">
      <RouterView />
    </main>

    <nav class="bottom-nav" aria-label="Primary">
      <RouterLink to="/" class="nav-item">Home</RouterLink>
      <RouterLink to="/scooters" class="nav-item">Scooters</RouterLink>
      <RouterLink to="/bookings" class="nav-item">Bookings</RouterLink>
      <RouterLink to="/profile" class="nav-item">Profile</RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<style scoped>
.app-shell {
  min-height: 100vh;
  background: #f6f7fb;
  color: #111827;
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  padding: 14px 16px;
}

.top-bar h1 {
  margin: 0;
  font-size: 18px;
}

.content {
  padding: 16px;
  padding-bottom: 88px;
}

.bottom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 20;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 8px;
  background: #ffffff;
  border-top: 1px solid #e5e7eb;
  padding: 10px 12px calc(10px + env(safe-area-inset-bottom));
}

.nav-item {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-height: 38px;
  border-radius: 10px;
  color: #4b5563;
  font-size: 13px;
  font-weight: 600;
}

.nav-item.router-link-active {
  background: #eef2ff;
  color: #1f2937;
}
</style>
