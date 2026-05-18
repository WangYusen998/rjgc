# Frontend Delivery Notes

## Scope

- Vue 3 + Vite frontend for SwiftRide.
- Integrates with backend API for auth, scooter listing, booking, and payment.
- Includes UI-only modules (analytics, feedback, notifications).

## Run

```bash
npm install
npm run dev
```

Build and unit tests:

```bash
npm run build
npm run test:unit
```

## Environment

Create/update `.env`:

```env
VITE_API_BASE_URL=http://localhost:8081/api
```

## API Endpoints Used

- `POST /auth/register`
- `POST /auth/login`
- `GET /scooters`
- `POST /bookings`
- `POST /bookings/:bookingId/pay`

## Frontend Responsibilities Implemented

- Form validation (required fields, email format, password strength).
- Loading states for login/register/payment and scooter hydration.
- Friendly API/network error messages by HTTP status.
- Token persistence and token expiry checks on route navigation.
- Route protection for all customer/admin pages.
- Empty/error UI states with retry actions.
- Reusable auth input component.
- Basic accessibility improvements (`for`/`id`, `aria-invalid`, `aria-label`).

## Known Limits

- Final authorization rules are enforced by backend.
- Token expiry parsing assumes JWT format.
- Unit tests currently cover shared frontend utility logic; full page-level tests are not included.

## Quick Acceptance Checklist

- Invalid login does not navigate away from login page.
- Register with duplicate email shows conflict error.
- Protected routes redirect to `/login` when unauthenticated.
- Scooter API failure shows retry prompt on booking/list/map pages.

