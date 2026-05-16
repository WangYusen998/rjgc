# SwiftRide Customer Mini Program

This is the WeChat Mini Program customer client for SwiftRide.

## What It Contains

- Home dashboard.
- Scooter list.
- WeChat map page.
- Booking and demo card payment flow.
- Booking history with cancel and extend actions.
- Login and registration.
- Feedback and issue reporting.

It uses the shared backend API in `../backend`.

## Local Development

Start backend and MySQL first, then:

```bash
cd customer-miniprogram
pnpm install
pnpm run dev:mp-weixin
```

Open the generated `dist/dev/mp-weixin` folder in WeChat DevTools.

For local testing in WeChat DevTools, enable:

```text
Details -> Local Settings -> Do not verify valid domain names, web-view, TLS versions and HTTPS certificates
```

## Production Build

```bash
pnpm run build:mp-weixin
```

Open this folder in WeChat DevTools:

```text
customer-miniprogram/dist/build/mp-weixin
```

## Before Uploading To WeChat

1. Replace `wx-your-appid-here` in `src/manifest.json` with the real Mini Program AppID.
2. Deploy the backend to an HTTPS domain.
3. Update `src/api/config.js`:

```js
export const API_BASE_URL = 'https://your-domain.example/api'
```

4. Add that HTTPS domain to the Mini Program request合法域名 list in the WeChat Mini Program admin console.

Localhost APIs are only for development and cannot pass production review.
