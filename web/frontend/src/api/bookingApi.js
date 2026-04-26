import { httpRequest } from '@/api/http'

export const bookingApi = {
  listScooters() {
    return httpRequest('/scooters')
  },
  createBooking(payload) {
    return httpRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  payForBooking(bookingId, payload) {
    return httpRequest(`/bookings/${bookingId}/pay`, {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  listBookings() {
    return httpRequest('/bookings')
  },
  getBookingById(bookingId) {
    return httpRequest(`/bookings/${bookingId}`)
  },
  cancelBooking(bookingId) {
    return httpRequest(`/bookings/${bookingId}/cancel`, { method: 'POST' })
  },
  extendBooking(bookingId) {
    return httpRequest(`/bookings/${bookingId}/extend`, { method: 'POST' })
  },
  addScooter(payload) {
    return httpRequest('/scooters', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  updateScooter(scooterId, changes) {
    return httpRequest(`/scooters/${scooterId}`, {
      method: 'PATCH',
      body: JSON.stringify(changes),
    })
  },
  removeScooter(scooterId) {
    return httpRequest(`/scooters/${scooterId}`, { method: 'DELETE' })
  },
}
