# SwiftRide Backend (MySQL)

## 1) Setup

1. Create `.env` from `.env.example`.
2. Execute SQL script `sql/init_swiftride.sql` in MySQL.
3. Install dependencies and run server.

```bash
cd backend
npm install
npm run dev
```

Server default: `http://localhost:8081`

Initialize database:

```bash
mysql -u root -p < sql/init_swiftride.sql
```

## 2) API used by frontend

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/scooters`
- `POST /api/scooters` / `PATCH /api/scooters/:scooterId` / `DELETE /api/scooters/:scooterId` (admin)
- `POST /api/bookings` (auth required)
- `POST /api/bookings/:bookingId/pay` (auth required)
- `GET /api/bookings` / `GET /api/bookings/:bookingId` (auth required)
- `POST /api/bookings/:bookingId/cancel` / `POST /api/bookings/:bookingId/extend` (auth required)
- `GET /api/issues` / `POST /api/issues` (auth required)
- `PATCH /api/issues/:issueId` (admin)
- `GET /api/admin/users` / `PATCH /api/admin/users/:userId` (admin)
- `GET /api/admin/income` (admin)

The backend now owns scooter telemetry, GPS, mileage, battery monitoring, QR communication status, rental modes, return checks, electricity difference, overtime fees, damage inspection, insurance notes, deployment staff, charging status, and fault management. The frontend API layer calls these endpoints instead of the old local demo data service.

## 3) Frontend env

In `frontend/.env` set:

```bash
VITE_API_BASE_URL=http://localhost:8081/api
```

## 4) Admin seed

- Email: `admin@swiftride.com`
- Password: `admin123`
