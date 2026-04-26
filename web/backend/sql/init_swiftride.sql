DROP DATABASE IF EXISTS swiftride;
CREATE DATABASE swiftride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE swiftride;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  status ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  phone VARCHAR(40) NULL,
  market ENUM('china', 'uk') NOT NULL DEFAULT 'uk',
  verification VARCHAR(120) NULL,
  identity_number VARCHAR(120) NULL,
  card_last4 VARCHAR(4) NULL,
  billing_postcode VARCHAR(16) NULL,
  payment_method VARCHAR(80) NULL,
  last_login_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scooters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL UNIQUE,
  location VARCHAR(120) NOT NULL,
  available TINYINT(1) NOT NULL DEFAULT 1,
  image_url TEXT NULL,
  hourly_cost DECIMAL(10, 2) NOT NULL DEFAULT 4.00,
  battery INT NOT NULL DEFAULT 100,
  mileage_km DECIMAL(10, 1) NOT NULL DEFAULT 0,
  gps_lat DECIMAL(10, 6) NOT NULL DEFAULT 51.507200,
  gps_lng DECIMAL(10, 6) NOT NULL DEFAULT -0.127600,
  profile_key ENUM('city', 'cargo', 'sport') NOT NULL DEFAULT 'city',
  qr_code VARCHAR(120) NOT NULL DEFAULT 'QR unlock ready',
  communication VARCHAR(120) NOT NULL DEFAULT '4G module online',
  charge_status VARCHAR(80) NOT NULL DEFAULT 'Ready',
  return_zones JSON NULL,
  insurance_note TEXT NULL,
  ops_status ENUM('deployed', 'collection', 'charging', 'fault', 'repair', 'in-use') NOT NULL DEFAULT 'deployed',
  assigned_staff VARCHAR(120) NULL,
  image_fit VARCHAR(40) DEFAULT 'contain',
  image_position VARCHAR(80) DEFAULT 'center bottom',
  image_scale DECIMAL(4, 2) DEFAULT 1.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  scooter_id INT NOT NULL,
  hire_key ENUM('1h', '4h', '1d', '1w') NOT NULL,
  hire_label VARCHAR(40) NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  route VARCHAR(255) NULL,
  pickup_point VARCHAR(120) NULL,
  notes TEXT NULL,
  rental_mode ENUM('sharing', 'walk-in', 'remote-pickup') NOT NULL DEFAULT 'remote-pickup',
  pickup_battery INT NULL,
  return_battery INT NULL,
  energy_charge DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  overdue_fee DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  damage_status TEXT NULL,
  return_check TEXT NULL,
  insurance TEXT NULL,
  timeline JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (scooter_id) REFERENCES scooters(id)
);

