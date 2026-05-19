import { isEnglish } from './i18n'

export const stores = [
  {
    id: 'st-01',
    name: '犀安路北门站',
    address: '西南交通大学犀浦校区北门 · 犀安路 999 号',
    latitude: 30.7689,
    longitude: 103.9843,
    open: '07:00-23:30',
    available: 7,
    rating: 4.8,
  },
  {
    id: 'st-02',
    name: '图书馆广场站',
    address: '犀浦校区图书馆东侧广场',
    latitude: 30.7648,
    longitude: 103.9848,
    open: '24 小时',
    available: 6,
    rating: 4.7,
  },
  {
    id: 'st-03',
    name: '交大兴业北街站',
    address: '地铁 6 号线交大兴业北街站出口附近',
    latitude: 30.7718,
    longitude: 103.9901,
    open: '06:30-22:30',
    available: 4,
    rating: 4.6,
  },
  {
    id: 'st-04',
    name: '南区生活广场站',
    address: '西南交通大学犀浦校区南区生活广场',
    latitude: 30.7599,
    longitude: 103.9817,
    open: '08:00-22:00',
    available: 5,
    rating: 4.9,
  },
]

export const scooterModels = [
  {
    id: 'Swift One',
    name: '轻行款',
    image: '/static/scooters/swift-one.jpg',
    price: 1.2,
    storePrice: 38,
    deposit: 99,
    topSpeed: '20 km/h',
    range: '35 km',
    motor: '350 W',
    batterySpec: '36V 10Ah',
    weight: '14.8 kg',
    description: '适合校内短途通勤，车身轻、起步柔和，适合新用户。',
  },
  {
    id: 'Swift Plus',
    name: '长续航款',
    image: '/static/scooters/swift-plus.jpg',
    price: 1.5,
    storePrice: 48,
    deposit: 129,
    topSpeed: '25 km/h',
    range: '45 km',
    motor: '500 W',
    batterySpec: '48V 12Ah',
    weight: '17.2 kg',
    description: '续航更长，带前减震和更大踏板，适合跨校门、地铁站接驳。',
  },
  {
    id: 'Swift City',
    name: '城市耐用款',
    image: '/static/scooters/swift-city.jpg',
    price: 1.0,
    storePrice: 32,
    deposit: 89,
    topSpeed: '18 km/h',
    range: '30 km',
    motor: '350 W',
    batterySpec: '36V 9Ah',
    weight: '16.5 kg',
    description: '轮胎更稳、车架更耐用，适合门店日租和高频调度车辆。',
  },
]

export const rentalModes = [
  {
    id: 'sharing-cn',
    name: '共享扫码租车',
    scene: '中国校园',
    requirement: '注册时完成实名认证，扫码解锁，APP 内检查还车点后还车。',
  },
  {
    id: 'sharing-uk',
    name: '共享扫码租车',
    scene: '英国城市',
    requirement: '注册时绑定信用卡，扫码解锁，APP 内检查还车点后还车。',
  },
  {
    id: 'walk-in',
    name: '到店租还',
    scene: '门店',
    requirement: '店员录入资料并绑定信用卡，到店取车、到店还车。',
  },
  {
    id: 'remote-store',
    name: '远程预约到店取车',
    scene: '网页/APP 预约',
    requirement: '线上选择车型和门店，到店验车取车，到店还车结算。',
  },
]

export const returnZones = [
  { id: 'rz-01', name: '北门还车区', latitude: 30.7689, longitude: 103.9843, radiusM: 220 },
  { id: 'rz-02', name: '图书馆还车区', latitude: 30.7648, longitude: 103.9848, radiusM: 240 },
  { id: 'rz-03', name: '南区生活广场还车区', latitude: 30.7599, longitude: 103.9817, radiusM: 260 },
]

