<script setup>
import { computed, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useFeedbackStore } from '@/stores/feedback'

const feedback = useFeedbackStore()
const tab = ref('all')

const rows = computed(() => feedback.issues.filter((i) => tab.value === 'all' || i.status === tab.value))

function setHigh(id) {
  feedback.markHighPriority(id)
  ElMessage.success('Issue marked as high priority.')
}

function resolve(id) {
  feedback.resolveIssue(id)
  ElMessage.success('Issue resolved.')
}
</script>

<template>
  <section class="admin-page">
    <header class="head">
      <h1>Issue Management</h1>
      <p>Prioritize and resolve customer-reported faults.</p>
    </header>

    <article class="panel">
      <div class="tabs">
        <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All</button>
        <button :class="{ active: tab === 'open' }" @click="tab = 'open'">Open</button>
        <button :class="{ active: tab === 'resolved' }" @click="tab = 'resolved'">Resolved</button>
      </div>

      <div v-if="rows.length > 0" class="table-wrap">
        <table class="table">
          <thead><tr><th>ID</th><th>User</th><th>Message</th><th>Priority</th><th>Status</th><th>Action</th></tr></thead>
          <tbody>
            <tr v-for="item in rows" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.user }}</td>
              <td>{{ item.message }}</td>
              <td>{{ item.priority }}</td>
              <td>{{ item.status }}</td>
              <td>
                <button class="btn" @click="setHigh(item.id)">Set High</button>
                <button class="btn" @click="resolve(item.id)">Resolve</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="empty-box">
        <h3>No records yet</h3>
        <p>Try changing filters or wait for new customer reports.</p>
      </div>
    </article>
  </section>
</template>

<style scoped>
.admin-page { display: grid; gap: 14px; }
.head, .panel { border: 1px solid rgba(146,170,214,.3); border-radius: 12px; background: rgba(13,28,51,.72); padding: 14px; }
h1 { margin: 0; }
.head p { margin: 6px 0 0; color: #9fb3d1; }
.tabs { display: flex; gap: 8px; margin-bottom: 10px; }
.tabs button { border: 1px solid rgba(146,170,214,.4); border-radius: 999px; background: transparent; color: #dce9ff; padding: 6px 10px; font-weight: 700; cursor: pointer; }
.tabs button.active { background: #0b63d6; border-color: #0b63d6; }
.table-wrap { overflow: auto; }
.table { width: 100%; border-collapse: collapse; min-width: 760px; }
.table th,.table td { border: 1px solid rgba(146,170,214,.3); padding: 8px; text-align: left; }
.btn { border: 1px solid #0b63d6; border-radius: 6px; background: transparent; color: #dce9ff; padding: 5px 8px; margin-right: 6px; cursor: pointer; }
.empty-box { border: 1px dashed rgba(146,170,214,.45); border-radius: 10px; padding: 20px; text-align: center; color: #b9cbe3; }
.empty-box h3 { margin: 0; color: #e5eefb; }
.empty-box p { margin: 8px 0 0; }
</style>
