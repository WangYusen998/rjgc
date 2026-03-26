<script setup>
import { computed, ref } from 'vue'
import { useAnalyticsStore } from '@/stores/analytics'

const analytics = useAnalyticsStore()
const period = ref('week')
const maxDaily = computed(() => Math.max(...analytics.dailyIncome.map((item) => item.value), 1))
</script>

<template>
  <section class="admin-page">
    <header class="head">
      <div>
        <h1>Revenue Analytics</h1>
        <p>Weekly totals and rental plan performance.</p>
      </div>
      <select v-model="period" class="range-select">
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </header>

    <article class="panel">
      <h2>Income by Plan</h2>
      <table class="table">
        <thead><tr><th>Plan</th><th>Income (GBP)</th></tr></thead>
        <tbody>
          <tr v-for="item in analytics.weeklyIncomeByPlan" :key="item.plan"><td>{{ item.plan }}</td><td>{{ item.value }}</td></tr>
        </tbody>
      </table>
    </article>

    <article class="panel">
      <h2>Daily Income</h2>
      <div class="bars">
        <div v-for="item in analytics.dailyIncome" :key="item.day" class="bar-item">
          <div class="bar" :style="{ height: `${(item.value / maxDaily) * 140}px` }"></div>
          <small>{{ item.day }} / {{ item.value }}</small>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.admin-page { display: grid; gap: 14px; }
.head, .panel { border: 1px solid rgba(146,170,214,.3); border-radius: 12px; background: rgba(13,28,51,.72); padding: 14px; }
.head { display: flex; justify-content: space-between; align-items: center; gap: 10px; }
h1, h2 { margin: 0; }
.head p { margin: 6px 0 0; color: #9fb3d1; }
.range-select { min-width: 140px; border: 1px solid rgba(146,170,214,.35); border-radius: 8px; padding: 8px 10px; background: rgba(6,19,40,.65); color: #e2e8f0; }
.table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.table th,.table td { border: 1px solid rgba(146,170,214,.3); padding: 8px; text-align: left; }
.bars { margin-top: 10px; min-height: 180px; display: flex; align-items: end; gap: 10px; }
.bar-item { display: grid; gap: 6px; justify-items: center; }
.bar { width: 28px; border-radius: 8px 8px 0 0; background: linear-gradient(180deg,#4fa0ff,#0b63d6); }
small { color: #9fb3d1; }
@media (max-width: 680px) { .head { flex-direction: column; align-items: flex-start; } }
</style>
