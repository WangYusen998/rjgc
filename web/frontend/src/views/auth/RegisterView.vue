<script setup>
import { computed, reactive } from 'vue'
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
  cardholder: '',
  cardNumber: '',
  billingPostcode: '',
  ageConfirmed: false,
  termsAccepted: false,
})
const errors = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  cardholder: '',
  cardNumber: '',
  billingPostcode: '',
  ageConfirmed: '',
  termsAccepted: '',
})
const ui = reactive({
  loading: false,
})
const policySummary = computed(() => {
  const digits = form.cardNumber.replace(/\s+/g, '')
  return digits.length >= 4 ? `Card ending ${digits.slice(-4)}` : 'No card linked yet'
})

function validateForm() {
  errors.name = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''
  errors.cardholder = ''
  errors.cardNumber = ''
  errors.billingPostcode = ''
  errors.ageConfirmed = ''
  errors.termsAccepted = ''

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

  const normalizedCardNumber = form.cardNumber.replace(/\s+/g, '')
  const hasOptionalCardInput = Boolean(form.cardholder.trim() || normalizedCardNumber || form.billingPostcode.trim())

  if (hasOptionalCardInput) {
    if (!form.cardholder.trim()) {
      errors.cardholder = 'Cardholder name is required if you want to save a card.'
    }

    if (!/^\d{16}$/.test(normalizedCardNumber)) {
      errors.cardNumber = 'Please enter a valid 16-digit card number.'
    }

    if (!/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i.test(form.billingPostcode.trim())) {
      errors.billingPostcode = 'Please enter a valid UK billing postcode.'
    }
  }

  if (!form.ageConfirmed) {
    errors.ageConfirmed = 'Riders must confirm they are over 18.'
  }

  if (!form.termsAccepted) {
    errors.termsAccepted = 'You must accept rental, insurance, and auto-charge terms.'
  }

  return !Object.values(errors).some(Boolean)
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
      cardholder: form.cardholder.trim(),
      cardNumber: form.cardNumber.replace(/\s+/g, ''),
      billingPostcode: form.billingPostcode.trim().toUpperCase(),
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

        <section class="policy-card">
          <div>
            <h2>UK registration and payment setup</h2>
            <p>For the UK rental flow, card binding is optional at registration. If a card is saved, late return fees and damage charges can be billed to it later.</p>
          </div>
          <span class="policy-chip">{{ policySummary }}</span>
        </section>

        <AuthField
          id="register-cardholder"
          v-model="form.cardholder"
          label="Cardholder Name (Optional)"
          type="text"
          icon="£"
          autocomplete="cc-name"
          placeholder="Name on card"
          :error="errors.cardholder"
        />

        <AuthField
          id="register-card-number"
          v-model="form.cardNumber"
          label="Credit Card Number (Optional)"
          type="text"
          icon="#"
          autocomplete="cc-number"
          placeholder="1234 1234 1234 1234"
          :error="errors.cardNumber"
        />

        <AuthField
          id="register-postcode"
          v-model="form.billingPostcode"
          label="Billing Postcode (Optional)"
          type="text"
          icon=">"
          autocomplete="postal-code"
          placeholder="SW1A 1AA"
          :error="errors.billingPostcode"
        />

        <label class="check-row" :class="{ 'has-error': errors.ageConfirmed }">
          <input v-model="form.ageConfirmed" type="checkbox" />
          <span>I confirm that I am over 18 and can rent an e-scooter in the UK.</span>
        </label>
        <p v-if="errors.ageConfirmed" class="check-error" role="alert">{{ errors.ageConfirmed }}</p>

        <label class="check-row" :class="{ 'has-error': errors.termsAccepted }">
          <input v-model="form.termsAccepted" type="checkbox" />
          <span>I accept QR unlock, approved return bay checks, insurance notice, liability waiver, and possible automatic charges for overtime or damage if a payment card is on file.</span>
        </label>
        <p v-if="errors.termsAccepted" class="check-error" role="alert">{{ errors.termsAccepted }}</p>

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

.policy-card {
  margin: 6px 0 2px;
  border: 1px solid #dbe7f4;
  border-radius: 14px;
  background: linear-gradient(180deg, #f6faff, #eef5ff);
  padding: 14px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: start;
}

.policy-card h2 {
  margin: 0;
  font-size: 16px;
  font-family: "Space Grotesk", sans-serif;
}

.policy-card p {
  margin: 6px 0 0;
  color: #51627b;
  font-size: 13px;
}

.policy-chip {
  border-radius: 999px;
  background: #d8ebff;
  color: #0b63d6;
  font-size: 12px;
  font-weight: 800;
  padding: 6px 10px;
  white-space: nowrap;
}

.check-row {
  display: flex;
  gap: 10px;
  align-items: start;
  border: 1px solid #dbe4f0;
  border-radius: 10px;
  background: #fbfdff;
  padding: 12px;
  color: #334155;
  font-size: 14px;
}

.check-row.has-error {
  border-color: #d93025;
}

.check-row input {
  margin-top: 2px;
}

.check-error {
  margin: -4px 0 2px;
  color: #d93025;
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

@media (max-width: 680px) {
  .policy-card {
    flex-direction: column;
  }

  .policy-chip {
    white-space: normal;
  }
}
</style>
