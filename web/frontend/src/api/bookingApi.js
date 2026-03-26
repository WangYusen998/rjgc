import { httpRequest } from './http'

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
}
