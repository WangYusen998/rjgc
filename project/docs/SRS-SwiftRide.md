# Software Requirements Specification (SRS)

## SwiftRide — Campus Shared Electric Scooter System

---

**Document Version:** 1.0

**Date:** 2026-05-18

**Author:** SwiftRide Development Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [General Description](#2-general-description)
3. [Functional Requirements](#3-functional-requirements)
4. [Non-Functional Requirements](#4-non-functional-requirements)
5. [Data Requirements](#5-data-requirements)
6. [External Interface Requirements](#6-external-interface-requirements)
7. [Appendices](#7-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) defines the functional and non-functional requirements for the **SwiftRide Campus Shared Electric Scooter System**. This document is intended for:

- **Development Team** — to guide implementation and ensure all requirements are met
- **Test Team** — as a basis for test planning and test case design
- **Project Stakeholders** — to review and approve the proposed system capabilities
- **Course Instructors** — for evaluation of software engineering practices

### 1.2 Project Background

SwiftRide is a campus shared electric scooter platform designed for **Southwest Jiaotong University, Xipu Campus**. The system enables students and staff to locate, unlock, ride, and return electric scooters across campus via a mobile application (H5/WeChat Mini Program), while administrators manage scooters, bookings, users, revenue, and issues through a web-based operations dashboard.

The project is developed as part of a software engineering coursework, demonstrating full-stack development, RESTful API design, database management, and multi-platform client delivery.

### 1.3 Definitions and Acronyms

| Term / Acronym | Definition |
|----------------|------------|
| **SRS** | Software Requirements Specification |
| **API** | Application Programming Interface |
| **JWT** | JSON Web Token — stateless authentication mechanism |
| **H5** | HTML5 web application, accessible via mobile browser |
| **Mini Program** | WeChat Mini Program (微信小程序) |
| **CRUD** | Create, Read, Update, Delete |
| **Scooter** | Electric scooter available for rental |
| **Booking / Order** | A rental transaction record |
| **Store / Station** | A physical pickup/return location on campus |
| **Return Zone** | A geo-fenced area where scooters must be returned |
| **PWA** | Progressive Web Application |
| **uni-app** | Cross-platform framework for H5 and Mini Program builds |
| **MySQL** | Relational database management system |
| **Express** | Node.js web application framework |

### 1.4 References

- IEEE Std 830-1998 — IEEE Recommended Practice for Software Requirements Specifications
- GB/T 8567-2006 — Specification for Computer Software Documentation
- SwiftRide Project Documentation (docs/app-web-split-plan.md)
- uni-app Official Documentation (https://uniapp.dcloud.net.cn/)
- Element Plus Documentation (https://element-plus.org/)
- Express.js Documentation (https://expressjs.com/)

---

## 2. General Description

### 2.1 Product Overview

SwiftRide is a full-stack scooter-sharing platform consisting of three major subsystems:

1. **Customer Application** — A uni-app based frontend that builds to both H5 PWA and WeChat Mini Program. Customers can browse available scooters on a map, scan QR codes to unlock, manage active bookings, make simulated payments, and submit issue reports.

2. **Management Web Console** — A Vue 3 + Element Plus single-page application for operations staff. It provides scooter fleet monitoring, booking management, user management, revenue analytics, store oversight, charging queue management, fault tracking, and issue resolution.

3. **Backend API Server** — A Node.js Express server with MySQL database providing RESTful APIs for authentication, scooter management, booking lifecycle, store data, issue tracking, admin dashboard aggregation, and local data synchronization.

### 2.2 Target Users

| Role | Description |
|------|-------------|
| **Customer (Student/Staff)** | End users who rent scooters. They register with real-name verification (China) or credit card binding (UK), locate scooters, scan to unlock, manage rides, and submit issues. |
| **Operations Manager / Admin** | Staff who monitor the fleet, manage scooters and bookings, review revenue, process issues, schedule charging, and handle faults. |
| **Store Staff** | On-site staff who manage walk-in rentals, inspect returned scooters, and verify damage reports. |

### 2.3 Operating Environment

| Component | Environment |
|-----------|-------------|
| **Backend Server** | Node.js 20+, Express 4.x, runs on Linux/Windows/macOS, default port 8081 |
| **Database** | MySQL 8.x / MariaDB, port 3306, character set utf8mb4 |
| **Customer H5** | Modern browsers (Chrome, Safari, Edge), served via standard web server |
| **Customer Mini Program** | WeChat Mini Program runtime (WeChat 8.0+) |
| **Management Web** | Modern desktop browsers (Chrome 120+, Edge 120+, Firefox 121+) |

### 2.4 Constraints and Assumptions

- The system is a **coursework demonstration**; payment processing is simulated, not real.
- QR code scanning, GPS location, battery telemetry, and scooter communication status are **simulated locally** in the demo version.
- The backend expects MySQL to be pre-installed and configured with the provided SQL initialization script.
- The H5 customer app requires an Amap (高德地图) API key for full map functionality; otherwise it falls back to a built-in campus schematic.
- China-market users require real-name identity verification; UK-market users require credit card binding.
- All demo accounts use plaintext password comparison for compatibility with pre-seeded data; newly registered users are hashed with bcrypt.

---

## 3. Functional Requirements

### 3.1 Use Case Diagram

```
                    ┌──────────────────────────────────────────────────────┐
                    │                  SwiftRide System                    │
                    │                                                      │
    ┌──────┐        │  ┌─────────┐    ┌──────────┐    ┌──────────────┐   │
    │      │  Register   │         │    │          │    │              │   │
    │      │────────────>│         │    │          │    │              │   │
    │      │  Login      │  Auth   │    │ Scooter  │    │   Booking    │   │
    │ Cus- │────────────>│ Service │    │ Service  │    │   Service    │   │
    │ tomer│             │         │    │          │    │              │   │
    │      │  Browse     │         │    │          │    │              │   │
    │      │────────────>│         │    │          │    │              │   │
    │      │  Scooters   │         │    │          │    │              │   │
    │      │             │         │    │          │    │              │   │
    │      │  Create     │         │    │          │    │              │   │
    │      │────────────>│         │    │          │    │              │   │
    │      │  Booking    │         │    │          │    │              │   │
    │      │             │         │    │          │    │              │   │
    │      │  Submit     │  Issue  │    │  Admin   │    │              │   │
    │      │────────────>│ Service │    │ Service  │    │              │   │
    └──────┘             │         │    │          │    │              │   │
                         └─────────┘    └──────────┘    └──────────────┘   │
                                                                           │
    ┌──────┐             ┌──────────────────────────────────────────┐     │
    │      │  Manage     │                                          │     │
    │ Ad-  │────────────>│       Management Dashboard               │     │
    │ min  │             │  - Scooter CRUD & Status Management      │     │
    │      │  Monitor    │  - Booking Processing (extend/pay/cancel)│     │
    │      │────────────>│  - User Records & Deletion               │     │
    └──────┘             │  - Revenue Analytics                     │     │
                          │  - Charging Queue & Fault Management     │     │
                          │  - Issue Priority & Resolution           │     │
                          └──────────────────────────────────────────┘     │
                    └──────────────────────────────────────────────────────┘
```

### 3.2 Functional Modules and Priority

#### User Story Format

> **As a** [role], **I want to** [feature] **so that** [benefit].

#### Module 1: User Authentication

| ID | Feature | Priority | User Story |
|----|---------|----------|------------|
| AUTH-01 | User Registration | P0 | As a new customer, I want to register an account with my personal information so that I can access the scooter rental service. |
| AUTH-02 | User Login | P0 | As a registered customer, I want to log in with my credentials so that the system can identify me and manage my bookings. |
| AUTH-03 | Account Recovery | P2 | As a customer, I want to recover my account by providing my phone or email so that I can regain access if I forget my credentials. |
| AUTH-04 | Admin Login | P0 | As an administrator, I want to log in with my admin credentials so that I can access the management dashboard. |
| AUTH-05 | Token-based Session | P0 | As a user, I want my session to persist via JWT so that I do not need to re-login for every request. |

**Use Case Description — User Registration (AUTH-01):**

| Field | Description |
|-------|-------------|
| **Actor** | Unregistered User |
| **Pre-condition** | User is on the registration page |
| **Basic Flow** | 1. User enters account, password, name, phone, email. 2. For China: enters identity number and bank info. 3. For UK: enters credit card last 4 digits. 4. System validates required fields. 5. System hashes password with bcrypt. 6. System creates user record in MySQL. 7. System returns JWT token and user profile. |
| **Post-condition** | User is registered and logged in |
| **Alternative Flow** | 3a. Duplicate account → 409 Conflict. 4a. Missing required field → 400 Bad Request. |

#### Module 2: Scooter Management

| ID | Feature | Priority | User Story |
|----|---------|----------|------------|
| SCO-01 | Browse Scooter List | P0 | As a customer, I want to view all available scooters with their status, battery level, and location so that I can choose the best scooter for my trip. |
| SCO-02 | View Scooter Detail | P0 | As a customer, I want to see detailed telemetry (battery, range, mileage, helmet status) for a specific scooter before renting. |
| SCO-03 | Scan QR Code | P0 | As a customer, I want to scan a scooter's QR code using my phone camera so that I can quickly identify and start renting a specific scooter. |
| SCO-04 | Filter by Store | P1 | As a customer, I want to see scooters grouped by their pickup store so that I can find scooters near my location. |
| SCO-05 | Map View | P1 | As a customer, I want to see scooter locations on a campus map so that I can visually locate nearby vehicles. |
| SCO-06 | Admin: Add Scooter | P0 | As an admin, I want to add new scooters to the fleet with model, store assignment, and initial status. |
| SCO-07 | Admin: Update Scooter Status | P0 | As an admin, I want to change a scooter's status (available/charging/maintenance) so that the fleet state reflects reality. |
| SCO-08 | Admin: Update Battery | P1 | As an admin, I want to boost a scooter's battery level in the system after it has been charged. |

#### Module 3: Booking (Rental) Lifecycle

| ID | Feature | Priority | User Story |
|----|---------|----------|------------|
| BOK-01 | Create Booking | P0 | As a customer, I want to book a scooter by selecting a model, duration, and insurance option, and confirming safety terms, so that I can start my ride. |
| BOK-02 | View Active Booking | P0 | As a customer, I want to see my currently active (ongoing) booking on the home screen so that I can monitor my ride. |
| BOK-03 | View Booking History | P1 | As a customer, I want to see my past booking records with payment details and ride metrics. |
| BOK-04 | View Booking Detail | P1 | As a customer, I want to see full details of a booking including battery usage, mileage, and fees. |
| BOK-05 | Simulated Payment | P1 | As a customer, I want to simulate payment for a booking using a mock payment method so that the booking status transitions to "paid." |
| BOK-06 | Extend Booking | P2 | As a customer, I want to extend my active booking by 15 minutes for an additional fee. |
| BOK-07 | Cancel Booking | P1 | As a customer, I want to cancel an active booking so that the scooter is released for others. |
| BOK-08 | Return Scooter (App) | P0 | As a customer, I want to complete a return check in the app (location verification, damage report) to finish my booking. |
| BOK-09 | Admin: Extend Booking | P1 | As an admin, I want to extend a booking by 15 minutes on behalf of a customer. |
| BOK-10 | Admin: Simulated Payment | P1 | As an admin, I want to mark a booking as paid. |
| BOK-11 | Admin: Return Booking | P1 | As an admin, I want to complete a return on behalf of a customer. |
| BOK-12 | Admin: Cancel Booking | P1 | As an admin, I want to cancel a customer's booking. |
| BOK-13 | Admin: Delete Booking | P2 | As an admin, I want to delete a booking record from the database. |

**Use Case Description — Create Booking (BOK-01):**

| Field | Description |
|-------|-------------|
| **Actor** | Logged-in Customer |
| **Pre-condition** | User is authenticated; selected scooter is available |
| **Basic Flow** | 1. User selects scooter, rental duration, insurance option, rental mode. 2. User accepts safety clauses and deduction agreement. 3. User selects payment method. 4. System calculates total (price/min × minutes + insurance). 5. System creates booking record with status "ongoing". 6. System updates scooter status to "reserved". 7. System returns booking details with unlock message. |
| **Post-condition** | Booking is created with "ongoing" status; scooter is "reserved" |
| **Alternative Flow** | 1a. Scooter not available → error. 5a. User or scooter not found → error. |

#### Module 4: Store & Return Zone

| ID | Feature | Priority | User Story |
|----|---------|----------|------------|
| STO-01 | View Store List | P0 | As a customer, I want to see all pickup stores with their addresses, available scooter counts, and ratings. |
| STO-02 | View Store Detail | P1 | As a customer, I want to see a store's location on a map and navigate to it. |
| STO-03 | Check Return Zone | P1 | As a customer, I want to verify whether my current location is within an approved return zone before completing the return. |

#### Module 5: Issue Reporting

| ID | Feature | Priority | User Story |
|----|---------|----------|------------|
| ISS-01 | Submit Issue | P1 | As a customer, I want to report a problem (damaged scooter, low battery, missing helmet) so that operations staff can address it. |
| ISS-02 | View Issues (Admin) | P1 | As an admin, I want to see all reported issues with their priority and status. |
| ISS-03 | Update Issue Priority | P1 | As an admin, I want to adjust an issue's priority level. |
| ISS-04 | Update Issue Status | P1 | As an admin, I want to change an issue's status (待处理 / 处理中 / 已解决). |

#### Module 6: Admin Dashboard & Operations

| ID | Feature | Priority | User Story |
|----|---------|----------|------------|
| ADM-01 | Operations Overview | P0 | As an admin, I want to see a dashboard with key metrics (registered users, available scooters, revenue, open issues) at a glance. |
| ADM-02 | User Records | P1 | As an admin, I want to view all registered customers with their verification status and booking history. |
| ADM-03 | Delete User | P2 | As an admin, I want to delete a customer account and their associated bookings. |
| ADM-04 | Revenue Statistics | P1 | As an admin, I want to see total revenue, paid revenue, unpaid orders, and fee breakdowns. |
| ADM-05 | Charging Queue | P1 | As an admin, I want to see which scooters need charging and mark them as charged. |
| ADM-06 | Fault Management | P1 | As an admin, I want to see scooters with faults (missing helmets, maintenance) and mark them as repaired. |
| ADM-07 | Store Inventory | P1 | As an admin, I want to see scooter inventory levels at each store. |
| ADM-08 | Price Settings | P2 | As an admin, I want to view pricing configurations for each scooter model. |
| ADM-09 | Promotions Management | P2 | As an admin, I want to view and manage discount promotions. |
| ADM-10 | Staff Task Tracking | P2 | As an admin, I want to see staff deployment tasks and their status. |

#### Module 7: Data Synchronization

| ID | Feature | Priority | User Story |
|----|---------|----------|------------|
| SYN-01 | Sync Local Data to Server | P1 | As a system, I need to synchronize locally stored data (users, scooters, bookings, issues) to the MySQL database so that the management web reflects the latest state. |

### 3.3 Feature Priority Summary

| Priority | Definition | Count |
|----------|------------|-------|
| **P0** | Core — system cannot function without these | 13 |
| **P1** | Important — significant degradation if missing | 20 |
| **P2** | Enhancement — nice to have | 8 |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement |
|----|-------------|
| PERF-01 | API endpoints shall respond within 500ms under normal load for simple queries. |
| PERF-02 | The admin dashboard shall load and render all metrics within 3 seconds of the refresh action. |
| PERF-03 | The customer app home page shall display scooter availability within 2 seconds of launch. |
| PERF-04 | The system shall support up to 50 concurrent users (adequate for a campus demo). |

### 4.2 Security

| ID | Requirement |
|----|-------------|
| SEC-01 | All API endpoints (except login, register, and health check) shall require a valid JWT token. |
| SEC-02 | Admin-only endpoints shall additionally verify the user role is "admin." |
| SEC-03 | User passwords shall be hashed using bcrypt with a salt factor of 10 before storage. |
| SEC-04 | JWT tokens shall expire after 7 days. |
| SEC-05 | CORS shall be configured to accept requests only from known origins. |
| SEC-06 | The `.env` file containing database credentials and JWT secret shall never be committed to version control. |

### 4.3 Usability

| ID | Requirement |
|----|-------------|
| USA-01 | The customer app shall support both Chinese and English languages, toggled on first launch. |
| USA-02 | The customer app shall have a bottom tab bar with 5 tabs for primary navigation. |
| USA-03 | The management web shall have a persistent sidebar with all functional modules accessible in one click. |
| USA-04 | All error messages shall be displayed in the user's selected language. |
| USA-05 | Loading states shall be visually indicated during all API calls. |

### 4.4 Reliability

| ID | Requirement |
|----|-------------|
| REL-01 | The backend shall return appropriate HTTP status codes for all responses (200, 201, 400, 401, 403, 404, 409, 500). |
| REL-02 | Database operations within a booking shall be wrapped in a transaction to ensure atomicity (rollback on any failure). |
| REL-03 | The customer app shall fall back to local mock data when the backend API is unreachable. |

### 4.5 Maintainability

| ID | Requirement |
|----|-------------|
| MAI-01 | Backend route modules shall be organized by domain entity (auth, scooters, bookings, stores, issues, admin, sync). |
| MAI-02 | Database connection pooling shall be configured with a limit of 10 connections. |
| MAI-03 | The customer app data layer (api.js, mock.js) shall provide a consistent interface regardless of data source (remote or local). |

---

## 5. Data Requirements

### 5.1 Data Entities

The system manages the following core entities:

1. **User** — account information, authentication credentials, personal details, country-specific verification data
2. **Store** — pickup/return location with address, coordinates, hours, availability count, rating
3. **Return Zone** — geo-fenced area defined by center point and radius
4. **Scooter** — vehicle with unique code, model, battery level, range, location, status, lock/comm state
5. **Booking** — rental transaction linking user and scooter, with duration, pricing, payment, and return data
6. **Issue** — problem report linking user and/or scooter with type, message, priority, and resolution status

### 5.2 Entity-Relationship Overview

```
  ┌──────────┐       ┌──────────────┐       ┌──────────┐
  │   User   │1    * │   Booking    │   1  1│  Scooter │
  │          │───────<│              │>───────│          │
  │ id       │       │ id           │       │ id       │
  │ account  │       │ user_id (FK) │       │ code     │
  │ name     │       │ scooter_id   │       │ store_id │
  │ role     │       │ status       │       │ status   │
  │ country  │       │ minutes      │       │ battery  │
  └──────────┘       │ total        │       └──────────┘
        │            └──────────────┘            │
        │                                        │
        │ 1         ┌──────────────┐            │ 1
        └──────────>│    Issue     │<───────────┘
                    │              │       0..1
                    │ id           │
                    │ user_id (FK) │
                    │ scooter_id   │
                    │ type         │
                    │ priority     │
                    │ status       │
                    └──────────────┘

  ┌──────────┐       ┌──────────────┐
  │  Store   │1    * │   Scooter    │
  │          │───────<│              │
  │ id       │       │ store_id(FK) │
  │ name     │       └──────────────┘
  │ address  │              │
  └──────────┘              │ *      1 ┌──────────────┐
                            └──────────│ Return Zone  │
                                       │              │
                                       │ id           │
                                       │ name         │
                                       │ radius_m     │
                                       └──────────────┘
```

### 5.3 Data Volume Estimates

| Entity | Estimated Records (Demo) | Growth Rate |
|--------|--------------------------|-------------|
| Users | ~50 | ~10/month |
| Scooters | ~30 | ~5/semester |
| Stores | ~6 | stable |
| Return Zones | ~4 | stable |
| Bookings | ~500 | ~50/week |
| Issues | ~100 | ~10/week |

---

## 6. External Interface Requirements

### 6.1 User Interfaces

**Customer Application (H5 / Mini Program):**

| Page | Description |
|------|-------------|
| Language Selection | First-launch screen for choosing Chinese or English |
| Home | Hero banner, scooter availability stats, active booking card, scan-to-ride entry |
| Scooter List | Filterable grid of scooters by store, with status/battery/range indicators |
| Scooter Detail | Full telemetry: model, battery bar, range, mileage, helmet, comm status |
| Map | Campus map with scooter locations and return zones |
| Booking Creation | Duration selector, insurance toggle, safety clause confirmation, payment method |
| Booking Detail | Ride progress, elapsed time, fees, extend/pay/cancel/return actions |
| Booking History | List of past bookings with status badges and amounts |
| Profile | Account info, edit form, linked cards |
| Feedback Form | Issue type selector, message input, scooter association |

**Management Web Console:**

| Tab | Description |
|-----|-------------|
| Overview | Summary metrics, scooter status distribution, store inventory table |
| Scooter Management | Full table with status/helmet/comm/battery controls and quick actions |
| Booking Records | List with extend/pay/return/cancel/delete operations |
| User Records | User table with verification status and delete action |
| Revenue | Revenue summary cards + detailed booking finance table |
| Stores | Store list with coordinates and availability |
| Charging Queue | Low-battery scooters listed with priority and "finish charging" action |
| Faults | Scooters with missing helmets or maintenance status, "repair" action |
| Issues | Issue list with priority and status dropdowns for management |

### 6.2 Software Interfaces

| Interface | Protocol | Description |
|-----------|----------|-------------|
| Backend API | HTTP/HTTPS, RESTful JSON | All client-server communication |
| MySQL Database | MySQL protocol (TCP 3306) | Persistent data storage via mysql2 connection pool |
| Amap Maps API | HTTPS | Map tile rendering and geolocation services for H5 customer app |
| WeChat APIs | WeChat SDK | Scan code, get location, open location for Mini Program build |

### 6.3 API Endpoints Summary

```
POST   /api/auth/login          — Authenticate user, return JWT
POST   /api/auth/register       — Create new user account
POST   /api/auth/recover        — Check account recovery eligibility
GET    /api/health              — Database connectivity check
GET    /api/stores              — List all stores
GET    /api/scooters            — List all scooters
GET    /api/scooters/:code      — Get scooter detail
POST   /api/scooters            — Add new scooter (admin)
PATCH  /api/scooters/:code      — Update scooter status/telemetry
GET    /api/bookings            — List bookings (optional ?account= filter)
POST   /api/bookings            — Create booking
PATCH  /api/bookings/:code      — Update booking (extend/pay/return/cancel)
DELETE /api/bookings/:code      — Delete booking
GET    /api/issues              — List all issues
POST   /api/issues              — Create issue report
PATCH  /api/issues/:code        — Update issue priority/status
GET    /api/admin/dashboard     — Aggregated dashboard data
DELETE /api/admin/users/:account — Delete user and associated data
POST   /api/sync/local          — Synchronize local data to MySQL
```

### 6.4 Communication Interfaces

- The backend server listens on the configured port (default 8081) for HTTP requests.
- The management web application connects to the API server via `fetch()` with `Content-Type: application/json` headers.
- The customer H5 app connects to the API server via `uni.request()` from the uni-app framework.
- The backend connects to MySQL via TCP on port 3306 using connection pooling (10 connections max).

---

## 7. Appendices

### 7.1 Document Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-18 | SwiftRide Team | Initial release |

### 7.2 Demo Accounts

| Account | Password | Role | Country |
|---------|----------|------|---------|
| admin | 123456 | Admin | China |
| student001 | 123456 | Customer | China |
| ukuser | 123456 | Customer | UK |

### 7.3 Scooter Models

| Model | Display Name | Price/min | Store Price | Deposit |
|-------|-------------|-----------|-------------|---------|
| Swift One | Light Commuter | 1.20 CNY | 38 CNY | 99 CNY |
| Swift Plus | Extended Range | 1.50 CNY | 48 CNY | 129 CNY |
| Swift City | Urban Durable | 1.00 CNY | 32 CNY | 89 CNY |
