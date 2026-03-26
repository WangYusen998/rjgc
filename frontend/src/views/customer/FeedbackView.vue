<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useFeedbackStore } from '@/stores/feedback'
import { useBookingStore } from '@/stores/booking'

const feedback = useFeedbackStore()
const booking = useBookingStore()
const route = useRoute()

const form = reactive({
  scooterId: '',
  category: 'general',
  priority: 'low',
  message: '',
})

const tab = ref('all')
const keyword = ref('')
const quickTemplates = [
  'Battery drains too quickly.',
  'Brake feels weak and unsafe.',
  'Scooter lock did not open after payment.',
  'Scooter body appears damaged.',
]

watch(
  () => route.query.scooterId,
  (id) => {
    if (typeof id === 'string') form.scooterId = id
  },
  { immediate: true },
)

const stats = computed(() => {
  const total = feedback.issues.length
  const open = feedback.issues.filter((item) => item.status === 'open').length
  const high = feedback.issues.filter((item) => item.priority === 'high' && item.status === 'open').length
  return { total, open, high }
})

const visibleIssues = computed(() => {
  return feedback.issues.filter((item) => {
    const tabOk = tab.value === 'all' || item.status === tab.value
    const keywordOk =
      item.id.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.message.toLowerCase().includes(keyword.value.toLowerCase()) ||
      item.user.toLowerCase().includes(keyword.value.toLowerCase())
    return tabOk && keywordOk
  })
})

function submitIssue() {
  if (!form.message.trim()) {
    ElMessage.error('Please describe the issue.')
    return
  }

  const formatted = `[${form.category}] [${form.scooterId || 'N/A'}] ${form.message.trim()}`
  feedback.addIssue({
    user: 'current-user',
    message: formatted,
    priority: form.priority,
  })

  form.message = ''
  form.scooterId = ''
  form.category = 'general'
  form.priority = 'low'
  ElMessage.success('Issue submitted successfully.')
}

function applyTemplate(text) {
  form.message = text
}
</script>

<template>
  <section class="feedback-page ds-page">
    <header class="page-head ds-header">
      <h1>Feedback & Issue Reporting</h1>
      <p>Report faults quickly and track resolution status.</p>
    </header>

    <section class="stats-grid">
      <article class="stat-card ds-panel">
        <span>Total Reports</span>
        <strong>{{ stats.total }}</strong>
      </article>
      <article class="stat-card ds-panel">
        <span>Open Reports</span>
        <strong>{{ stats.open }}</strong>
      </article>
      <article class="stat-card ds-panel">
        <span>High Priority</span>
        <strong>{{ stats.high }}</strong>
      </article>
    </section>

    <section class="content-grid">
      <article class="panel submit-panel ds-panel">
        <h2>Submit Issue</h2>

        <div class="field ds-field">
          <label class="ds-label">Scooter ID</label>
          <select v-model="form.scooterId" class="ds-select">
            <option value="">Not specified</option>
            <option v-for="item in booking.scooters" :key="item.id" :value="item.id">{{ item.id }}</option>
          </select>
        </div>

        <div class="field ds-field">
          <label class="ds-label">Category</label>
          <select v-model="form.category" class="ds-select">
            <option value="general">General</option>
            <option value="brake">Brake</option>
            <option value="battery">Battery</option>
            <option value="seat">Seat</option>
            <option value="payment">Payment</option>
          </select>
        </div>

        <div class="field ds-field">
          <label class="ds-label">Priority</label>
          <select v-model="form.priority" class="ds-select">
            <option value="low">Low</option>
            <option value="high">High</option>
          </select>
        </div>

        <div class="field ds-field">
          <label class="ds-label">Details</label>
          <textarea v-model="form.message" class="ds-textarea" rows="5" placeholder="Describe the issue briefly..." />
        </div>
        <div class="template-row">
          <button
            v-for="item in quickTemplates"
            :key="item"
            class="ds-btn ds-btn-secondary template-btn"
            @click="applyTemplate(item)"
          >
            {{ item }}
          </button>
        </div>

        <button class="submit-btn ds-btn ds-btn-primary" @click="submitIssue">Submit Report</button>
      </article>

      <article class="panel list-panel ds-panel">
        <div class="list-head">
          <h2>My Reports</h2>
          <input v-model="keyword" class="ds-input" placeholder="Search by id/message/user" />
        </div>

        <div class="tab-row">
          <button :class="{ active: tab === 'all' }" @click="tab = 'all'">All</button>
          <button :class="{ active: tab === 'open' }" @click="tab = 'open'">Open</button>
          <button :class="{ active: tab === 'resolved' }" @click="tab = 'resolved'">Resolved</button>
        </div>

        <div class="issue-list" v-if="visibleIssues.length > 0">
          <article v-for="item in visibleIssues" :key="item.id" class="issue-card">
            <div class="issue-top">
              <strong>{{ item.id }}</strong>
              <div class="badges">
                <span :class="['ds-badge', item.priority === 'high' ? 'ds-badge-danger' : 'ds-badge-muted']">{{ item.priority }}</span>
                <span :class="['ds-badge', item.status === 'open' ? 'ds-badge-info' : 'ds-badge-success']">{{ item.status }}</span>
              </div>
            </div>
            <p>{{ item.message }}</p>
            <small>Reporter: {{ item.user }}</small>
          </article>
        </div>

        <div v-else class="empty-state ds-empty">
          <h3 class="ds-empty-title">No records yet</h3>
          <p class="ds-empty-desc">Try changing filters or submit a new issue report.</p>
          <button class="ds-btn ds-btn-secondary ds-empty-action" @click="tab = 'all'">Show All Reports</button>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.feedback-page {
  display: grid;
  gap: 14px;
}

