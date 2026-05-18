# SwiftRide Customer Mini Program Delivery

## Current Status

- WeChat Mini Program source has been expanded under `src/`.
- Development watcher is running with:

```bash
npm run dev:mp-weixin
```

- Realtime output directory:

```text
dist/dev/mp-weixin
```

- Release build command:

```bash
npm run build:mp-weixin
```

- Release output directory:

```text
dist/build/mp-weixin
```

## Implemented Functions

- Home dashboard with scooter availability, nearby stores, active order, and scan-to-ride entry.
- Real QR scan flow through `uni.scanCode`.
- Live map through WeChat mini program `map`, `uni.getLocation`, and `uni.openLocation`.
- Nearby store recommendation and navigation.
- Scooter list by store, scooter details, telemetry, battery/range/mileage display.
- Booking creation, duration selection, insurance option, and price estimate.
- Order list, order detail, simulated payment, cancel, and 15-minute extension.
- Profile update and reset-password demo prompt.
- Feedback/fault report form.
- WeChat privacy declarations for location APIs in generated `app.json`.

## How To Open In WeChat DevTools

1. Open WeChat DevTools from:

```text
D:\微信web开发者工具\wechatdevtools.exe
```

2. Import this project folder:

```text
C:\Users\17316\Documents\Codex\2026-05-10\files-mentioned-by-the-user-312\312_extracted\312\swiftride-app-web\customer-miniprogram
```

The root `project.config.json` points to `dist/dev/mp-weixin`, so the DevTools preview can follow the running watcher.

3. If DevTools asks for an AppID, replace `wx-your-appid-here` in:

```text
src/manifest.json
project.config.json
```

For local preview only, you can use a test AppID or DevTools test mode. For upload/release, a real WeChat Mini Program AppID and configured HTTPS request domain are required by WeChat.

## Phone Preview Notes

- Use DevTools `Preview` to generate a QR code and scan it with WeChat on your phone.
- Scan-code and location features require phone permission approval.
- This version uses local demo data so it works without paid cloud services. Connecting production backend later only requires replacing the mock data calls with `/api` requests.
