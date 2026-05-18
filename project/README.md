# SwiftRide App + Web Split

This folder is a separate working copy for changing the project into:

- `customer-app`: mobile app style customer interface.
- `customer-miniprogram`: WeChat Mini Program customer client.
- `management-web`: desktop web management interface.
- `backend`: shared Express + MySQL API.
- `docs`: notes for the split and coursework evidence.

The original `../web` folder is untouched.

## Target Shape

The customer side should behave like an app:

- `customer-miniprogram` is the deployable WeChat Mini Program version.
- Mobile-first layout.
- Bottom tab navigation.
- Customer routes only: register, login, scooters, map, booking, payment, history, feedback.
- Optional PWA setup so it can be presented as an installable app-style client.

The management side should behave like a web admin system:

- Desktop-first dashboard.
- Admin routes only: users, bookings, scooters, revenue, issues.
- Sidebar/table based workflows for management duties.

Both clients use the same backend API:

```bash
VITE_API_BASE_URL=http://localhost:8081/api
```

## Suggested Dev Ports

```bash
# Backend
cd backend
npm install
npm run dev

# Customer app
cd customer-app
npm install
npm run dev
# http://127.0.0.1:5175/

# WeChat Mini Program customer client
cd customer-miniprogram
pnpm install
pnpm run build:mp-weixin
# Open customer-miniprogram/dist/build/mp-weixin in WeChat DevTools

# Management web
cd management-web
npm install
npm run dev
# http://127.0.0.1:5176/
```

## Next Edits

1. In `customer-miniprogram/src/manifest.json`, replace `wx-your-appid-here` with the real WeChat Mini Program AppID.
2. In `customer-miniprogram/src/api/config.js`, replace the local API URL with the production HTTPS API domain before submission.
3. In WeChat DevTools, disable domain checks only for local development. Production must use a registered HTTPS request domain.
4. In `management-web`, make `/admin` the default entry and remove public/customer navigation.
5. Keep backend routes shared unless an endpoint is only useful to one client.
