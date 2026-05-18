import { getCurrentUser } from './mock'
import { getLang } from './i18n'

export function isLoggedIn() {
  const user = getCurrentUser()
  return Boolean(user?.account)
}

export function requireLogin() {
  if (isLoggedIn()) return true

  const isEn = getLang() === 'en'
  uni.showModal({
    title: isEn ? 'Log in required' : '请先登录',
    content: isEn
      ? 'You can browse scooter details first. Please log in before booking or scanning to rent.'
      : '可以先浏览车辆信息，预约或扫码租车前需要先登录。',
    confirmText: isEn ? 'Log In' : '去登录',
    cancelText: isEn ? 'Browse' : '先逛逛',
    success: (res) => {
      if (res.confirm) uni.navigateTo({ url: '/pages/auth/login' })
    },
  })

  return false
}
