const LANG_KEY = 'swiftride_lang'

export const languageOptions = [
  { code: 'zh', name: '中文', subtitle: '中国校园共享电动滑板车演示' },
  { code: 'en', name: 'English', subtitle: 'Shared scooter demo for UK-style users' },
]

export const copy = {
  zh: {
    tabs: ['首页', '车辆', '地图', '订单', '我的'],
    appName: 'SwiftRide',
    chooseLanguage: '选择语言',
    languageHint: '进入小程序前先选择语言，之后所有主要页面将保持同一种语言。',
    continue: '进入小程序',
    homeTitle: '扫码解锁，按点还车。',
    homeCopy: '已接入实时 GPS、电量里程监测、实名认证/信用卡注册、门店租还和后台调度演示。',
    scan: '扫码租车',
    scooters: '附近车辆',
    map: '地图',
    orders: '订单',
    profile: '我的',
    login: '登录',
    register: '注册',
    admin: '管理员系统',
    adminLogin: '管理员登录',
    safety: '安全责任',
    operations: '后台运营',
    pay: '模拟支付',
    cancel: '取消订单',
    extend: '延期 15 分钟',
    returnByApp: 'APP 还车',
    paid: '已支付',
    cancelled: '已取消',
    ongoing: '进行中',
    returned: '已还车',
  },
  en: {
    tabs: ['Home', 'Scooters', 'Map', 'Orders', 'Profile'],
    appName: 'SwiftRide',
    chooseLanguage: 'Choose Language',
    languageHint: 'Choose a language before entering. Main pages will keep one language consistently.',
    continue: 'Enter App',
    homeTitle: 'Scan, unlock, and return in approved zones.',
    homeCopy: 'Includes live GPS, battery and mileage telemetry, verified registration, card binding, store rental, and admin operations.',
    scan: 'Scan to Rent',
    scooters: 'Nearby Scooters',
    map: 'Map',
    orders: 'Orders',
    profile: 'Profile',
    login: 'Log In',
    register: 'Register',
    admin: 'Admin System',
    adminLogin: 'Admin Login',
    safety: 'Safety & Liability',
    operations: 'Operations',
    pay: 'Mock Payment',
    cancel: 'Cancel Order',
    extend: 'Extend 15 min',
    returnByApp: 'Return in App',
    paid: 'Paid',
    cancelled: 'Cancelled',
    ongoing: 'Ongoing',
    returned: 'Returned',
  },
}

export function getLang() {
  return uni.getStorageSync(LANG_KEY) || ''
}

export function isEnglish() {
  return getLang() === 'en'
}

export function setLang(lang) {
  uni.setStorageSync(LANG_KEY, lang)
  applyTabBarLanguage(lang)
}

export function currentCopy() {
  return copy[getLang() || 'zh']
}

export function ensureLanguage() {
  if (!getLang()) {
    uni.reLaunch({ url: '/pages/language/index' })
    return false
  }
  applyTabBarLanguage(getLang())
  return true
}

export function applyTabBarLanguage(lang = getLang() || 'zh') {
  const labels = copy[lang].tabs
  labels.forEach((text, index) => {
    try {
      uni.setTabBarItem({ index, text, fail: () => {} })
    } catch (error) {
      // Some non-tab pages call this before the tabbar is mounted.
    }
  })
}

export function setNavTitle(zh, en) {
  try {
    uni.setNavigationBarTitle({ title: isEnglish() ? en : zh })
  } catch (error) {
    // Some simulator states may call this before the page navigation bar is ready.
  }
}

export const uiText = {
  zh: {
    available: '可租',
    reserved: '已预约',
    charging: '充电中',
    maintenance: '维修中',
    ongoing: '进行中',
    paid: '已完成',
    returned: '已还车',
    cancelled: '已取消',
    overdue: '已超时',
    yes: '是',
    no: '否',
    selected: '已选',
    notSelected: '未选',
    pending: '待支付',
    none: '无',
    availableHelmet: '可用',
    missing: '缺失',
    online: '在线',
    locked: '已上锁',
    reservedLock: '预订锁定',
    chargingLock: '充电锁定',
    maintenanceLock: '维修锁定',
    mockWallet: '模拟钱包',
    wechatPayDemo: '微信支付演示',
    chinaBankCard: '中国银行卡',
    minuteUnit: '分钟',
    yuan: '元',
    yuanPerMinute: '元/分钟',
  },
  en: {
    available: 'Available',
    reserved: 'Reserved',
    charging: 'Charging',
    maintenance: 'Maintenance',
    ongoing: 'Ongoing',
    paid: 'Paid',
    returned: 'Returned',
    cancelled: 'Cancelled',
    overdue: 'Overdue',
    yes: 'Yes',
    no: 'No',
    selected: 'Selected',
    notSelected: 'Not selected',
    pending: 'Pending payment',
    none: 'None',
    availableHelmet: 'Available',
    missing: 'Missing',
    online: 'Online',
    locked: 'Locked',
    reservedLock: 'Reserved lock',
    chargingLock: 'Charging lock',
    maintenanceLock: 'Maintenance lock',
    mockWallet: 'Mock Wallet',
    wechatPayDemo: 'WeChat Pay Demo',
    chinaBankCard: 'China Bank Card',
    minuteUnit: 'min',
    yuan: 'CNY',
    yuanPerMinute: 'CNY/min',
  },
}

export function t(key) {
  return (uiText[getLang() || 'zh'] || uiText.zh)[key] || key
}

export function translateValue(value) {
  const enMap = {
    中国: 'China',
    英国: 'United Kingdom',
    中国银行卡: 'China bank card',
    模拟钱包: 'Mock Wallet',
    微信支付演示: 'WeChat Pay Demo',
    在线: 'Online',
    已上锁: 'Locked',
    预订锁定: 'Reserved lock',
    充电锁定: 'Charging lock',
    维修锁定: 'Maintenance lock',
    可用: 'Available',
    缺失: 'Missing',
    无: 'None',
    待支付: 'Pending payment',
  }
  if (!isEnglish()) return value
  return enMap[value] || value
}
