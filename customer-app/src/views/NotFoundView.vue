<template>
  <section class="not-found">
    <h2>404</h2>
    <p>Page not found.</p>
    <RouterLink to="/">Go Home</RouterLink>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router'
</script>

<style scoped>
.not-found {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: 18px;
  text-align: center;
}

.not-found h2 {
  margin: 0 0 8px;
  font-size: 24px;
}

.not-found p {
  margin: 0 0 10px;
  color: #4b5563;
}

.not-found a {
  color: #2563eb;
  font-weight: 600;
}
</style>