export const scooters = [
  {
    id: 'SC101',
    qr: 'SR-SC101',
    storeId: 'st-01',
    model: 'Swift One',
    image: '/static/scooters/swift-one.jpg',
    status: 'available',
    battery: 92,
    rangeKm: 36,
    price: 1.2,
    latitude: 30.7693,
    longitude: 103.9849,
    mileage: 184,
    helmet: true,
    lockStatus: '已上锁',
    commStatus: '在线',
    lastTelemetryAt: '19:38',
    returnZoneId: 'rz-01',
  },
  {
    id: 'SC102',
    qr: 'SR-SC102',
    storeId: 'st-01',
    model: 'Swift One',
    image: '/static/scooters/swift-one.jpg',
    status: 'available',
    battery: 76,
    rangeKm: 27,
    price: 1.2,
    latitude: 30.7682,
    longitude: 103.9829,
    mileage: 203,
    helmet: true,
    lockStatus: '已上锁',
    commStatus: '在线',
    lastTelemetryAt: '19:37',
    returnZoneId: 'rz-01',
  },
  {
    id: 'SC103',
    qr: 'SR-SC103',
    storeId: 'st-02',
    model: 'Swift Plus',
    image: '/static/scooters/swift-plus.jpg',
    status: 'reserved',
    battery: 64,
    rangeKm: 22,
    price: 1.5,
    latitude: 30.7642,
    longitude: 103.9855,
    mileage: 121,
    helmet: false,
    lockStatus: '预订锁定',
    commStatus: '在线',
    lastTelemetryAt: '19:36',
    returnZoneId: 'rz-02',
  },
  {
    id: 'SC104',
    qr: 'SR-SC104',
    storeId: 'st-02',
    model: 'Swift Plus',
    image: '/static/scooters/swift-plus.jpg',
    status: 'available',
    battery: 88,
    rangeKm: 32,
    price: 1.5,
    latitude: 30.7656,
    longitude: 103.9837,
    mileage: 95,
    helmet: true,
    lockStatus: '已上锁',
    commStatus: '在线',
    lastTelemetryAt: '19:39',
    returnZoneId: 'rz-02',
  },
  {
    id: 'SC105',
    qr: 'SR-SC105',
    storeId: 'st-03',
    model: 'Swift City',
    image: '/static/scooters/swift-city.jpg',
    status: 'charging',
    battery: 39,
    rangeKm: 13,
    price: 1.0,
    latitude: 30.7725,
    longitude: 103.9892,
    mileage: 266,
    helmet: true,
    lockStatus: '充电锁定',
    commStatus: '在线',
    lastTelemetryAt: '19:35',
    returnZoneId: 'rz-03',
  },
  {
    id: 'SC106',
    qr: 'SR-SC106',
    storeId: 'st-04',
    model: 'Swift City',
    image: '/static/scooters/swift-city.jpg',
    status: 'available',
    battery: 81,
    rangeKm: 29,
    price: 1.0,
    latitude: 30.7604,
    longitude: 103.9808,
    mileage: 171,
    helmet: true,
    lockStatus: '已上锁',
    commStatus: '在线',
    lastTelemetryAt: '19:34',
    returnZoneId: 'rz-03',
  },
]

const BOOKINGS_KEY = 'swiftride_bookings'
const PROFILE_KEY = 'swiftride_profile'
const USERS_KEY = 'swiftride_users'
const SESSION_KEY = 'swiftride_session'
const ADMIN_SESSION_KEY = 'swiftride_admin_session'
const ADMIN_SCOOTERS_KEY = 'swiftride_admin_scooters'
const ADMIN_STORES_KEY = 'swiftride_admin_stores'
const ADMIN_STAFF_KEY = 'swiftride_admin_staff'
const ADMIN_PRICE_KEY = 'swiftride_admin_prices'
const ADMIN_PROMO_KEY = 'swiftride_admin_promotions'
const ISSUES_KEY = 'swiftride_issues'

export const admins = [
  {
    account: 'admin',
    password: '123456',
    name: '运营管理员',
    role: '系统管理员',
  },
  {
    account: 'store01',
    password: '123456',
    name: '北门门店员',
    role: '门店管理员',
  },
]

export function getStore(storeId) {
  return readManagedStores().find((store) => store.id === storeId) || readManagedStores()[0]
}

export function getScooter(idOrQr) {
  return readManagedScooters().find((item) => item.id === idOrQr || item.qr === idOrQr) || null
}

export function getScooterModel(modelId) {
  return scooterModels.find((item) => item.id === modelId || item.name === modelId) || scooterModels[0]
}

export function statusText(status) {
  const zh = { available: '可租', reserved: '已预约', charging: '充电中', maintenance: '维修中' }
  const en = { available: 'Available', reserved: 'Reserved', charging: 'Charging', maintenance: 'Maintenance' }
  return (isEnglish() ? en : zh)[status] || status
}

export function bookingStatusText(status) {
  const zh = { ongoing: '进行中', paid: '已完成', returned: '已还车待支付', cancelled: '已取消', overdue: '已超时' }
  const en = { ongoing: 'Ongoing', paid: 'Completed', returned: 'Returned, pending payment', cancelled: 'Cancelled', overdue: 'Overdue' }
  return (isEnglish() ? en : zh)[status] || status
}

export function getAvailableScooters() {
  return readManagedScooters().filter((item) => item.status === 'available')
}

export function readManagedScooters() {
  const saved = uni.getStorageSync(ADMIN_SCOOTERS_KEY) || []
  if (!Array.isArray(saved) || !saved.length) return scooters
  const savedById = saved.reduce((map, item) => ({ ...map, [item.id]: item }), {})
  const merged = scooters.map((item) => ({ ...item, ...(savedById[item.id] || {}) }))
  const extra = saved.filter((item) => !scooters.some((base) => base.id === item.id))
  return [...merged, ...extra]
}