.page-head {
  padding: 16px;
}

h1 {
  margin: 0;
  font-size: 30px;
  font-family: "Space Grotesk", sans-serif;
}

.page-head p {
  margin: 6px 0 0;
  color: #64748b;
}

.stats-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.stat-card {
  padding: 14px;
}

.stat-card span {
  color: #64748b;
  font-size: 13px;
}

.stat-card strong {
  display: block;
  margin-top: 4px;
  font-size: 30px;
  font-family: "Space Grotesk", sans-serif;
}

.content-grid {
  display: grid;
  grid-template-columns: 360px 1fr;
  gap: 12px;
}

.panel {
  padding: 14px;
}

h2 {
  margin: 0 0 12px;
  font-size: 24px;
  font-family: "Space Grotesk", sans-serif;
}

.field {
  margin-bottom: 10px;
}

.submit-btn {
  width: 100%;
  margin-top: 4px;
  justify-content: center;
}

.template-row {
  display: grid;
  gap: 8px;
  margin-bottom: 4px;
}

.template-btn {
  text-align: left;
  font-weight: 600;
}

.list-head {
  display: grid;
  gap: 10px;
  margin-bottom: 10px;
}

.tab-row {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
}

.tab-row button {
  border: 1px solid #cfd9e8;
  border-radius: 999px;
  background: #fff;
  padding: 6px 12px;
  font-weight: 700;
  cursor: pointer;
}

.tab-row button.active {
  border-color: #0b63d6;
  background: #0b63d6;
  color: #fff;
}

.issue-list {
  display: grid;
  gap: 10px;
}

.issue-card {
  border: 1px solid #dbe4f1;
  border-radius: 10px;
  background: #f8fbff;
  padding: 10px;
}

.issue-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.badges {
  display: flex;
  gap: 6px;
}

.issue-card p {
  margin: 8px 0 0;
  color: #334155;
}

.issue-card small {
  color: #64748b;
}

.empty-state {
  padding: 20px;
}

@media (max-width: 980px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
