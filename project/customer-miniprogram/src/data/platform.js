import jsQR from 'jsqr'

export function scanCode(options = {}) {
  // #ifdef H5
  openBrowserQrScanner(options)
  return
  // #endif

  uni.scanCode(options)
}

async function openBrowserQrScanner(options = {}) {
  if (!navigator.mediaDevices?.getUserMedia) {
    fallbackPhotoScan(options, '当前浏览器不支持实时摄像头扫码')
    return
  }

  const overlay = document.createElement('div')
  overlay.className = 'swiftride-scanner'
  overlay.innerHTML = `
    <div class="swiftride-scanner__panel">
      <div class="swiftride-scanner__top">
        <strong>扫码租车</strong>
        <button type="button" class="swiftride-scanner__close">取消</button>
      </div>
      <div class="swiftride-scanner__camera">
        <video class="swiftride-scanner__video" playsinline muted></video>
        <div class="swiftride-scanner__frame"></div>
      </div>
      <p class="swiftride-scanner__hint">请将车辆二维码放入取景框</p>
      <button type="button" class="swiftride-scanner__manual">手动输入编号</button>
    </div>
  `
  document.body.appendChild(overlay)
  ensureScannerStyle()

  const video = overlay.querySelector('video')
  const closeButton = overlay.querySelector('.swiftride-scanner__close')
  const manualButton = overlay.querySelector('.swiftride-scanner__manual')
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d', { willReadFrequently: true })
  let stream
  let stopped = false
  let frameId = 0

  const cleanup = () => {
    stopped = true
    if (frameId) cancelAnimationFrame(frameId)
    stream?.getTracks().forEach((track) => track.stop())
    overlay.remove()
  }

  closeButton.addEventListener('click', () => {
    cleanup()
    options.fail?.(new Error('Scan cancelled'))
  })

  manualButton.addEventListener('click', () => {
    cleanup()
    fallbackManualScan(options)
  })

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      audio: false,
    })
    video.srcObject = stream
    await video.play()

    const detector = 'BarcodeDetector' in window ? new window.BarcodeDetector({ formats: ['qr_code'] }) : null

    const finish = (result) => {
      cleanup()
      options.success?.({ result })
    }

    const scanFrame = async () => {
      if (stopped) return
      if (video.readyState >= 2 && video.videoWidth && video.videoHeight) {
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        context.drawImage(video, 0, 0, canvas.width, canvas.height)

        if (detector) {
          try {
            const codes = await detector.detect(canvas)
            const value = codes[0]?.rawValue
            if (value) {
              finish(value)
              return
            }
          } catch {
            // Fall through to jsQR.
          }
        }

        const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
        const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'dontInvert' })
        if (code?.data) {
          finish(code.data)
          return
        }
      }
      frameId = requestAnimationFrame(scanFrame)
    }

    scanFrame()
  } catch (error) {
    cleanup()
    fallbackPhotoScan(options, error?.message || '无法打开摄像头')
  }
}

function fallbackPhotoScan(options = {}, reason = '') {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'image/*'
  input.capture = 'environment'
  input.style.position = 'fixed'
  input.style.left = '-9999px'
  input.style.opacity = '0'
  document.body.appendChild(input)

  const remove = () => input.remove()

  input.addEventListener('change', () => {
    const file = input.files?.[0]
    if (!file) {
      remove()
      options.fail?.(new Error('Scan cancelled'))
      return
    }

    const image = new Image()
    image.onload = () => {
      const canvas = document.createElement('canvas')
      const maxSize = 1200
      const scale = Math.min(1, maxSize / Math.max(image.width, image.height))
      canvas.width = Math.max(1, Math.round(image.width * scale))
      canvas.height = Math.max(1, Math.round(image.height * scale))
      const context = canvas.getContext('2d', { willReadFrequently: true })
      context.drawImage(image, 0, 0, canvas.width, canvas.height)
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' })
      URL.revokeObjectURL(image.src)
      remove()

      if (code?.data) {
        options.success?.({ result: code.data })
      } else {
        fallbackManualScan(options, '未识别到二维码，请重新拍摄或手动输入编号')
      }
    }
    image.onerror = () => {
      URL.revokeObjectURL(image.src)
      remove()
      fallbackManualScan(options, '图片读取失败，请手动输入编号')
    }
    image.src = URL.createObjectURL(file)
  })

  input.click()

  if (reason) {
    setTimeout(() => {
      uni.showToast?.({ title: '已切换为拍照识别', icon: 'none' })
    }, 100)
  }
}

function fallbackManualScan(options = {}, reason = '') {
  const label = reason ? `${reason}\n\n请输入车辆二维码编号，例如 SR-SC101 或 SC101` : '请输入车辆二维码编号，例如 SR-SC101 或 SC101'
  const result = window.prompt(label, 'SR-SC101')
  if (result && result.trim()) {
    options.success?.({ result: result.trim() })
  } else {
    options.fail?.()
  }
}

function ensureScannerStyle() {
  if (document.getElementById('swiftride-scanner-style')) return
  const style = document.createElement('style')
  style.id = 'swiftride-scanner-style'
  style.textContent = `
    .swiftride-scanner {
      position: fixed;
      inset: 0;
      z-index: 99999;
      display: flex;
      align-items: stretch;
      justify-content: center;
      background: #05070a;
      color: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    .swiftride-scanner__panel {
      width: min(100vw, 520px);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: max(18px, env(safe-area-inset-top)) 18px max(20px, env(safe-area-inset-bottom));
      box-sizing: border-box;
    }
    .swiftride-scanner__top {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 18px;
    }
    .swiftride-scanner__close,
    .swiftride-scanner__manual {
      border: 0;
      border-radius: 999px;
      background: rgba(255, 255, 255, 0.14);
      color: #fff;
      font-size: 15px;
      font-weight: 800;
      padding: 10px 16px;
    }
    .swiftride-scanner__camera {
      position: relative;
      flex: 1;
      min-height: 420px;
      overflow: hidden;
      border-radius: 28px;
      background: #111827;
    }
    .swiftride-scanner__video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .swiftride-scanner__frame {
      position: absolute;
      left: 50%;
      top: 50%;
      width: min(70vw, 300px);
      aspect-ratio: 1;
      transform: translate(-50%, -50%);
      border: 4px solid #86efac;
      border-radius: 28px;
      box-shadow: 0 0 0 999px rgba(0, 0, 0, 0.34);
    }
    .swiftride-scanner__hint {
      margin: 18px 0 14px;
      color: rgba(255, 255, 255, 0.82);
      text-align: center;
      font-size: 15px;
    }
    .swiftride-scanner__manual {
      min-height: 48px;
      background: linear-gradient(135deg, #111827 0%, #0f766e 100%);
    }
  `
  document.head.appendChild(style)
}

export function getLocation(options = {}) {
  // #ifdef H5
  if (!navigator.geolocation) {
    options.fail?.(new Error('Geolocation is not supported'))
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      options.success?.({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      })
    },
    (error) => options.fail?.(error),
    { enableHighAccuracy: true, timeout: 8000 },
  )
  return
  // #endif

  uni.getLocation(options)
}

export function openLocation(options = {}) {
  // #ifdef H5
  const { latitude, longitude, name = 'SwiftRide', address = '' } = options
  const label = encodeURIComponent(name || address || 'SwiftRide')
  const url = `https://uri.amap.com/marker?position=${longitude},${latitude}&name=${label}`
  window.open(url, '_blank', 'noopener,noreferrer')
  return
  // #endif

  uni.openLocation(options)
}