export function writeManagedScooters(items) {
  uni.setStorageSync(ADMIN_SCOOTERS_KEY, items)
  return items
}

export function updateScooterAdmin(id, patch) {
  const items = readManagedScooters().map((item) => (item.id === id ? { ...item, ...patch } : item))
  writeManagedScooters(items)
  return items.find((item) => item.id === id)
}

export function readManagedStores() {
  const saved = uni.getStorageSync(ADMIN_STORES_KEY) || []
  if (!Array.isArray(saved) || !saved.length) return stores
  const savedById = saved.reduce((map, item) => ({ ...map, [item.id]: item }), {})
  const merged = stores.map((item) => ({ ...item, ...(savedById[item.id] || {}) }))
  const extra = saved.filter((item) => !stores.some((base) => base.id === item.id))
  return [...merged, ...extra]
}

export function writeManagedStores(items) {
  uni.setStorageSync(ADMIN_STORES_KEY, items)
  return items
}

export function updateStoreAdmin(id, patch) {
  const items = readManagedStores().map((item) => (item.id === id ? { ...item, ...patch } : item))
  writeManagedStores(items)
  return items.find((item) => item.id === id)
}

export function readStaff() {
  return (
    uni.getStorageSync(ADMIN_STAFF_KEY) || [
      { id: 'staff-a', name: '调度员 A', role: '车辆部署', task: '北门补车 3 辆', status: '执行中' },
      { id: 'staff-b', name: '调度员 B', role: '低电量回收', task: '南区回收低电量车 2 辆', status: '待出发' },
      { id: 'staff-c', name: '门店 C', role: '门店检查', task: '检查头盔与二维码贴纸', status: '已完成' },
    ]
  )
}

export function updateStaffAdmin(id, patch) {
  const items = readStaff().map((item) => (item.id === id ? { ...item, ...patch } : item))
  uni.setStorageSync(ADMIN_STAFF_KEY, items)
  return items.find((item) => item.id === id)
}

export function readPriceSettings() {
  return (
    uni.getStorageSync(ADMIN_PRICE_KEY) || [
      {
        model: 'Swift One',
        displayName: '轻行款',
        minutePrice: 1.2,
        storePrice: 38,
        deposit: 99,
        status: '启用',
      },
      {
        model: 'Swift Plus',
        displayName: '长续航款',
        minutePrice: 1.5,
        storePrice: 48,
        deposit: 129,
        status: '启用',
      },
      {
        model: 'Swift City',
        displayName: '城市耐用款',
        minutePrice: 1,
        storePrice: 32,
        deposit: 89,
        status: '启用',
      },
    ]
  )
}

export function updatePriceSetting(model, patch) {
  const settings = readPriceSettings().map((item) =>
    item.model === model
      ? {
          ...item,
          ...patch,
          minutePrice: Number(patch.minutePrice === undefined || patch.minutePrice === null ? item.minutePrice : patch.minutePrice),
          storePrice: Number(patch.storePrice === undefined || patch.storePrice === null ? item.storePrice : patch.storePrice),
          deposit: Number(patch.deposit === undefined || patch.deposit === null ? item.deposit : patch.deposit),
        }
      : item,
  )
  uni.setStorageSync(ADMIN_PRICE_KEY, settings)
  const matchedSetting = settings.find((item) => item.model === model)
  const price = matchedSetting ? matchedSetting.minutePrice : undefined
  if (price !== undefined) {
    writeManagedScooters(
      readManagedScooters().map((item) => (item.model === model ? { ...item, price } : item)),
    )
  }
  return settings.find((item) => item.model === model)
}

export function readPromotions() {
  return (
    uni.getStorageSync(ADMIN_PROMO_KEY) || [
      {
        id: 'promo-frequency',
        name: '高频用户九折',
        rule: '累计订单不少于 3 单的用户自动进入高频用户名单',
        discount: 10,
        status: '启用',
      },
      {
        id: 'promo-student',
        name: '校园学生优惠',
        rule: '注册信息为西南交通大学犀浦校区用户',
        discount: 8,
        status: '暂停',
      },
    ]
  )
}

export function updatePromotion(id, patch) {
  const items = readPromotions().map((item) =>
    item.id === id
      ? { ...item, ...patch, discount: Number(patch.discount === undefined || patch.discount === null ? item.discount : patch.discount) }
      : item,
  )
  uni.setStorageSync(ADMIN_PROMO_KEY, items)
  return items.find((item) => item.id === id)
}

export function readIssues() {
  return (
    uni.getStorageSync(ISSUES_KEY) || [
      {
        id: 'ISS240501',
        scooterId: 'SC103',
        type: '车辆损坏',
        message: '头盔缺失，用户预约时无法正常使用。',
        priority: '高',
        status: '待处理',
        account: 'student001',
        createdAt: '2026-05-08 16:20',
      },
      {
        id: 'ISS240502',
        scooterId: 'SC105',
        type: '低电量',
        message: '车辆电量低，需要安排回收充电。',
        priority: '中',
        status: '处理中',
        account: 'system',
        createdAt: '2026-05-09 09:10',
      },
    ]
  )
}

