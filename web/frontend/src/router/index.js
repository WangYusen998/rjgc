import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const PublicShell = () => import('@/layouts/PublicShell.vue')
const AdminShell = () => import('@/layouts/AdminShell.vue')
const HomeView = () => import('@/views/HomeView.vue')
const LoginView = () => import('@/views/auth/LoginView.vue')
const RegisterView = () => import('@/views/auth/RegisterView.vue')
const CustomerDashboardView = () => import('@/views/customer/CustomerDashboardView.vue')
const HireOptionsView = () => import('@/views/customer/HireOptionsView.vue')
const BookingView = () => import('@/views/customer/BookingView.vue')
const PaymentView = () => import('@/views/customer/PaymentView.vue')
const BookingHistoryView = () => import('@/views/customer/BookingHistoryView.vue')
const MapView = () => import('@/views/customer/MapView.vue')
const FeedbackView = () => import('@/views/customer/FeedbackView.vue')
const ScooterListView = () => import('@/views/customer/ScooterListView.vue')
const AdminDashboardView = () => import('@/views/admin/AdminDashboardView.vue')
const ScooterConfigView = () => import('@/views/admin/ScooterConfigView.vue')
const RevenueView = () => import('@/views/admin/RevenueView.vue')
const IssueManagementView = () => import('@/views/admin/IssueManagementView.vue')

const routes = [
  {
    path: '/',
    component: PublicShell,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'login', name: 'login', component: LoginView },
      { path: 'register', name: 'register', component: RegisterView },
      {
        path: 'customer',
        children: [
          { path: '', name: 'customer-dashboard', component: CustomerDashboardView },
          { path: 'scooters', name: 'scooter-list', component: ScooterListView },
          { path: 'hire-options', name: 'hire-options', component: HireOptionsView },
          { path: 'booking', name: 'booking', component: BookingView },
          { path: 'payment', name: 'payment', component: PaymentView },
          { path: 'history', name: 'booking-history', component: BookingHistoryView },
          { path: 'map', name: 'map', component: MapView },
          { path: 'feedback', name: 'feedback', component: FeedbackView },
        ],
      },
    ],
  },
  {
    path: '/admin',
    component: AdminShell,
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboardView },
      { path: 'scooters', name: 'scooter-config', component: ScooterConfigView },
      { path: 'revenue', name: 'revenue', component: RevenueView },
      { path: 'issues', name: 'issue-management', component: IssueManagementView },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()
  const hasValidSession = auth.ensureValidSession()
  const isCustomer = to.path.startsWith('/customer')
  const isAdmin = to.path.startsWith('/admin')

  if (!isCustomer && !isAdmin) return true

  if ((isCustomer || isAdmin) && !hasValidSession) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (isAdmin) {
    if (!auth.token) return '/login'
    if (auth.user?.role !== 'admin') return '/customer/scooters'
    return true
  }

  if (isCustomer && !auth.token) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (isCustomer && auth.user?.role === 'admin') return '/admin'

  return true
})

export default router
