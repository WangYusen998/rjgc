<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/utils/apiError'
import AuthField from '@/components/auth/AuthField.vue'

const router = useRouter()
const auth = useAuthStore()

const form = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
})
const ui = reactive({
  loading: false,
})

function validateForm() {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  if (!form.name.trim()) errors.name = 'Username is required.'

  if (!form.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!form.password) {
    errors.password = 'Password is required.'
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.'
  } else if (!/[A-Za-z]/.test(form.password) || !/\d/.test(form.password)) {
    errors.password = 'Password must contain letters and numbers.'
  }

  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.'
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.'
  }

  return !errors.name && !errors.email && !errors.password && !errors.confirmPassword
}

async function submitRegister() {
  if (!validateForm()) {
    ElMessage.error('Please fix form errors.')
    return
  }

  try {
    ui.loading = true
    await auth.register({
      name: form.name.trim(),
      email: form.email,
      password: form.password,
    })
    ElMessage.success('Registration successful. Please login.')
    router.push('/login')
  } catch (error) {
    ElMessage.error(error instanceof ApiError ? error.message : 'Registration failed. Please try another email.')
  } finally {
    ui.loading = false
  }
}
</script>

<template>
  <section class="auth-page ds-page">
    <article class="auth-card ds-panel">
      <header class="auth-head">
        <h1>Join SwiftRide</h1>
        <p>Create your account today</p>
      </header>

      <form class="auth-body" @submit.prevent="submitRegister">
        <AuthField
          id="register-name"
          v-model="form.name"
          label="Username"
          type="text"
          icon="@"
          autocomplete="username"
          placeholder="Choose a username"
          :error="errors.name"
        />

        <AuthField
          id="register-email"
          v-model="form.email"
          label="Email"
          type="email"
          icon="@"
          autocomplete="email"
          placeholder="Enter your email"
          :error="errors.email"
        />

        <AuthField
          id="register-password"
          v-model="form.password"
          label="Password"
          type="password"
          icon="*"
          autocomplete="new-password"
          placeholder="Create a password"
          :error="errors.password"
        />
        <p class="hint">Password requirement: at least 6 chars, include letters and numbers.</p>

        <AuthField
          id="register-confirm-password"
          v-model="form.confirmPassword"
          label="Repeat Password"
          type="password"
          icon="*"
          autocomplete="new-password"
          placeholder="Confirm your password"
          :error="errors.confirmPassword"
        />

        <button type="submit" class="ds-btn ds-btn-primary ds-btn-pill primary-btn" :disabled="ui.loading">
          {{ ui.loading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <footer class="auth-foot">
        <span>Already have an account?</span>
        <RouterLink to="/login">Sign In</RouterLink>
      </footer>
    </article>
  </section>
</template>

<style scoped>
.auth-page {
  min-height: calc(100vh - 150px);
  display: grid;
  place-items: center;
}

.auth-card {
  width: min(650px, 94vw);
  overflow: hidden;
  padding: 0;
}

.auth-head {
  background: #0c5dbf;
  color: #fff;
  padding: 20px 26px;
}

.auth-head h1 {
  margin: 0;
  font-family: "Space Grotesk", sans-serif;
  font-size: 40px;
}

.auth-head p {
  margin: 6px 0 0;
}

.auth-body {
  padding: 22px 26px;
  display: grid;
  gap: 10px;
}

.hint {
  margin: 0 0 2px;
  color: #64748b;
  font-size: 12px;
}

.primary-btn {
  margin-top: 8px;
  height: 48px;
  font-size: 22px;
}

.primary-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.auth-foot {
  border-top: 1px solid #e3e8f1;
  background: #f8fafd;
  padding: 14px 18px;
  display: flex;
  justify-content: center;
  gap: 8px;
}

.auth-foot a {
  color: #0b63d6;
  font-weight: 700;
}
</style>