export function createIssue({ scooterId = '', type = '其他', message = '', priority = '中' }) {
  const user = getCurrentUser()
  const issue = {
    id: `ISS${Date.now().toString().slice(-8)}`,
    scooterId,
    type,
    message,
    priority,
    status: '待处理',
    account: user && user.account ? user.account : 'guest',
    createdAt: formatTime(new Date()),
  }
  uni.setStorageSync(ISSUES_KEY, [issue, ...readIssues()])
  return issue
}

export function updateIssue(id, patch) {
  const items = readIssues().map((item) => (item.id === id ? { ...item, ...patch } : item))
  uni.setStorageSync(ISSUES_KEY, items)
  return items.find((item) => item.id === id)
}

export function readProfile() {
  const user = getCurrentUser()
  if (user) return user
  return (
    uni.getStorageSync(PROFILE_KEY) || {
      account: '',
      name: '未登录用户',
      phone: '',
      email: '',
      campus: '西南交通大学犀浦校区',
      emergency: '',
    }
  )
}

export function saveProfile(profile) {
  const session = readSession()
  if (session.account) {
    const users = readUsers()
    const currentAccount = session.account
    const nextAccount = String(profile.account || '').trim()
    const nextPhone = String(profile.phone || '').trim()
    const nextEmail = String(profile.email || '').trim()

    if (!nextAccount || nextAccount.length < 4) throw new Error('账号至少 4 位')
    if (nextAccount !== currentAccount && users.some((user) => user.account === nextAccount)) {
      throw new Error('这个账号已经被使用')
    }
    if (nextPhone && users.some((user) => user.account !== currentAccount && user.phone === nextPhone)) {
      throw new Error('这个手机号已经被使用')
    }
    if (nextEmail && users.some((user) => user.account !== currentAccount && user.email === nextEmail)) {
      throw new Error('这个邮箱已经被使用')
    }

    const updated = users.map((user) =>
      user.account === currentAccount
        ? { ...user, ...profile, account: nextAccount, phone: nextPhone, email: nextEmail }
        : user,
    )
    writeUsers(updated)
    uni.setStorageSync(SESSION_KEY, { ...session, account: nextAccount })
    return updated.find((user) => user.account === nextAccount)
  }
  uni.setStorageSync(PROFILE_KEY, profile)
  return profile
}

export function seedUsers() {
  if (readUsers().length) return
  writeUsers([
    {
      account: 'student001',
      password: '123456',
      name: '交大同学',
      phone: '13800000000',
      email: 'student@swjtu.edu.cn',
      country: '中国',
      realName: '张同学',
      realNameVerified: true,
      idNumber: '5101********1234',
      paymentMethod: '中国银行卡',
      bankName: '中国银行',
      bankCardLast4: '6226',
      cardLast4: '',
      campus: '西南交通大学犀浦校区',
      emergency: '13900000001',
      createdAt: '2026-05-10',
    },
  ])
}

export function readUsers() {
  return uni.getStorageSync(USERS_KEY) || []
}

export function writeUsers(users) {
  uni.setStorageSync(USERS_KEY, users)
  return users
}

export function readSession() {
  return uni.getStorageSync(SESSION_KEY) || {}
}

export function getCurrentUser() {
  seedUsers()
  const session = readSession()
  if (!session.account) return null
  return readUsers().find((user) => user.account === session.account) || null
}

export function loginUser({ account, password }) {
  seedUsers()
  const keyword = String(account || '').trim()
  const user = readUsers().find(
    (item) => item.account === keyword || item.phone === keyword || item.email === keyword,
  )
  if (!user || user.password !== password) {
    throw new Error('账号或密码不正确')
  }
  uni.setStorageSync(SESSION_KEY, { account: user.account, loginAt: formatTime(new Date()) })
  return user
}

export function registerUser({
  account,
  password,
  name,
  phone,
  email,
  country = '中国',
  realName = '',
  idNumber = '',
  cardLast4 = '',
  bankName = '',
  bankCardLast4 = '',
}) {
  seedUsers()
  const users = readUsers()
  const normalized = String(account || '').trim()
  if (!normalized || normalized.length < 4) throw new Error('账号至少 4 位')
  if (!password || password.length < 6) throw new Error('密码至少 6 位')
  if (users.some((user) => user.account === normalized)) throw new Error('这个账号已经被注册')
  if (phone && users.some((user) => user.phone === phone)) throw new Error('这个手机号已经被使用')
  if (email && users.some((user) => user.email === email)) throw new Error('这个邮箱已经被使用')

  const user = {
    account: normalized,
    password,
    name: name || normalized,
    phone: phone || '',
    email: email || '',
    realName,
    realNameVerified: country === '中国' && Boolean(realName && idNumber),
    idNumber,
    country,
    paymentMethod: country === '英国' && cardLast4 ? '信用卡' : bankCardLast4 ? '中国银行卡' : '未绑定',
    bankName,
    bankCardLast4,
    cardLast4,
    campus: '西南交通大学犀浦校区',
    emergency: '',
    createdAt: formatTime(new Date()),
  }
  writeUsers([user, ...users])
  uni.setStorageSync(SESSION_KEY, { account: user.account, loginAt: formatTime(new Date()) })
  return user
}

