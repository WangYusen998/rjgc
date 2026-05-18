# SwiftRide Integrated Package

This folder contains the current integrated project for packaging:

- `backend`: Express API, MySQL/MariaDB connection, database sync endpoint.
- `customer-miniprogram`: WeChat Mini Program customer client.
- `management-web`: browser-based backend management web page.
- `docs`: project notes.

## Local Run Order

```powershell
cd backend
npm install
npm run db:start
npm run db:init
npm run start
```

Backend API:

```text
http://127.0.0.1:8081/api
```

Management web:

```powershell
cd management-web
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5176/
```

WeChat Mini Program:

```powershell
cd customer-miniprogram
npm install
npm run build:mp-weixin
```

Then open this folder in WeChat Developer Tools:

```text
customer-miniprogram/dist/build/mp-weixin
```

## Data Sync

In the Mini Program `我的` page, open `同步本地数据`, then tap `立即同步`.
It posts local users, bookings, scooter states, and issue reports to:

```text
POST http://127.0.0.1:8081/api/sync/local
```