CREATE TABLE payments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  booking_id INT NOT NULL,
  card_last4 VARCHAR(4) NOT NULL,
  expiry VARCHAR(8),
  cvv_mask VARCHAR(8),
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('success', 'failed') NOT NULL DEFAULT 'success',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE issues (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  message TEXT NOT NULL,
  priority ENUM('low', 'high') NOT NULL DEFAULT 'low',
  status ENUM('open', 'resolved') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

INSERT INTO scooters (
  code, location, available, image_url, hourly_cost, battery, mileage_km,
  gps_lat, gps_lng, profile_key, return_zones, ops_status, assigned_staff,
  charge_status, insurance_note
)
VALUES
  ('SC-101', 'Station A', 0, '/scooter-placeholder.svg', 4.00, 86, 1280, 51.507200, -0.127600, 'city', JSON_ARRAY('Station A', 'Campus Gate'), 'in-use', 'Liam Chen', 'Ready', 'Traffic insurance notice is provided; illegal riding and intentional damage remain rider responsibility.'),
  ('SC-102', 'Station B', 1, '/scooter-placeholder.svg', 4.00, 94, 860, 51.510100, -0.118700, 'city', JSON_ARRAY('Station B', 'Library Stop'), 'deployed', 'Maya Patel', 'Ready', 'Traffic insurance notice is provided; illegal riding and intentional damage remain rider responsibility.'),
  ('SC-103', 'Station C', 0, '/scooter-placeholder.svg', 5.00, 31, 2214, 51.514500, -0.101200, 'cargo', JSON_ARRAY('Station C'), 'fault', 'Owen Smith', 'Needs charging', 'Traffic insurance notice is provided; illegal riding and intentional damage remain rider responsibility.'),
  ('SC-104', 'Station D', 1, '/scooter-placeholder.svg', 4.00, 72, 1476, 51.503400, -0.092100, 'city', JSON_ARRAY('Station D', 'Riverside Park'), 'deployed', 'Ella Wang', 'Ready', 'Traffic insurance notice is provided; illegal riding and intentional damage remain rider responsibility.'),
  ('SC-105', 'Station E', 1, '/scooter-placeholder.svg', 4.00, 68, 994, 51.519200, -0.141000, 'city', JSON_ARRAY('Station E', 'Union Square'), 'deployed', 'Noah Davis', 'Monitor', 'Traffic insurance notice is provided; illegal riding and intentional damage remain rider responsibility.'),
  ('SC-106', 'Station F', 1, '/scooter-placeholder.svg', 6.00, 97, 412, 51.500700, -0.124600, 'sport', JSON_ARRAY('Station F', 'West Gate'), 'deployed', 'Ava Brown', 'Ready', 'Traffic insurance notice is provided; illegal riding and intentional damage remain rider responsibility.');

INSERT INTO users (
  name, email, password_hash, role, status, phone, market, verification,
  card_last4, billing_postcode, payment_method
)
VALUES
  ('Admin', 'admin@swiftride.com', '$2a$10$2GtP1NH1RZzxv9qAvLUc/u1bFvkfyEKZF1IMOfp9isbLtR4g49A/u', 'admin', 'active', '+44 20 7000 1000', 'uk', 'Credit card bound', '4242', 'SW1A1AA', 'Credit card'),
  ('Alice Carter', 'alice@swiftride.com', '$2a$10$Tt1B.hbi.Y1RpL0pXb1FtucfgeuRJAUSuwq.JLUgf3A5J4QIuUpdS', 'customer', 'active', '+44 20 7000 1001', 'uk', 'Credit card bound', '4242', 'SW1A1AA', 'Credit card'),
  ('Ben Foster', 'ben@swiftride.com', '$2a$10$SMWxmdHnGEwMRGwYbGlvael8s0aeOzRasnSyIK6xbSQDpsZSYN0HS', 'customer', 'active', '+44 20 7000 1002', 'uk', 'Credit card bound', '1133', 'E1 6AN', 'Credit card'),
  ('Clara Singh', 'clara@swiftride.com', '$2a$10$gruq9Tsp8p6DcoLAoV7tZufJho2xocMG.xjQuLbX.ydxibmPBlpVm', 'customer', 'suspended', '+44 20 7000 1003', 'uk', 'Credit card bound', '5599', 'EC1A1BB', 'Credit card');
-- Seeded passwords: admin/admin123, alice/alice123, ben/ben12345, clara/clara123

INSERT INTO bookings (
  code, user_id, scooter_id, hire_key, hire_label, cost, status, route,
  pickup_point, notes, rental_mode, pickup_battery, return_battery,
  energy_charge, overdue_fee, damage_status, return_check, insurance, timeline
)
VALUES
  ('BK-1001', 2, 1, '1h', '1 Hour', 4.00, 'active', 'Station A -> Campus Gate', 'Station A', 'Helmet checked at pickup.', 'sharing', 92, NULL, 0, 0, 'No visible damage at unlock', 'Return zone will be checked in APP before closing ride.', 'Traffic insurance notice accepted; user remains responsible for illegal riding and intentional damage.', JSON_ARRAY(JSON_OBJECT('step','Created','time','2026-04-10 09:00'), JSON_OBJECT('step','Paid','time','2026-04-10 09:01'), JSON_OBJECT('step','Active','time','2026-04-10 09:02'))),
  ('BK-1002', 3, 4, '1d', '1 Day', 25.00, 'completed', 'Station D -> Riverside Park', 'Station D', 'Completed without issues.', 'walk-in', 86, 61, 7.00, 0, 'Store clerk inspected frame, brakes and helmet; no damage recorded.', 'Returned at Station D store counter.', 'Store rental agreement signed with traffic insurance and liability disclaimer.', JSON_ARRAY(JSON_OBJECT('step','Created','time','2026-04-08 13:00'), JSON_OBJECT('step','Paid','time','2026-04-08 13:01'), JSON_OBJECT('step','Active','time','2026-04-08 13:02'), JSON_OBJECT('step','Completed','time','2026-04-08 18:20')));

INSERT INTO payments (booking_id, card_last4, expiry, cvv_mask, amount, status)
VALUES
  (1, '4242', '12/30', '***', 4.00, 'success'),
  (2, '1133', '12/30', '***', 25.00, 'success');

INSERT INTO issues (code, user_id, message, priority, status)
VALUES
  ('IS-1', 2, '[brake] [SC-101] Brake issue near Station B', 'high', 'open'),
  ('IS-2', 3, '[seat] [SC-104] Seat is loose', 'low', 'open');