export function logoutUser() {
  uni.removeStorageSync(SESSION_KEY)
}

export function syncSessionUser(user) {
  const account = user && user.account ? user.account : ''
  if (!account) return null
  const users = readUsers()
  const localUser = {
    account,
    password: '',
    name: user.name || account,
    phone: user.phone || '',
    email: user.email || '',
    country: user.country || '中国',
    realNameVerified: Boolean(user.realNameVerified),
    idNumber: user.identityNumber || '',
    bankName: user.bankName || '',
    bankCardLast4: user.bankCardLast4 || '',
    cardLast4: user.cardLast4 || '',
    campus: user.campus || '西南交通大学犀浦校区',
  }
  const nextUsers = users.some((item) => item.account === account)
    ? users.map((item) => (item.account === account ? { ...item, ...localUser, password: item.password || '' } : item))
    : [localUser, ...users]
  writeUsers(nextUsers)
  uni.setStorageSync(SESSION_KEY, { account })
  return localUser
}

export function recoverAccount({ phone, email }) {
  seedUsers()
  const user = readUsers().find((item) => {
    const phoneOk = phone && item.phone === phone
    const emailOk = email && item.email === email
    return phoneOk || emailOk
  })
  if (!user) throw new Error('没有找到匹配的账号')
  return user.account
}

export function resetPassword({ account, contact, password }) {
  if (!password || password.length < 6) throw new Error('新密码至少 6 位')
  let found = false
  const users = readUsers().map((user) => {
    const matched =
      user.account === account && (user.phone === contact || user.email === contact)
    if (!matched) return user
    found = true
    return { ...user, password }
  })
  if (!found) throw new Error('账号和手机号/邮箱不匹配')
  writeUsers(users)
  return true
}

export function readBookings() {
  return uni.getStorageSync(BOOKINGS_KEY) || []
}

export function writeBookings(bookings) {
  uni.setStorageSync(BOOKINGS_KEY, bookings)
  return bookings
}

export function createBooking({
  scooterId,
  minutes,
  insurance,
  rentalMode,
  quotedTotal,
  paymentMethod = '',
  safetyAccepted = false,
  deductionAccepted = false,
}) {
  const scooter = getScooter(scooterId) || getAvailableScooters()[0]
  const store = getStore(scooter.storeId)
  const model = getScooterModel(scooter.model)
  const priceSetting = readPriceSettings().find((item) => item.model === scooter.model)
  const user = getCurrentUser()
  const duration = Number(minutes || 30)
  const unitPrice = priceSetting && priceSetting.minutePrice !== undefined && priceSetting.minutePrice !== null ? priceSetting.minutePrice : scooter.price
  const base = Number(unitPrice) * duration
  const rawTotal = quotedTotal === undefined || quotedTotal === null ? base + (insurance ? 2 : 0) : quotedTotal
  const total = Number(rawTotal.toFixed(2))
  const booking = {
    id: `ORD${Date.now().toString().slice(-8)}`,
    account: user && user.account ? user.account : 'guest',
    scooterId: scooter.id,
    scooterModel: scooter.model,
    scooterImage: scooter.image || model.image,
    rentalMode: rentalMode || 'sharing-cn',
    storeName: store.name,
    pickupStoreName: store.name,
    returnZoneId: scooter.returnZoneId,
    status: 'ongoing',
    createdAt: formatTime(new Date()),
    minutes: duration,
    insurance,
    startBattery: scooter.battery,
    endBattery: null,
    startMileage: scooter.mileage,
    endMileage: null,
    damageReport: '无',
    overdueFee: 0,
    batteryFee: 0,
    dispatchFee: 0,
    returnOutOfZone: false,
    returnChecked: false,
    paymentMethod,
    safetyAccepted,
    deductionAccepted,
    paidAt: formatTime(new Date()),
    lastAction: paymentMethod
      ? `已选择 ${paymentMethod} 并确认安全协议，随后发送解锁指令。`
      : '等待用户付款与安全协议确认。',
    unlockMessage: `通信模块已向后台发送 ${scooter.id} 解锁指令`,
    total,
  }

  writeBookings([booking, ...readBookings()])
  return booking
}

