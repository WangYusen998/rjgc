# App + Web Split Plan

## Customer App

Routes to keep:

- `/login`
- `/register`
- `/customer`
- `/customer/scooters`
- `/customer/map`
- `/customer/booking`
- `/customer/payment`
- `/customer/history`
- `/customer/history/:bookingId`
- `/customer/feedback`

Main UI changes:

- Replace website header/footer with a mobile app shell.
- Add bottom tab navigation for Home, Scooters, Map, Bookings, Profile.
- Use compact cards, fixed bottom actions, and touch-sized controls.
- Add PWA manifest later if needed.

## Management Web

Routes to keep:

- `/admin`
- `/admin/users`
- `/admin/bookings`
- `/admin/bookings/:bookingId`
- `/admin/scooters`
- `/admin/revenue`
- `/admin/issues`

Main UI changes:

- Keep the admin sidebar and desktop dashboard.
- Make `/` redirect to `/admin` or show a management login.
- Remove customer marketing/navigation from this app.

## Backend

Keep as the shared API:

- `/api/auth`
- `/api/scooters`
- `/api/bookings`
- `/api/admin`
- `/api/issues`

No major backend split is needed unless the coursework asks for separate deployments.
