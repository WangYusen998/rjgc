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
- `POST /api/bookings` (auth required)
- `POST /api/bookings/:bookingId/pay` (auth required)

## 3) Frontend env

In `frontend/.env` set:

```bash
VITE_API_BASE_URL=http://localhost:8081/api
```

## 4) Admin seed

- Email: `admin@swiftride.com`
- Password: `admin123`
