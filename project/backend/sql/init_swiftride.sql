DROP DATABASE IF EXISTS swiftride;
CREATE DATABASE swiftride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE swiftride;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  account VARCHAR(80) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(40) DEFAULT '',
  email VARCHAR(120) DEFAULT '',
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  country VARCHAR(20) NOT NULL DEFAULT '中国',
  real_name_verified TINYINT(1) NOT NULL DEFAULT 0,
  identity_number VARCHAR(80) DEFAULT '',
  bank_name VARCHAR(80) DEFAULT '',
  bank_card_last4 VARCHAR(4) DEFAULT '',
  card_last4 VARCHAR(4) DEFAULT '',
  campus VARCHAR(120) DEFAULT '西南交通大学犀浦校区',
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE stores (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  address VARCHAR(160) NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  open_hours VARCHAR(40) NOT NULL,
  available INT NOT NULL DEFAULT 0,
  rating DECIMAL(3, 1) NOT NULL DEFAULT 4.8
);

CREATE TABLE return_zones (
  id VARCHAR(20) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  radius_m INT NOT NULL DEFAULT 240
);

CREATE TABLE scooters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL UNIQUE,
  qr_code VARCHAR(40) NOT NULL UNIQUE,
  store_id VARCHAR(20) NOT NULL,
  model ENUM('Swift One', 'Swift Plus', 'Swift City') NOT NULL,
  image_url VARCHAR(160) NOT NULL,
  status ENUM('available', 'reserved', 'charging', 'maintenance') NOT NULL DEFAULT 'available',
  battery INT NOT NULL DEFAULT 100,
  range_km INT NOT NULL DEFAULT 30,
  price_per_minute DECIMAL(10, 2) NOT NULL DEFAULT 1.20,
  latitude DECIMAL(10, 6) NOT NULL,
  longitude DECIMAL(10, 6) NOT NULL,
  mileage_km DECIMAL(10, 1) NOT NULL DEFAULT 0,
  helmet TINYINT(1) NOT NULL DEFAULT 1,
  lock_status VARCHAR(40) NOT NULL DEFAULT '已上锁',
  comm_status VARCHAR(40) NOT NULL DEFAULT '在线',
  last_telemetry_at VARCHAR(20) NOT NULL DEFAULT '刚刚',
  return_zone_id VARCHAR(20) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (store_id) REFERENCES stores(id),
  FOREIGN KEY (return_zone_id) REFERENCES return_zones(id)
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  scooter_id INT NOT NULL,
  rental_mode VARCHAR(40) NOT NULL DEFAULT 'sharing-cn',
  status ENUM('ongoing', 'paid', 'returned', 'cancelled', 'overdue') NOT NULL DEFAULT 'ongoing',
  minutes INT NOT NULL DEFAULT 30,
  insurance TINYINT(1) NOT NULL DEFAULT 1,
  start_battery INT NOT NULL,
  end_battery INT NULL,
  start_mileage DECIMAL(10, 1) NOT NULL,
  end_mileage DECIMAL(10, 1) NULL,
  damage_report TEXT NULL,
  overdue_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  battery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  dispatch_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  return_out_of_zone TINYINT(1) NOT NULL DEFAULT 0,
  return_checked TINYINT(1) NOT NULL DEFAULT 0,
  payment_method VARCHAR(120) DEFAULT '',
  safety_accepted TINYINT(1) NOT NULL DEFAULT 0,
  deduction_accepted TINYINT(1) NOT NULL DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  last_action TEXT NULL,
  unlock_message TEXT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (scooter_id) REFERENCES scooters(id)
);

CREATE TABLE issues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NULL,
  scooter_id INT NULL,
  type VARCHAR(40) NOT NULL DEFAULT '其他',
  message TEXT NOT NULL,
  priority ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  status VARCHAR(40) NOT NULL DEFAULT '待处理',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (scooter_id) REFERENCES scooters(id)
);

INSERT INTO users
  (account, password_hash, name, phone, email, role, country, real_name_verified, identity_number, bank_name, bank_card_last4, card_last4, campus)
