import { defineStore } from 'pinia'
import { bookingApi } from '@/api/bookingApi'
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
    scooters: [
      { id: 'SC-101', location: 'Station A', available: true, hourlyCost: 4, imageUrl: '/scooter-placeholder.svg' },
      { id: 'SC-102', location: 'Station B', available: true, hourlyCost: 4, imageUrl: '/scooter-placeholder.svg' },
      { id: 'SC-103', location: 'Station C', available: false, hourlyCost: 5, imageUrl: '/scooter-placeholder.svg' },
      { id: 'SC-104', location: 'Station D', available: true, hourlyCost: 4, imageUrl: '/scooter-placeholder.svg' },
      { id: 'SC-105', location: 'Station E', available: true, hourlyCost: 4, imageUrl: '/scooter-placeholder.svg' },
    ],
    bookings: [
      {
        id: 'BK-1001',
        scooterId: 'SC-101',
        hireLabel: '1 Hour',
        cost: 4,
        status: 'active',
        createdAt: '2026-03-09',
        timeline: [
          { step: 'Created', time: '2026-03-09 09:00' },
          { step: 'Paid', time: '2026-03-09 09:01' },
          { step: 'Active', time: '2026-03-09 09:02' },
        ],
      },
      {
        id: 'BK-1002',
        scooterId: 'SC-104',
        hireLabel: '1 Day',
        cost: 25,
        status: 'completed',
        createdAt: '2026-03-08',
        timeline: [
          { step: 'Created', time: '2026-03-08 13:00' },
          { step: 'Paid', time: '2026-03-08 13:01' },
          { step: 'Active', time: '2026-03-08 13:02' },
          { step: 'Completed', time: '2026-03-08 18:20' },
        ],
      },
    ],
    pendingBooking: null,
    favoriteScooterIds: [],
    recentScooterIds: [],
    scootersLoading: false,
    scootersError: '',
  }),
  getters: {
    activeBookings: (state) => state.bookings.filter((item) => item.status === 'active'),
    selectedScooter: (state) => (id) => state.scooters.find((item) => item.id === id),
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

    startBooking({ scooterId, hireKey }) {
      const option = this.hireOptions.find((item) => item.key === hireKey)
      this.pendingBooking = {
        id: `PENDING-${Date.now()}`,
        scooterId,
        hireLabel: option?.label || 'Unknown',
        cost: option?.price || 0,
        hireKey,
      }
      const notifications = useNotificationStore()
      notifications.push('Booking draft created.', 'info')
    },

    async confirmPayment(payload) {
      if (!this.pendingBooking) return null

      const draft = this.pendingBooking
      const created = await bookingApi.createBooking({
        scooterId: draft.scooterId,
        hireKey: draft.hireKey,
      })
      const bookingId = created.id || `BK-${Date.now()}`
      await bookingApi.payForBooking(bookingId, payload)

      const finalized = {
        id: bookingId,
        scooterId: draft.scooterId,
        hireLabel: draft.hireLabel,
        cost: draft.cost,
        status: 'active',
        createdAt: new Date().toISOString().slice(0, 10),
        timeline: [
          { step: 'Created', time: new Date().toLocaleString() },
          { step: 'Paid', time: new Date().toLocaleString() },
          { step: 'Active', time: new Date().toLocaleString() },
        ],
      }
      this.bookings.unshift(finalized)

      const scooter = this.scooters.find((item) => item.id === draft.scooterId)
      if (scooter) scooter.available = false

      this.pendingBooking = null
      const notifications = useNotificationStore()
      notifications.push(`Payment successful. ${bookingId} is now active.`, 'success')
      return finalized
    },

    cancelBooking(bookingId) {
      const target = this.bookings.find((item) => item.id === bookingId)
      if (!target) return
      target.status = 'cancelled'
      if (!Array.isArray(target.timeline)) target.timeline = []
      target.timeline.push({ step: 'Cancelled', time: new Date().toLocaleString() })
      const scooter = this.scooters.find((item) => item.id === target.scooterId)
      if (scooter) scooter.available = true
      const notifications = useNotificationStore()
      notifications.push(`Booking ${bookingId} cancelled.`, 'warning')
    },
    extendBooking(bookingId) {
      const target = this.bookings.find((item) => item.id === bookingId)
      if (!target || target.status !== 'active') return
      target.cost += 4
      target.hireLabel = `${target.hireLabel} +1h`
      if (!Array.isArray(target.timeline)) target.timeline = []
      target.timeline.push({ step: 'Extended +1h', time: new Date().toLocaleString() })
      const notifications = useNotificationStore()
      notifications.push(`Booking ${bookingId} extended by 1 hour.`, 'info')
    },
    setScooterAvailability(scooterId, available) {
      const scooter = this.scooters.find((item) => item.id === scooterId)
      if (scooter) scooter.available = available
    },
    setHourlyCost(scooterId, cost) {
      const scooter = this.scooters.find((item) => item.id === scooterId)
      if (scooter) scooter.hourlyCost = cost
    },
    addScooter(payload) {
      this.scooters.unshift({
        id: payload.id,
        location: payload.location,
        available: payload.available ?? true,
        hourlyCost: Number(payload.hourlyCost) || 4,
        imageUrl: payload.imageUrl || '/scooter-placeholder.svg',
      })
    },
    removeScooter(id) {
      const index = this.scooters.findIndex((item) => item.id === id)
      if (index >= 0) this.scooters.splice(index, 1)
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
    setScooterImage(scooterId, imageUrl) {
      const scooter = this.scooters.find((item) => item.id === scooterId)
      if (scooter) scooter.imageUrl = imageUrl || '/scooter-placeholder.svg'
    },
  },
})
