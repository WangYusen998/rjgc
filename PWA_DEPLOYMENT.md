# SwiftRide PWA Deployment

This folder can now build the WeChat Mini Program and the PWA from the same uni-app source.

## Build PWA

```powershell
cd customer-miniprogram
npm install
npm run build:pwa
```

The deployable PWA files are generated in:

```text
customer-miniprogram/dist/build/h5
```

Upload the contents of that folder to the web root on the server.

## API URL

For PWA builds, the default API base is same-origin:

```text
/api
```

That means if the app is opened at:

```text
http://your-server/
```

the frontend will call:

```text
http://your-server/api
```

This is recommended because the browser will not accidentally call `127.0.0.1` on the user's phone.

If the backend is hosted on another domain, build with:

```powershell
$env:VITE_API_BASE_URL="https://api.example.com/api"
npm run build:pwa
```

## Example Nginx Config

```nginx
server {
    listen 80;
    server_name your-server-ip-or-domain;

    root /var/www/swiftride-pwa;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8081/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Local Preview

```powershell
cd customer-miniprogram
npm run build:pwa
python -m http.server 4175 --bind 127.0.0.1 --directory dist/build/h5
```

Open:

```text
http://127.0.0.1:4175/
```

## Notes

- The WeChat Mini Program build is still available with `npm run build:mp-weixin`.
- PWA scan actions use a browser fallback: enter a scooter QR code such as `SR-SC101` or `SC101`.
- PWA navigation opens an external web map link.
- Browser geolocation usually requires HTTPS on a real domain.
