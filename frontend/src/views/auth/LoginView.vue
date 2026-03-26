<script setup>
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/auth'
import { ApiError } from '@/utils/apiError'
import AuthField from '@/components/auth/AuthField.vue'

const router = useRouter()
const route = useRoute()
const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})
const errors = reactive({
  email: '',
  password: '',
})
const ui = reactive({
  loading: false,
})

function validateForm() {
  errors.email = ''
  errors.password = ''

  if (!form.email) {
    errors.email = 'Email is required.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address.'
  }

  if (!form.password) {
    errors.password = 'Password is required.'
  }

  return !errors.email && !errors.password
}

async function submitLogin() {
  if (!validateForm()) {
    ElMessage.error('Please fix form errors.')
    return
  }

  try {
    ui.loading = true
    await auth.login({
      email: form.email,
      password: form.password,
    })
    ElMessage.success('Login successful.')
    const redirect =
      typeof route.query.redirect === 'string'
        ? route.query.redirect
        : auth.user?.role === 'admin'
          ? '/admin'
          : '/customer'
    router.push(redirect)
  } catch (error) {
    ElMessage.error(error instanceof ApiError ? error.message : 'Login failed. Please try again.')
  } finally {
    ui.loading = false
  }
}
</script>

<template>
  <section class="auth-page ds-page">
    <article class="auth-card ds-panel">
      <header class="auth-head">
        <h1>Welcome Back</h1>
        <p>Login to your SwiftRide account</p>
      </header>

      <form class="auth-body" @submit.prevent="submitLogin">
        <AuthField
          id="login-email"
          v-model="form.email"
          label="Email"
          type="email"
          icon="@"
          autocomplete="email"
          placeholder="Enter your email"
          :error="errors.email"
        />

        <AuthField
          id="login-password"
          v-model="form.password"
          label="Password"
          type="password"
          icon="*"
          autocomplete="current-password"
          placeholder="Enter your password"
          :error="errors.password"
        />

        <div class="row">
          <label class="check"><input v-model="form.remember" type="checkbox" /> Remember Me</label>
          <span class="minor-link">Forgot Password?</span>
        </div>

        <button type="submit" class="ds-btn ds-btn-primary ds-btn-pill primary-btn" :disabled="ui.loading">
          {{ ui.loading ? 'Signing In...' : 'Sign In' }}
        </button>

        <p class="admin-tip"><b>Admin:</b> admin@swiftride.com / admin123</p>
      </form>

      <footer class="auth-foot">
        <span>Don't have an account?</span>
        <RouterLink to="/register">Sign Up Now</RouterLink>
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
  width: min(500px, 94vw);
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

.row {
  margin-top: 4px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
}

.check {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-weight: 500;
}

.minor-link {
  color: #0b63d6;
  font-weight: 700;
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

.admin-tip {
  margin: 2px 0 0;
  color: #64748b;
  font-size: 12px;
}
</style>
