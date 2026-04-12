import {
  addDemoScooter,
  cancelDemoBooking,
  createDemoBooking,
  extendDemoBooking,
  getDemoBookingById,
  listDemoBookings,
  listDemoScooters,
  payDemoBooking,
  removeDemoScooter,
  updateDemoScooter,
} from '@/services/demoData'

export const bookingApi = {
  listScooters() {
    return Promise.resolve(listDemoScooters())
  },
  createBooking(payload, currentUser) {
    return createDemoBooking(payload, currentUser)
  },
  payForBooking(bookingId, payload, currentUser) {
    return payDemoBooking(bookingId, payload, currentUser)
  },
  listBookings(currentUser) {
    return Promise.resolve(listDemoBookings(currentUser))
  },
  getBookingById(bookingId, currentUser) {
    return Promise.resolve(getDemoBookingById(bookingId, currentUser))
  },
  cancelBooking(bookingId, currentUser) {
    return Promise.resolve(cancelDemoBooking(bookingId, currentUser))
  },
  extendBooking(bookingId, currentUser) {
    return Promise.resolve(extendDemoBooking(bookingId, currentUser))
  },
  addScooter(payload) {
    return Promise.resolve(addDemoScooter(payload))
  },
  updateScooter(scooterId, changes) {
    return Promise.resolve(updateDemoScooter(scooterId, changes))
  },
  removeScooter(scooterId) {
    return Promise.resolve(removeDemoScooter(scooterId))
  },
}