export function updateBooking(id, patch) {
  const bookings = readBookings().map((booking) =>
    booking.id === id ? { ...booking, ...patch } : booking,
  )
  writeBookings(bookings)
  return bookings.find((booking) => booking.id === id)
}

export function extendBooking(id, minutes = 15) {
  const booking = readBookings().find((item) => item.id === id)
  if (!booking) return null
  const extraFee = Number((minutes * 1.2).toFixed(2))
  return updateBooking(id, {
    minutes: booking.minutes + minutes,
    total: Number((booking.total + extraFee).toFixed(2)),
    extendedMinutes: (booking.extendedMinutes || 0) + minutes,
    lastAction: `已延期 ${minutes} 分钟，追加 ${extraFee} 元`,
  })
}

export function cancelBooking(id) {
  return updateBooking(id, {
    status: 'cancelled',
    cancelledAt: formatTime(new Date()),
    lastAction: '用户取消订单，车辆重新锁定并释放库存。',
  })
}

export function mockPayBooking(id, selectedMethod = '') {
  const booking = readBookings().find((item) => item.id === id)
  if (!booking) return null
  const user = getCurrentUser()
  const method = selectedMethod || (user && user.country === '英国'
      ? `Credit card ****${user.cardLast4 || '0000'}`
      : user && user.bankCardLast4
        ? `${user.bankName || '中国银行卡'} ****${user.bankCardLast4}`
        : '模拟钱包')
  return updateBooking(id, {
    status: 'paid',
    paidAt: formatTime(new Date()),
    paymentMethod: method,
    lastAction: `模拟支付成功，支付方式：${method}`,
  })
}

export function activeBooking(account = '') {
  const currentStatuses = ['ongoing', 'overdue', 'returned']
  return readBookings().find((booking) =>
    currentStatuses.includes(booking.status) && (!account || booking.account === account),
  ) || null
}

export function seedBookings() {
  if (readBookings().length) return
  writeBookings([
    {
      id: 'ORD240501',
      account: 'student001',
      scooterId: 'SC104',
      scooterModel: 'Swift Plus',
      scooterImage: '/static/scooters/swift-plus.jpg',
      storeName: '图书馆广场站',
      pickupStoreName: '图书馆广场站',
      rentalMode: 'remote-store',
      status: 'paid',
      createdAt: '2026-05-08 14:30',
      minutes: 45,
      insurance: true,
      startBattery: 88,
      endBattery: 74,
      startMileage: 95,
      endMileage: 101,
      damageReport: '无',
      overdueFee: 0,
      batteryFee: 1.4,
      dispatchFee: 0,
      returnOutOfZone: false,
      returnChecked: true,
      total: 69.5,
    },
  ])
}

export function distanceKm(from, to) {
  if (!from || !from.latitude || !from.longitude) return null
  const rad = Math.PI / 180
  const dLat = (to.latitude - from.latitude) * rad
  const dLng = (to.longitude - from.longitude) * rad
  const lat1 = from.latitude * rad
  const lat2 = to.latitude * rad
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return Number((6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2))
}

