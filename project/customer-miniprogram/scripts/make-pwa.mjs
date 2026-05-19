import { copyFile, mkdir, readdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const outDir = path.join(root, 'dist', 'build', 'h5')
const indexPath = path.join(outDir, 'index.html')
const iconDir = path.join(outDir, 'icons')
const publicAmapConfigPath = path.join(root, 'public', 'amap-config.json')
const outAmapConfigPath = path.join(outDir, 'amap-config.json')
const cacheVersion = `swiftride-pwa-${Date.now()}`

const manifest = {
  name: 'SwiftRide',
  short_name: 'SwiftRide',
  description: 'SwiftRide customer scooter rental app',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait',
  theme_color: '#0f766e',
  background_color: '#f5f7fb',
  icons: [
    { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' },
  ],
}

const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="112" fill="#0f766e"/>
  <circle cx="162" cy="332" r="48" fill="#ffffff"/>
  <circle cx="354" cy="332" r="48" fill="#ffffff"/>
  <path d="M162 332h84l58-116h58" fill="none" stroke="#ffffff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M228 332l-48-96h-44" fill="none" stroke="#ffffff" stroke-width="34" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M122 174h116" stroke="#86efac" stroke-width="38" stroke-linecap="round"/>
</svg>`

const sw = `const CACHE_NAME = '${cacheVersion}';
const APP_SHELL = ['/', '/index.html', '/manifest.webmanifest', '/icons/icon.svg', '/amap-config.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(APP_SHELL.map((url) => cache.add(url).catch(() => undefined))),
    ),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
    ),
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(request));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/index.html')));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        const copy = response.clone();
        if (request.method === 'GET' && response.ok && url.origin === self.location.origin) {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});`

await mkdir(iconDir, { recursive: true })
await writeFile(path.join(outDir, 'manifest.webmanifest'), JSON.stringify(manifest, null, 2))
await writeFile(path.join(iconDir, 'icon.svg'), iconSvg)
await writeFile(path.join(outDir, 'sw.js'), sw)
try {
  await copyFile(publicAmapConfigPath, outAmapConfigPath)
} catch {
  // The map page already falls back to the illustrated campus map when no runtime config exists.
}

let html = await readFile(indexPath, 'utf8')
const pwaHeadTags = [
  '<meta name="theme-color" content="#0f766e" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-title" content="SwiftRide" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
  '<link rel="manifest" href="/manifest.webmanifest" />',
  '<link rel="icon" href="/icons/icon.svg" />',
  '<link rel="apple-touch-icon" href="/icons/icon.svg" />',
]

const serviceWorkerScript = `    <script>
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
          navigator.serviceWorker.register('/sw.js').catch(() => undefined);
        });
      }
    </script>`

if (!html.includes('<html')) {
  const head = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    ${pwaHeadTags.join('\n    ')}
    <title>SwiftRide</title>
`
  const lines = html.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
  const headTags = lines.filter((line) => line.startsWith('<script ') || line.startsWith('<link rel="stylesheet"'))
  const bodyTags = lines.filter((line) => !headTags.includes(line))

  html = `${head}${headTags.join('\n')}
  </head>
  <body>
${bodyTags.join('\n')}
${serviceWorkerScript}
  </body>
</html>
`
} else {
  for (const tag of pwaHeadTags) {
    const name = tag.match(/name="([^"]+)"/)?.[1]
    const rel = tag.match(/rel="([^"]+)"/)?.[1]
    const marker = name ? `name="${name}"` : rel ? `rel="${rel}"` : tag
    if (marker && html.includes(marker)) continue
    html = html.replace('</head>', `    ${tag}\n  </head>`)
  }
  if (!html.includes("navigator.serviceWorker.register('/sw.js')")) {
    html = html.replace('</body>', `${serviceWorkerScript}\n  </body>`)
  }
}

await writeFile(indexPath, html)

const files = await readdir(outDir)
console.log(`PWA files written to ${outDir}`)
console.log(files.join('\n'))
