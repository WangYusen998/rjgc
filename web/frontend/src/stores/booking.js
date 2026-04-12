import { defineStore } from 'pinia'
import { bookingApi } from '@/api/bookingApi'
import { useAuthStore } from '@/stores/auth'
import { useAnalyticsStore } from '@/stores/analytics'
import { useNotificationStore } from '@/stores/notifications'
import { ApiError } from '@/utils/apiError'

const baseHireOptions = [
  { key: '1h', label: '1 Hour', price: 4 },
  { key: '4h', label: '4 Hours', price: 12 },
  { key: '1d', label: '1 Day', price: 25 },
  { key: '1w', label: '1 Week', price: 110 },
]

export const useBookingStore = defineStore('booking', {
  state: () => ({
    hireOptions: baseHireOptions,
    scooters: [],
    bookings: [],
    pendingBooking: null,
    favoriteScooterIds: [],
    recentScooterIds: [],
    scootersLoading: false,
    scootersError: '',
    bookingsLoading: false,
    bookingsError: '',
  }),
  getters: {
    activeBookings: (state) => state.bookings.filter((item) => item.status === 'active'),
    selectedScooter: (state) => (id) => state.scooters.find((item) => item.id === id),
    bookingById: (state) => (id) => state.bookings.find((item) => item.id === id),
  },
  actions: {
    clearScootersError() {
      this.scootersError = ''
    },

    async hydrateScooters() {
      this.scootersLoading = true
      this.scootersError = ''
      try {
        const response = await bookingApi.listScooters()
        if (Array.isArray(response)) {
          this.scooters = response
          return
        }
        this.scootersError = 'Unexpected scooter data format.'
      } catch (error) {
        this.scootersError = error instanceof ApiError ? error.message : 'Unable to load scooters.'
      } finally {
        this.scootersLoading = false
      }
    },

    async hydrateBookings() {
      const auth = useAuthStore()
      if (!auth.user) {
        this.bookings = []
        return
      }

      this.bookingsLoading = true
      this.bookingsError = ''
      try {
        const response = await bookingApi.listBookings(auth.user)
        if (Array.isArray(response)) {
          this.bookings = response
          return
        }
        this.bookingsError = 'Unexpected booking data format.'
      } catch (error) {
        this.bookingsError = error instanceof ApiError ? error.message : 'Unable to load bookings.'
      } finally {
        this.bookingsLoading = false
      }
    },

    async hydrateAll() {
      await this.hydrateScooters()
      await this.hydrateBookings()
    },

    startBooking({ scooterId, hireKey }) {
      const option = this.hireOptions.find((item) => item.key === hireKey)
      const scooter = this.scooters.find((item) => item.id === scooterId)
      const scooterRate = Number(scooter?.hourlyCost || option?.price || 4)
      const priceMultiplier = {
        '1h': 1,
        '4h': 3,
        '1d': 6.25,
        '1w': 27.5,
      }
      this.pendingBooking = {
        id: `PENDING-${Date.now()}`,
        scooterId,
        hireLabel: option?.label || 'Unknown',
        cost: Number((scooterRate * (priceMultiplier[hireKey] || 1)).toFixed(2)),
        hireKey,
      }
      const notifications = useNotificationStore()
      notifications.push('Booking draft created.', 'info')
    },

    async confirmPayment(payload) {
      if (!this.pendingBooking) return null
      const auth = useAuthStore()
      if (!auth.user) {
        throw new ApiError('Please login before confirming payment.', { status: 401, code: 'LOGIN_REQUIRED' })
      }

      const draft = this.pendingBooking
      const created = await bookingApi.createBooking({
        scooterId: draft.scooterId,
        hireKey: draft.hireKey,
      }, auth.user)
      const bookingId = created.id || `BK-${Date.now()}`
      const payment = await bookingApi.payForBooking(bookingId, payload, auth.user)

      this.pendingBooking = null
      await this.hydrateScooters()
      await this.hydrateBookings()

      const notifications = useNotificationStore()
      notifications.push(`Payment successful. ${bookingId} is now active.`, 'success')
      useAnalyticsStore().hydrate()
      return payment.booking || this.bookingById(bookingId)
    },

    async cancelBooking(bookingId) {
      const auth = useAuthStore()
      this.bookings = await bookingApi.cancelBooking(bookingId, auth.user)
      await this.hydrateScooters()
      const notifications = useNotificationStore()
      notifications.push(`Booking ${bookingId} cancelled.`, 'warning')
      useAnalyticsStore().hydrate()
    },

    async extendBooking(bookingId) {
      const auth = useAuthStore()
      this.bookings = await bookingApi.extendBooking(bookingId, auth.user)
      const notifications = useNotificationStore()
      notifications.push(`Booking ${bookingId} extended by 1 hour.`, 'info')
      useAnalyticsStore().hydrate()
    },

    async setScooterAvailability(scooterId, available) {
      this.scooters = await bookingApi.updateScooter(scooterId, { available })
    },

    async setHourlyCost(scooterId, cost) {
      this.scooters = await bookingApi.updateScooter(scooterId, { hourlyCost: cost })
      useAnalyticsStore().hydrate()
    },

    async addScooter(payload) {
      this.scooters = await bookingApi.addScooter(payload)
    },

    async removeScooter(id) {
      this.scooters = await bookingApi.removeScooter(id)
    },

    toggleFavoriteScooter(id) {
      const index = this.favoriteScooterIds.indexOf(id)
      if (index >= 0) {
        this.favoriteScooterIds.splice(index, 1)
      } else {
        this.favoriteScooterIds.unshift(id)
      }
    },
    markScooterViewed(id) {
      this.recentScooterIds = [id, ...this.recentScooterIds.filter((item) => item !== id)].slice(0, 6)
    },

    async setScooterImage(scooterId, imageUrl) {
      this.scooters = await bookingApi.updateScooter(scooterId, { imageUrl })
    },

    async loadBookingDetails(bookingId) {
      const auth = useAuthStore()
      return bookingApi.getBookingById(bookingId, auth.user)
    },
  },
})