function formatTime(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`
}

export function canReturnAt(location, zoneId) {
  const zone = returnZones.find((item) => item.id === zoneId) || returnZones[0]
  const distance = distanceKm(location, zone)
  if (distance === null) return { ok: false, zone, distanceM: null }
  const distanceM = Math.round(distance * 1000)
  return { ok: distanceM <= zone.radiusM, zone, distanceM }
}

export function finishReturn(id, payload = {}) {
  const booking = readBookings().find((item) => item.id === id)
  if (!booking) return null
  const endBatteryValue = payload.endBattery === undefined || payload.endBattery === null ? Math.max(booking.startBattery - 12, 5) : payload.endBattery
  const endBattery = Number(endBatteryValue)
  const batteryUsed = Math.max(booking.startBattery - endBattery, 0)
  const batteryFee = Number((batteryUsed * 0.12).toFixed(2))
  const overdueFee = payload.overdue ? 20 : 0
  const dispatchFee = payload.outOfZone ? 10 : 0
  return updateBooking(id, {
    status: 'returned',
    endBattery,
    endMileage: Number(payload.endMileage === undefined || payload.endMileage === null ? booking.startMileage + 5 : payload.endMileage),
    damageReport: payload.damageReport || '无',
    batteryFee,
    overdueFee,
    dispatchFee,
    returnOutOfZone: Boolean(payload.outOfZone),
    returnChecked: true,
    lastAction: payload.outOfZone
      ? '未在指定还车区还车，已加收 10 元调度费。'
      : '已在指定还车区完成还车检查。',
    total: Number((booking.total + batteryFee + overdueFee + dispatchFee).toFixed(2)),
  })
}

export function operationsSnapshot() {
  const managedScooters = readManagedScooters()
  const lowBattery = managedScooters.filter((item) => item.battery < 45)
  const faults = managedScooters.filter((item) => !item.helmet || item.status === 'maintenance')
  return {
    telemetry: managedScooters.map((item) => ({
      id: item.id,
      battery: item.battery,
      mileage: item.mileage,
      location: `${item.latitude.toFixed(4)}, ${item.longitude.toFixed(4)}`,
      commStatus: item.commStatus,
      lastTelemetryAt: item.lastTelemetryAt,
    })),
    chargingQueue: lowBattery.map((item) => ({
      scooterId: item.id,
      battery: item.battery,
      targetStore: getStore(item.storeId).name,
      priority: item.battery < 30 ? '高' : '中',
    })),
    deployments: readStaff().map((item) => ({ staff: item.name, task: item.task, status: item.status })),
    faults: faults.map((item) => ({
      scooterId: item.id,
      issue: item.helmet ? '待检修' : '头盔缺失',
      status: '待处理',
    })),
  }
}

export function loginAdmin({ account, password }) {
  const admin = admins.find((item) => item.account === account && item.password === password)
  if (!admin) throw new Error('管理员账号或密码不正确')
  uni.setStorageSync(ADMIN_SESSION_KEY, { account: admin.account, loginAt: formatTime(new Date()) })
  return admin
}

export function getCurrentAdmin() {
  const session = uni.getStorageSync(ADMIN_SESSION_KEY) || {}
  if (!session.account) return null
  return admins.find((item) => item.account === session.account) || null
}

export function logoutAdmin() {
  uni.removeStorageSync(ADMIN_SESSION_KEY)
}

export function adminDashboard() {
  seedUsers()
  seedBookings()
  const snapshot = operationsSnapshot()
  const managedScooters = readManagedScooters()
  const managedStores = readManagedStores()
  const bookings = readBookings()
  const users = readUsers()
  const issues = readIssues()
  const paidBookings = bookings.filter((item) => ['paid', 'returned'].includes(item.status))
  const frequentUsers = users.map((user) => ({
    ...user,
    bookingCount: bookings.filter((booking) => booking.account === user.account).length,
  }))
  return {
    users,
    frequentUsers,
    bookings,
    issues,
    priceSettings: readPriceSettings(),
    promotions: readPromotions(),
    stores: managedStores,
    scooters: managedScooters,
    staff: readStaff(),
    ...snapshot,
    usage: {
      activeUsers: users.length,
      totalMinutes: bookings.reduce((sum, item) => sum + Number(item.minutes || 0), 0),
      activeOrders: bookings.filter((item) => item.status === 'ongoing').length,
      availableScooters: managedScooters.filter((item) => item.status === 'available').length,
    },
    finance: {
      revenue: bookings.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2),
      paidRevenue: paidBookings.reduce((sum, item) => sum + Number(item.total || 0), 0).toFixed(2),
      unpaid: bookings.filter((item) => item.status === 'ongoing').length,
      cancelled: bookings.filter((item) => item.status === 'cancelled').length,
      returned: bookings.filter((item) => item.status === 'returned').length,
    },
  }
}

export function adminModuleMeta(source) {
  const data = source || adminDashboard()
  return [
    { type: 'overview', title: '运营总览', desc: '系统使用情况、车辆可用率、订单概览', count: data.usage.activeOrders },
    { type: 'users', title: '用户记录', desc: '注册账号、实名/银行卡信息、高频用户', count: data.users.length },
    { type: 'bookings', title: '预订记录', desc: '当前订单、历史订单、延期取消与支付状态', count: data.bookings.length },
    { type: 'revenue', title: '收入统计', desc: '总收入、已支付收入、超时费、电费和调度费', count: data.finance.revenue },
    { type: 'pricing', title: '租赁价格配置', desc: '按车型配置分钟价、门店日租价和押金', count: data.priceSettings.length },
    { type: 'issues', title: '问题反馈管理', desc: '查看用户问题、设置优先级、处理状态', count: data.issues.length },
    { type: 'promotions', title: '折扣与促销', desc: '高频用户优惠、校园优惠、启停促销', count: data.promotions.length },
    { type: 'scooters', title: '滑板车监控', desc: '车辆位置、状态、电量和通信状态', count: data.scooters.length },
  ]
}

export const safetyClauses = [
  '用户应遵守交通法规，不得载人、逆行或在禁行区域骑行。',
  '共享扫码租车默认启用骑行保险选项，事故处理以保险条款和平台记录为准。',
  '中国用户注册需完成实名认证并绑定银行卡；英国用户注册需绑定信用卡，用于押金、超时费、损坏赔偿和电费差结算。',
  '扫码解锁前，车辆通信模块会向后台确认电子锁、GPS、电量和里程状态；异常车辆禁止解锁。',
  '还车前需在 APP 内完成还车点检查、车辆损坏确认和费用结算。',
  '如果用户不在指定还车区，系统拒绝还车，并提示前往最近可还车区域。',
  '超时未还时，系统自动提醒；超过宽限期后，平台可按订单条款从已绑定银行卡或信用卡扣费。',
  '还车时发现车辆损坏、头盔丢失或二维码破损，平台按门店验车记录和后台遥测数据判定责任。',
  '交通事故、违规骑行、酒后骑行、擅自改装车辆等情况不在平台免责范围内，用户需承担相应法律责任。',
  '平台仅为租车、定位、还车检查和安全追溯使用 GPS、里程、电量等数据，演示版数据全部为本地模拟。',
  '到店租还或远程预约到店取车场景中，门店应记录取车电量、还车电量、损坏情况和超时费用。',
  '车辆二维码解锁、GPS、电量和里程数据在本演示版中为本地模拟，实际商业系统需由车辆通信模块实时上报后台。',
]

export function getSafetyClauses() {
  if (!isEnglish()) return safetyClauses
  return [
    'Users must follow traffic rules and must not carry passengers, ride against traffic, or ride in restricted areas.',
    'Shared scooter rentals include an optional riding insurance item. Accident handling is based on insurance terms and platform records.',
    'China users complete real-name verification and bind a bank card. UK users bind a credit card for deposits, overdue fees, damage compensation, and battery fee differences.',
    'Before QR unlock, the scooter communication module confirms lock, GPS, battery, and mileage status with the backend. Abnormal scooters cannot be unlocked.',
    'Before returning, users must complete return-zone checks, damage confirmation, and fee settlement in the app.',
    'If the user is outside an approved return zone, the system prompts the user to move to an approved zone or charges a dispatch fee for out-of-zone return.',
    'For overdue rentals, the system sends reminders. After the grace period, fees may be charged to the bound bank card or credit card.',
    'Damage, missing helmets, or QR-code damage are judged using store inspection records and backend telemetry.',
    'Traffic accidents, illegal riding, drunk riding, or unauthorized scooter modification are not covered by platform exemptions.',
    'GPS, mileage, and battery data are used only for rental, return checks, and safety tracing. Demo data is locally simulated.',
    'For store rental scenarios, staff should record pickup battery, return battery, damage status, and overdue fees.',
    'QR unlock, GPS, battery, and mileage data are simulated locally in this demo. A real system requires scooter communication modules and backend reporting.',
  ]
}

const API_BASE_KEY = 'swiftride_api_base'
const ENV_API_BASE = import.meta.env.VITE_API_BASE_URL
const DEFAULT_API_BASE = ENV_API_BASE || (typeof window === 'undefined' ? 'http://127.0.0.1:8081/api' : `${window.location.origin}/api`)

export function getApiBase() {
  if (ENV_API_BASE) return ENV_API_BASE
  const saved = uni.getStorageSync(API_BASE_KEY)
  return saved || DEFAULT_API_BASE
}

export function setApiBase(url) {
  uni.setStorageSync(API_BASE_KEY, url)
}

export function request(path, options = {}) {
  const url = `${getApiBase()}${path}`
  return new Promise((resolve, reject) => {
    uni.request({
      url,
      method: options.method || 'GET',
      data: options.data || undefined,
      header: {
        'content-type': 'application/json',
        ...(options.header || {}),
      },
      timeout: options.timeout || 8000,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data)
          return
        }
        const message = res.data && res.data.message ? res.data.message : `HTTP ${res.statusCode}`
        reject(new Error(message))
      },
      fail: reject,
    })
  })
}

export function fetchRemoteStores() {
  return request('/stores')
}

export function fetchRemoteScooters() {
  return request('/scooters')
}

export function fetchRemoteBookings(account = '') {
  const query = account ? `?account=${encodeURIComponent(account)}` : ''
  return request(`/bookings${query}`)
}

export function createRemoteBooking(payload) {
  return request('/bookings', { method: 'POST', data: payload })
}

export function updateRemoteBooking(id, patch) {
  return request(`/bookings/${encodeURIComponent(id)}`, { method: 'PATCH', data: patch })
}

export function updateRemoteScooter(id, patch) {
  return request(`/scooters/${encodeURIComponent(id)}`, { method: 'PATCH', data: patch })
}

export function updateRemoteIssue(id, patch) {
  return request(`/issues/${encodeURIComponent(id)}`, { method: 'PATCH', data: patch })
}

export function createRemoteIssue(payload) {
  return request('/issues', { method: 'POST', data: payload })
}

export function fetchRemoteAdminDashboard() {
  return request('/admin/dashboard')
}

export function remoteLogin(payload) {
  return request('/auth/login', { method: 'POST', data: payload })
}

export function remoteRegister(payload) {
  return request('/auth/register', { method: 'POST', data: payload })
}

export function syncLocalData(payload) {
  return request('/sync/local', { method: 'POST', data: payload, timeout: 15000 })
}