VALUES
  ('admin', '123456', '运营管理员', '13800000000', 'admin@swiftride.local', 'admin', '中国', 1, '510100********0018', '中国银行', '8888', '', '西南交通大学犀浦校区'),
  ('student001', '123456', '张同学', '13800000001', 'student001@swjtu.edu.cn', 'customer', '中国', 1, '510100********1234', '中国银行', '8888', '', '西南交通大学犀浦校区'),
  ('ukuser', '123456', 'Alex Smith', '+44 20 7000 1002', 'alex@example.co.uk', 'customer', '英国', 0, '', '', '', '4242', 'London');
-- Seeded demo passwords: all three initial accounts use 123456. Newly registered users are hashed by the API.

INSERT INTO stores (id, name, address, latitude, longitude, open_hours, available, rating)
VALUES
  ('st-01', '犀安路北门站', '西南交通大学犀浦校区北门 · 犀安路 999 号', 30.768900, 103.984300, '07:00-23:30', 7, 4.8),
  ('st-02', '图书馆广场站', '犀浦校区图书馆东侧广场', 30.764800, 103.984800, '24 小时', 6, 4.7),
  ('st-03', '交大兴业北街站', '地铁 6 号线交大兴业北街站出口附近', 30.771800, 103.990100, '06:30-22:30', 4, 4.6),
  ('st-04', '南区生活广场站', '西南交通大学犀浦校区南区生活广场', 30.759900, 103.981700, '08:00-22:00', 5, 4.9);

INSERT INTO return_zones (id, name, latitude, longitude, radius_m)
VALUES
  ('rz-01', '北门还车区', 30.768900, 103.984300, 220),
  ('rz-02', '图书馆还车区', 30.764800, 103.984800, 240),
  ('rz-03', '南区生活广场还车区', 30.759900, 103.981700, 260);

INSERT INTO scooters
  (code, qr_code, store_id, model, image_url, status, battery, range_km, price_per_minute, latitude, longitude, mileage_km, helmet, lock_status, comm_status, last_telemetry_at, return_zone_id)
VALUES
  ('SC101', 'SR-SC101', 'st-01', 'Swift One', '/static/scooters/swift-one.jpg', 'available', 92, 36, 1.20, 30.769300, 103.984900, 184, 1, '已上锁', '在线', '19:38', 'rz-01'),
  ('SC102', 'SR-SC102', 'st-01', 'Swift One', '/static/scooters/swift-one.jpg', 'available', 76, 27, 1.20, 30.768200, 103.982900, 203, 1, '已上锁', '在线', '19:37', 'rz-01'),
  ('SC103', 'SR-SC103', 'st-02', 'Swift Plus', '/static/scooters/swift-plus.jpg', 'reserved', 64, 22, 1.50, 30.764200, 103.985500, 121, 0, '预订锁定', '在线', '19:36', 'rz-02'),
  ('SC104', 'SR-SC104', 'st-02', 'Swift Plus', '/static/scooters/swift-plus.jpg', 'available', 88, 32, 1.50, 30.765600, 103.983700, 95, 1, '已上锁', '在线', '19:39', 'rz-02'),
  ('SC105', 'SR-SC105', 'st-03', 'Swift City', '/static/scooters/swift-city.jpg', 'charging', 39, 13, 1.00, 30.772500, 103.989200, 266, 1, '充电锁定', '在线', '19:35', 'rz-03'),
  ('SC106', 'SR-SC106', 'st-04', 'Swift City', '/static/scooters/swift-city.jpg', 'available', 81, 29, 1.00, 30.760400, 103.980800, 171, 1, '已上锁', '在线', '19:34', 'rz-03');

INSERT INTO bookings
  (code, user_id, scooter_id, rental_mode, status, minutes, insurance, start_battery, end_battery, start_mileage, end_mileage, damage_report, battery_fee, total, payment_method, safety_accepted, deduction_accepted, return_checked, last_action, unlock_message)
VALUES
  ('ORD240501', 2, 4, 'remote-store', 'paid', 45, 1, 88, 74, 95, 101, '无', 1.40, 69.50, '中国银行 ****8888', 1, 1, 1, '门店验车完成，电量差额已计费。', '通信模块已向后台发送 SC104 解锁指令');

INSERT INTO issues (code, user_id, scooter_id, type, message, priority, status)
VALUES
  ('ISS240501', 2, 3, '车辆损坏', '头盔缺失，用户预约时无法正常使用。', 'high', '待处理'),
  ('ISS240502', 2, 5, '低电量', '车辆电量低，需要安排回收充电。', 'medium', '处理中');
