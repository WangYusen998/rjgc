const scooterCatalog = {
  'SC-101': {
    modelName: 'SwiftRide Urban 250',
    imageUrl: '/scooter-sc101.png',
    imageFit: 'contain',
    imagePosition: 'center bottom',
    imageScale: 0.94,
    description: 'Compact city scooter for short commuter trips and campus travel.',
    topSpeedMph: 15.5,
    rangeMiles: 18,
    payloadKg: 100,
    odometerMiles: 312,
    gpsStatus: 'Live GPS',
    qrLabel: 'Scan to unlock',
    returnZones: ['Station A', 'Station B', 'Campus Hub'],
    features: ['Front suspension', 'Dual brake system', 'App unlock'],
  },
  'SC-102': {
    modelName: 'SwiftRide Urban 250',
    imageUrl: '/scooter-sc102.png',
    imageFit: 'contain',
    imagePosition: 'center bottom',
    imageScale: 0.94,
    description: 'Compact city scooter for short commuter trips and campus travel.',
    topSpeedMph: 15.5,
    rangeMiles: 18,
    payloadKg: 100,
    odometerMiles: 284,
    gpsStatus: 'Live GPS',
    qrLabel: 'Scan to unlock',
    returnZones: ['Station B', 'Station C', 'Riverside Stop'],
    features: ['Front suspension', 'Dual brake system', 'App unlock'],
  },
  'SC-103': {
    modelName: 'SwiftRide Tour 350',
    imageUrl: '/scooter-sc103.png',
    imageFit: 'contain',
    imagePosition: 'center bottom',
    imageScale: 0.92,
    description: 'Longer-range model with stronger battery support for all-day rental.',
    topSpeedMph: 18,
    rangeMiles: 26,
    payloadKg: 110,
    odometerMiles: 498,
    gpsStatus: 'Live GPS',
    qrLabel: 'Scan to unlock',
    returnZones: ['Station C', 'Tech Park', 'Central Plaza'],
    features: ['Larger deck', 'High-capacity battery', 'Hill assist'],
  },
  'SC-104': {
    modelName: 'SwiftRide Tour 350',
    imageUrl: '/scooter-sc104.png',
    imageFit: 'contain',
    imagePosition: 'center bottom',
    imageScale: 0.92,
    description: 'Longer-range model with stronger battery support for all-day rental.',
    topSpeedMph: 18,
    rangeMiles: 26,
    payloadKg: 110,
    odometerMiles: 441,
    gpsStatus: 'Live GPS',
    qrLabel: 'Scan to unlock',
    returnZones: ['Station D', 'Library Stop', 'City Centre Dock'],
    features: ['Larger deck', 'High-capacity battery', 'Hill assist'],
  },
  'SC-105': {
    modelName: 'SwiftRide Cargo Lite',
    imageUrl: '/scooter-sc105.png',
    imageFit: 'contain',
    imagePosition: 'center center',
    imageScale: 0.82,
    description: 'Stable utility scooter with basket mount for grocery and local errands.',
    topSpeedMph: 14,
    rangeMiles: 20,
    payloadKg: 120,
    odometerMiles: 207,
    gpsStatus: 'Live GPS',
    qrLabel: 'Scan to unlock',
    returnZones: ['Station E', 'Retail Park', 'West Dock'],
    features: ['Wide tyres', 'Cargo mount', 'Low-step frame'],
  },
  'SC-106': {
    modelName: 'SwiftRide Cargo Lite',
    imageUrl: '/scooter-sc106.png',
    imageFit: 'contain',
    imagePosition: 'center bottom',
    imageScale: 0.9,
    description: 'Stable utility scooter with basket mount for grocery and local errands.',
    topSpeedMph: 14,
    rangeMiles: 20,
    payloadKg: 120,
    odometerMiles: 96,
    gpsStatus: 'Live GPS',
    qrLabel: 'Scan to unlock',
    returnZones: ['Station F', 'Market Square', 'South Dock'],
    features: ['Wide tyres', 'Cargo mount', 'Low-step frame'],
  },
}

const fallback = {
  modelName: 'SwiftRide Urban 250',
  imageUrl: '/scooter-urban-250.png',
  imageFit: 'contain',
  imagePosition: 'center bottom',
  imageScale: 0.92,
  description: 'Electric scooter prepared for short-distance rental.',
  topSpeedMph: 15.5,
  rangeMiles: 18,
  payloadKg: 100,
  odometerMiles: 150,
  gpsStatus: 'Live GPS',
  qrLabel: 'Scan to unlock',
  returnZones: ['Approved return bay only'],
  features: ['Front light', 'App unlock', 'Battery monitoring'],
}

export function enrichScooter(scooter) {
  const meta = scooterCatalog[scooter.id] || fallback
  const battery = Number(scooter.battery ?? 75)
  const batteryLabel = battery >= 80 ? 'High battery' : battery >= 45 ? 'Ready for mid-range ride' : 'Charge soon'
  const estimatedRideMiles = Math.max(4, Math.round((meta.rangeMiles * battery) / 100))
  const incomingImage = String(scooter.imageUrl || '')
  const usesPlaceholder =
    !incomingImage ||
    incomingImage.includes('scooter-placeholder') ||
    incomingImage.endsWith('.svg')

  return {
    ...meta,
    ...scooter,
    imageUrl: usesPlaceholder ? meta.imageUrl : incomingImage,
    battery,
    batteryLabel: scooter.batteryLabel || batteryLabel,
    estimatedRideMiles: scooter.estimatedRideMiles || estimatedRideMiles,
    insuranceNote:
      scooter.insuranceNote ||
      'By unlocking this scooter, riders confirm that they accept local road rules and public liability terms.',
    returnRule: scooter.returnRule || 'Return must be completed in an approved bay. Late return may trigger automatic card charging.',
  }
}
