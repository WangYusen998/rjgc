DROP DATABASE IF EXISTS swiftride;
CREATE DATABASE swiftride CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE swiftride;

CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE scooters (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) NOT NULL UNIQUE,
  location VARCHAR(120) NOT NULL,
  available TINYINT(1) NOT NULL DEFAULT 1,
  image_url VARCHAR(255) NULL,
  hourly_cost DECIMAL(10, 2) NOT NULL DEFAULT 4.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE bookings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(30) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  scooter_id INT NOT NULL,
  hire_key ENUM('1h', '4h', '1d', '1w') NOT NULL,
  cost DECIMAL(10, 2) NOT NULL,
  status ENUM('pending', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
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

INSERT INTO scooters (code, location, available, image_url, hourly_cost)
VALUES
  ('SC-101', 'Station A', 1, '/scooter-placeholder.svg', 4.00),
  ('SC-102', 'Station B', 1, '/scooter-placeholder.svg', 4.00),
  ('SC-103', 'Station C', 0, '/scooter-placeholder.svg', 5.00),
  ('SC-104', 'Station D', 1, '/scooter-placeholder.svg', 4.00),
  ('SC-105', 'Station E', 1, '/scooter-placeholder.svg', 4.00);

INSERT INTO users (name, email, password_hash, role)
VALUES
  ('Admin', 'admin@swiftride.com', '$2a$10$tx8lW3C2UR6YQe0tS.8oM.vtDcg9DB2HGwM8KAE9V9N68cDNaDfN6', 'admin');
-- Admin default password: admin123
