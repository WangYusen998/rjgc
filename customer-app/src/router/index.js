import { createRouter, createWebHistory } from 'vue-router'

import AppLayout from '../layouts/AppLayout.vue'
import HomeView from '../views/HomeView.vue'
import NotFoundView from '../views/NotFoundView.vue'
import ScootersView from '../views/ScootersView.vue'
import BookingView from '../views/BookingView.vue'
import BookingsView from '../views/BookingsView.vue'

function createPlaceholderView(title) {
  return {
    name: `${title.replace(/[^a-zA-Z0-9]/g, '')}View`,
    template: `<section class="placeholder"><h2>${title}</h2><p>Coming soon.</p></section>`,
  }
}

const routes = [
  {
    path: '/',
    component: AppLayout,
    children: [
      { path: '', name: 'home', component: HomeView },
      { path: 'scooters', name: 'scooters', component: ScootersView },
      { path: 'booking/:id', name: 'booking', component: BookingView },
      { path: 'bookings', name: 'bookings', component: BookingsView },
      { path: 'profile', name: 'profile', component: createPlaceholderView('Profile') },
      { path: 'feedback', name: 'feedback', component: createPlaceholderView('Feedback') },
      { path: 'safety', name: 'safety', component: createPlaceholderView('Safety') },
      { path: 'auth/login', name: 'auth-login', component: createPlaceholderView('Login') },
      { path: 'auth/register', name: 'auth-register', component: createPlaceholderView('Register') },
      { path: 'auth/forgot', name: 'auth-forgot', component: createPlaceholderView('Forgot Password') },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: NotFoundView,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
