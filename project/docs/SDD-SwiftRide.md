# Software Design Document (SDD)

## SwiftRide — Campus Shared Electric Scooter System

---

**Document Version:** 1.0

**Date:** 2026-05-18

**Author:** SwiftRide Development Team

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [System Architecture](#2-system-architecture)
3. [Detailed Component Design](#3-detailed-component-design)
4. [Object Model](#4-object-model)
5. [Dynamic Models](#5-dynamic-models)
6. [Database Design](#6-database-design)
7. [API Interface Design](#7-api-interface-design)
8. [User Interface Design](#8-user-interface-design)
9. [Security Design](#9-security-design)

---

## 1. Introduction

### 1.1 Purpose

This Software Design Document (SDD) describes the architectural design and detailed design of the SwiftRide Campus Shared Electric Scooter System. It covers the system architecture, component decomposition, object model (class diagrams), dynamic behavior (sequence and state diagrams), database schema, API specification, and user interface layouts.

This document merges the contents of both a High-Level Design (HLD) and Low-Level Design (LLD) document, as is appropriate for the project's scope.

### 1.2 Scope

The design covers all three subsystems:

- **Backend API Server** — Express.js application with modular route architecture
- **Customer Application** — uni-app cross-platform frontend (H5 + WeChat Mini Program)
- **Management Web Console** — Vue 3 SPA with Element Plus component library

### 1.3 References

- Software Requirements Specification (SRS-SwiftRide.md) v1.0
- IEEE Std 1016-2009 — IEEE Standard for Information Technology — Systems Design
- Express.js Guide (https://expressjs.com/en/guide/routing.html)
- Vue 3 Documentation (https://vuejs.org/guide/introduction.html)
- uni-app Documentation (https://uniapp.dcloud.net.cn/)
- Element Plus Documentation (https://element-plus.org/en-US/)

### 1.4 Definitions

| Term | Definition |
|------|------------|
| **SPA** | Single Page Application |
| **DTO** | Data Transfer Object — shape of data exchanged between layers |
| **ORM** | Object-Relational Mapping (not used; raw SQL via mysql2) |
| **Middleware** | Express request pipeline functions for cross-cutting concerns |
| **Composition API** | Vue 3's `<script setup>` pattern for component logic |

---

## 2. System Architecture

### 2.1 Architectural Style

SwiftRide adopts a **three-tier client-server architecture** with a RESTful API backend:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PRESENTATION LAYER                            │
│                                                                        │
│  ┌──────────────────────┐              ┌──────────────────────────┐   │
│  │  Customer App (H5)   │              │  Management Web (SPA)    │   │
│  │  uni-app / Vue 3     │              │  Vue 3 + Element Plus    │   │
│  │  H5 + Mini Program   │              │  Port 5176 (dev)         │   │
│  └──────────┬───────────┘              └────────────┬─────────────┘   │
│             │                                       │                  │
│             │         HTTP / JSON (REST)            │                  │
│             └────────────────┬──────────────────────┘                  │
│                              │                                         │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
┌──────────────────────────────┼─────────────────────────────────────────┐
│                     APPLICATION LAYER                                   │
│                              │                                         │
│              ┌───────────────┴────────────────┐                       │
│              │     Express.js Server           │                       │
│              │     Port 8081                   │                       │
│              │                                 │                       │
│              │  ┌───────────────────────────┐ │                       │
│              │  │  Middleware Pipeline       │ │                       │
│              │  │  cors() → json() → routes  │ │                       │
│              │  └───────────────────────────┘ │                       │
│              │                                 │                       │
│              │  Route Modules:                │                       │
│              │  /api/auth    /api/scooters    │                       │
│              │  /api/bookings  /api/stores    │                       │
│              │  /api/issues  /api/admin       │                       │
│              │  /api/sync                     │                       │
│              └───────────────┬────────────────┘                       │
│                              │                                         │
└──────────────────────────────┼─────────────────────────────────────────┘
                               │
┌──────────────────────────────┼─────────────────────────────────────────┐
│                       DATA LAYER                                        │
│                              │                                         │
│              ┌───────────────┴────────────────┐                       │
│              │     MySQL 8.x / MariaDB         │                       │
│              │     Port 3306                   │                       │
│              │     Database: swiftride          │                       │
│              │     Charset: utf8mb4            │                       │
│              │                                 │                       │
│              │  Tables:                        │                       │
│              │  users | stores | return_zones  │                       │
│              │  scooters | bookings | issues   │                       │
│              └─────────────────────────────────┘                       │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Backend Framework** | Express.js | 4.19 | Minimal, unopinionated, well-documented |
| **Database Driver** | mysql2 | 3.11 | Promise-based, prepared statement support |
| **Authentication** | jsonwebtoken + bcryptjs | 9.0 / 2.4 | JWT stateless auth + industry-standard hashing |
| **CORS** | cors | 2.8 | Cross-origin support for H5 and admin web |
| **Environment Config** | dotenv | 16.4 | 12-factor app style configuration |
| **Customer Frontend** | uni-app (Vue 3) | 3.x | Single codebase → H5 + WeChat Mini Program |
| **Admin Frontend** | Vue 3 + Element Plus | 3.5 / 2.13 | Mature component library, rapid dashboard development |
| **Build Tool (Admin)** | Vite | 7.3 | Fast HMR, modern ESM bundling |
| **Mapping (H5)** | Amap JS API | 2.0 | Chinese campus map with satellite view |
| **QR Scanning (H5)** | jsQR | - | Pure JS QR decoder, no server dependency |
| **Database** | MySQL / MariaDB | 8.x | Mature relational DB with transaction support |

### 2.3 Subsystem Decomposition

```
SwiftRide System
│
├── backend/                        # Express API Server
│   ├── src/
│   │   ├── server.js               # App entry, middleware setup, route mounting
│   │   ├── config/
│   │   │   └── db.js               # MySQL connection pool, query(), transaction()
│   │   ├── middleware/
│   │   │   └── auth.js             # signToken(), requireAuth(), requireAdmin()
│   │   └── routes/
│   │       ├── auth.js             # POST /login, /register, /recover
│   │       ├── scooters.js         # CRUD /scooters
│   │       ├── bookings.js         # CRUD /bookings (create, list, update, delete)
│   │       ├── stores.js           # GET /stores (read-only)
│   │       ├── issues.js           # CRUD /issues
│   │       ├── admin.js            # GET /dashboard, DELETE /users/:account
│   │       └── sync.js             # POST /local (batch upsert from local storage)
│   ├── sql/
│   │   └── init_swiftride.sql      # Schema + seed data
│   ├── scripts/
│   │   ├── start-db.ps1            # Launch MariaDB/MySQL locally
│   │   └── init-db.ps1             # Run init SQL
│   └── package.json
│
├── customer-miniprogram/           # uni-app Customer App
│   ├── src/
│   │   ├── App.vue                 # Root component, language init
│   │   ├── pages.json              # Page routes + tab bar config
│   │   ├── manifest.json           # App manifest (appid, permissions)
│   │   ├── main.js                 # Entry point
│   │   ├── data/
│   │   │   ├── api.js              # Remote API client (getApiBase, request, fetch*)
│   │   │   ├── mock.js             # Local data store + CRUD operations
│   │   │   ├── i18n.js             # Internationalization (zh/en)
│   │   │   ├── authGuard.js        # Login requirement checks
│   │   │   └── platform.js         # Platform abstraction (scanCode, getLocation)
│   │   ├── pages/
│   │   │   ├── home/index.vue      # Home dashboard
│   │   │   ├── scooters/index.vue  # Scooter list
│   │   │   ├── scooters/detail.vue # Scooter detail
│   │   │   ├── map/index.vue       # Campus map
│   │   │   ├── booking/index.vue   # Create booking
│   │   │   ├── bookings/index.vue  # Booking list
│   │   │   ├── bookings/detail.vue # Booking detail
│   │   │   ├── profile/index.vue   # User profile
│   │   │   ├── auth/login.vue      # Login form
│   │   │   ├── auth/register.vue   # Registration form
│   │   │   ├── auth/forgot.vue     # Password recovery
│   │   │   ├── feedback/index.vue  # Issue submission
│   │   │   ├── safety/index.vue    # Safety clauses
│   │   │   ├── operations/index.vue # Operations overview
│   │   │   ├── admin/login.vue     # Admin login
│   │   │   ├── admin/index.vue     # Admin dashboard
│   │   │   ├── admin/module.vue    # Admin module detail
│   │   │   └── language/index.vue  # Language selector
│   │   └── static/scooters/        # Scooter model images
│   └── vite.config.js
│
├── management-web/                 # Vue 3 Admin Web
│   ├── src/
│   │   ├── App.vue                 # Single-file admin dashboard (~815 lines)
│   │   ├── main.js                 # App bootstrap (Pinia + Element Plus)
│   │   └── styles.css              # Global styles
│   ├── public/                     # Static assets (images)
│   └── vite.config.js
│
├── swiftride-admin-web/            # Built admin web (deployment artifact)
├── swiftride-web-update/           # Built H5 customer app (deployment artifact)
└── docs/                           # Project documentation
```

### 2.4 Deployment Architecture

```
                    ┌──────────────┐
                    │   Nginx /    │
                    │   Web Server │
                    │   Port 80    │
                    └──────┬───────┘
                           │
           ┌───────────────┼────────────────┐
           │               │                │
     ┌─────┴─────┐  ┌──────┴──────┐  ┌─────┴──────────┐
     │  /         │  │  /admin/    │  │  /api (proxy)  │
     │  H5 App    │  │  Admin SPA  │  │  → localhost:  │
     │  (static)  │  │  (static)   │  │    8081        │
     └───────────┘  └─────────────┘  └────────────────┘
```

---

## 3. Detailed Component Design

### 3.1 Backend: server.js — Application Entry Point

**File:** `backend/src/server.js`

**Responsibilities:**
- Load environment variables via dotenv
- Configure Express middleware: CORS (all origins, credentials), JSON body parser
- Mount route modules under `/api/` prefix
- Provide root `/api` endpoint as API index
- Provide `/api/health` endpoint for database connectivity check
- Register global error handler middleware
- Start HTTP listener

**Middleware Pipeline:**
```
Request → cors() → express.json() → Route Handler (or 404) → Error Handler → Response
```

### 3.2 Backend: db.js — Database Access Layer

**File:** `backend/src/config/db.js`

**Design Decisions:**
- Connection pooling (mysql2/promise) rather than single connections for efficiency
- `namedPlaceholders: true` for safer query construction
- `charset: utf8mb4` for full Unicode support including emoji and Chinese characters
- `waitForConnections: true` — requests queue when pool is exhausted
- `connectionLimit: 10` — appropriate for campus-scale usage

**Exported Functions:**

| Function | Signature | Description |
|----------|-----------|-------------|
| `query(sql, params)` | `(string, array) → Promise<rows>` | Execute SELECT/INSERT/UPDATE/DELETE, returns rows |
| `transaction(work)` | `(async fn) → Promise<result>` | Acquire connection, BEGIN, execute work, COMMIT or ROLLBACK, release |

### 3.3 Backend: auth.js — Authentication Middleware

**File:** `backend/src/middleware/auth.js`

**Functions:**

| Function | Responsibility |
|----------|---------------|
| `signToken(user)` | Creates JWT with payload `{ id, account, role }`, expires in 7 days |
| `requireAuth(req, res, next)` | Extracts Bearer token from Authorization header, verifies JWT, attaches `req.user`, returns 401 on failure |
| `requireAdmin(req, res, next)` | Chains `requireAuth` then checks `req.user.role === 'admin'`, returns 403 on failure |

**Token Flow:**
```
Client                    Server
  │                          │
  │  POST /api/auth/login    │
  │  {account, password}     │
  │─────────────────────────>│
  │                          │ bcrypt.compare(password, hash)
  │                          │ jwt.sign({id, account, role})
  │  {token, user}           │<─────────────────────────
  │                          │
  │  GET /api/scooters       │
  │  Authorization: Bearer   │ jwt.verify(token)
  │  eyJhbGciOi...           │
  │─────────────────────────>│
  │                          │ req.user = {id, account, role}
  │  [scooter list]          │
  │<─────────────────────────│
```

### 3.4 Backend: Route Modules — Design Pattern

All route modules follow a consistent pattern:

```
1. Import dependencies (express, db helpers, middleware)
2. Create Router instance
3. Define row-to-DTO mapping function (camelCase for JSON, snake_case for DB)
4. Implement handlers matching HTTP verbs:
   - GET /      → list all records with optional filters
   - GET /:id   → get single record by identifier
   - POST /     → create new record with validation
   - PATCH /:id → partial update with COALESCE pattern
   - DELETE /:id → remove record
5. Export default router
```

**Route Module Summary:**

| Module | File | Key Design Notes |
|--------|------|-----------------|
| **auth** | auth.js | Plaintext comparison fallback for demo seeds; new users are bcrypt-hashed. Login accepts account OR email OR phone. |
| **scooters** | scooters.js | Auto-generates sequential code (SC107, SC108...). Links to store for coordinates. Updates store.available count on status change. |
| **bookings** | bookings.js | Uses SQL transaction for atomic create (booking insert + scooter status update). Rich JOIN query for list with user/store/scooter data. COALESCE pattern for partial updates. |
| **stores** | stores.js | Read-only. Maps `open_hours` column to `open` in JSON response. |
| **issues** | issues.js | Auto-generates code like ISS{timestamp}. Associates user and scooter via foreign keys. |
| **admin** | admin.js | Aggregates data from all tables into a single dashboard response. Computes derived fields: revenue sum, charging queue, fault list. |
| **sync** | sync.js | Batch upsert for local→remote sync. Uses INSERT...ON DUPLICATE KEY UPDATE for idempotent sync. Ensures referenced users and scooters exist before inserting bookings/issues. |

### 3.5 Customer App: Data Layer Architecture

```
┌──────────────────────────────────────────────────┐
│                  Page Components                  │
│   (home, scooters, booking, profile, etc.)       │
└──────────┬──────────────────┬────────────────────┘
           │                  │
    ┌──────┴──────┐    ┌──────┴──────┐
    │   api.js    │    │  mock.js    │
    │  (remote)   │    │  (local)    │
    │             │    │             │
    │ fetchRemote │    │  localStorage│
    │ Stores()    │    │  read/write  │
    │ fetchRemote │    │  CRUD ops    │
    │ Scooters()  │    │              │
    │ createRemote│    │  seed data   │
    │ Booking()   │    │              │
    └──────┬──────┘    └──────┬──────┘
           │                  │
           └────────┬─────────┘
                    │
              ┌─────┴──────┐
              │  Platform   │
              │  Abstraction│
              │  (scanCode, │
              │  getLocation│
              │  H5 vs Mini │
              │  Program)   │
              └─────────────┘
```

**Key Design Decisions:**

1. **Dual Data Source**: The customer app can operate with either remote API data or local mock data. The mock.js module mirrors the API interface (e.g., `createBooking` has the same signature as `createRemoteBooking`), enabling seamless switching.

2. **Local Storage as Database**: In the absence of a backend, all app state (users, bookings, scooters, issues, settings) is persisted in `uni.getStorageSync`/`uni.setStorageSync`. This enables full offline functionality for the demo.

3. **Platform Abstraction (platform.js)**: `scanCode()` and `getLocation()` have different implementations for H5 (web APIs + jsQR) vs Mini Program (WeChat native APIs via `uni.*`), controlled by `#ifdef H5` preprocessor directives.

### 3.6 Management Web: Single-Component Architecture

The management web is intentionally designed as a **single Vue component** (`App.vue`) containing all dashboard functionality. This design was chosen because:

- The admin interface has ~9 tabs but each follows the same pattern (table + actions)
- A single file avoids premature abstraction for a course project
- All state lives in one `dashboard` ref, populated by a single `loadAll()` call to `/api/admin/dashboard`

**Data Flow:**
```
onMounted() → loadAll()
    → GET /api/health
    → GET /api/admin/dashboard
    → dashboard.value = response
    → computed properties derive display values
    → template renders tables and metrics

User Action (e.g., mark scooter available)
    → updateScooter(row, patch)
    → PATCH /api/scooters/:code
    → ElMessage.success()
    → loadAll()  // refresh entire dashboard
```

---

## 4. Object Model

### 4.1 Domain Class Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         DOMAIN MODEL                                 │
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │      User        │         │     Scooter      │                  │
│  ├──────────────────┤         ├──────────────────┤                  │
│  │ + id: int        │         │ + id: int        │                  │
│  │ + account: string│         │ + code: string   │                  │
│  │ + passwordHash:  │         │ + qrCode: string │                  │
│  │   string         │         │ + storeId: string│                  │
│  │ + name: string   │         │ + model: enum    │                  │
│  │ + phone: string  │         │ + imageUrl: str  │                  │
│  │ + email: string  │         │ + status: enum   │                  │
│  │ + role: enum     │         │ + battery: int   │                  │
│  │ + country: string│         │ + rangeKm: int   │                  │
│  │ + realNameVerif- │         │ + pricePerMinute:│                  │
│  │   ied: bool      │         │   decimal         │                  │
│  │ + identityNumber │         │ + latitude: dec  │                  │
│  │ + bankName: str  │         │ + longitude: dec │                  │
│  │ + bankCardLast4  │         │ + mileageKm: dec │                  │
│  │ + cardLast4: str │         │ + helmet: bool   │                  │
│  │ + campus: string │         │ + lockStatus: str│                  │
│  │ + status: enum   │         │ + commStatus: str│                  │
│  └──────┬───────────┘         │ + lastTelemetry- │                  │
│         │                     │   At: string     │                  │
│         │ 1                   │ + returnZoneId:  │                  │
│         │                     │   string         │                  │
│         │                     └──────┬───────────┘                  │
│         │                            │                              │
│         │ has many                   │ has many                     │
│         │                            │                              │
│         └──────────┬─────────────────┘                              │
│                    │                                                │
│                    │ *                                              │
│          ┌─────────┴──────────┐                                    │
│          │     Booking        │                                    │
│          ├────────────────────┤                                    │
│          │ + id: int          │                                    │
│          │ + code: string     │                                    │
│          │ + userId: int (FK) │                                    │
│          │ + scooterId:int(FK)│                                    │
│          │ + rentalMode: str  │                                    │
│          │ + status: enum     │                                    │
│          │ + minutes: int     │                                    │
│          │ + insurance: bool  │                                    │
│          │ + startBattery:int │                                    │
│          │ + endBattery: int  │                                    │
│          │ + startMileage: dec│                                    │
│          │ + endMileage: dec  │                                    │
│          │ + damageReport: str│                                    │
│          │ + overdueFee: dec  │                                    │
│          │ + batteryFee: dec  │                                    │
│          │ + dispatchFee: dec │                                    │
│          │ + returnOutOfZone: │                                    │
│          │   bool             │                                    │
│          │ + returnChecked:   │                                    │
│          │   bool             │                                    │
│          │ + paymentMethod:str│                                    │
│          │ + safetyAccepted:  │                                    │
│          │   bool             │                                    │
│          │ + deductionAccepted│                                    │
│          │ + total: decimal   │                                    │
│          │ + lastAction: str  │                                    │
│          │ + unlockMessage:str│                                    │
│          └────────────────────┘                                    │
│                                                                      │
│  ┌──────────────────┐         ┌──────────────────┐                  │
│  │     Store        │         │   ReturnZone     │                  │
│  ├──────────────────┤         ├──────────────────┤                  │
│  │ + id: string     │         │ + id: string     │                  │
│  │ + name: string   │         │ + name: string   │                  │
│  │ + address: string│         │ + latitude: dec  │                  │
│  │ + latitude: dec  │         │ + longitude: dec │                  │
│  │ + longitude: dec │         │ + radiusM: int   │                  │
│  │ + openHours: str │         └──────────────────┘                  │
│  │ + available: int │                                               │
│  │ + rating: dec    │         ┌──────────────────┐                  │
│  └──────────────────┘         │     Issue        │                  │
│                               ├──────────────────┤                  │
│   1 ────────────── *          │ + id: int        │                  │
│   Store has many Scooters     │ + code: string   │                  │
│                               │ + userId: int(FK)│                  │
│   1 ────────────── *          │ + scooterId: int │                  │
│   ReturnZone has many Scooters│   (FK, nullable) │                  │
│                               │ + type: string   │                  │
│                               │ + message: string│                  │
│                               │ + priority: enum │                  │
│                               │ + status: string │                  │
│                               └──────────────────┘                  │
└─────────────────────────────────────────────────────────────────────┘
```

### 4.2 Class Relationships

| From | To | Relationship | Cardinality | Rationale |
|------|----|-------------|-------------|-----------|
| User | Booking | has many | 1 : * | Each user can have multiple booking records |
| Scooter | Booking | has many | 1 : * | Each scooter can be involved in many bookings |
| Store | Scooter | has many | 1 : * | Each store manages multiple scooters |
| ReturnZone | Scooter | has many | 1 : * | Each return zone is the designated return area for multiple scooters |
| User | Issue | has many | 1 : 0..* | Issues can be submitted by users or by the system |
| Scooter | Issue | has many | 0..1 : 0..* | Issues may reference a scooter |

### 4.3 Enumerations

**Scooter Status:**
```
available → reserved → (ongoing booking)
available → charging → available
available → maintenance → available
```

**Booking Status:**
```
ongoing → paid
ongoing → cancelled
ongoing → overdue
paid → returned
```

**User Role:** `customer` | `admin`

**User Status:** `active` | `suspended`

**Issue Priority:** `低` (Low) | `中` (Medium) | `高` (High)

**Scooter Model:** `Swift One` | `Swift Plus` | `Swift City`

**Rental Mode:** `sharing-cn` | `sharing-uk` | `walk-in` | `remote-store`

---

## 5. Dynamic Models

### 5.1 Sequence Diagram: Create Booking (Core Flow)

```
Customer        App (H5/Mini)         Backend API          MySQL
   │                 │                     │                  │
   │ Select scooter  │                     │                  │
   │ Set duration    │                     │                  │
   │ Toggle insurance│                     │                  │
   │ Accept safety   │                     │                  │
   │───────────────>│                     │                  │
   │                 │                     │                  │
   │                 │ POST /api/bookings  │                  │
   │                 │ {account, scooterId,│                 │
   │                 │  minutes, insurance,│                 │
   │                 │  rentalMode,        │                 │
   │                 │  paymentMethod,     │                 │
   │                 │  safetyAccepted,    │                 │
   │                 │  deductionAccepted} │                  │
   │                 │────────────────────>│                  │
   │                 │                     │                  │
   │                 │                     │ BEGIN TRANSACTION│
   │                 │                     │─────────────────>│
   │                 │                     │                  │
   │                 │                     │ SELECT user      │
   │                 │                     │ WHERE account=?  │
   │                 │                     │─────────────────>│
   │                 │                     │ <── user row ────│
   │                 │                     │                  │
   │                 │                     │ SELECT scooter   │
   │                 │                     │ WHERE code=?     │
   │                 │                     │─────────────────>│
   │                 │                     │ <── scooter row ─│
   │                 │                     │                  │
   │                 │                     │ INSERT INTO      │
   │                 │                     │ bookings (...)   │
   │                 │                     │─────────────────>│
   │                 │                     │                  │
   │                 │                     │ UPDATE scooters  │
   │                 │                     │ SET status=      │
   │                 │                     │ 'reserved'       │
   │                 │                     │─────────────────>│
   │                 │                     │                  │
   │                 │                     │ COMMIT           │
   │                 │                     │─────────────────>│
   │                 │                     │                  │
   │                 │  201 Created        │                  │
   │                 │  {booking details + │                  │
   │                 │   unlockMessage}    │                  │
   │                 │<────────────────────│                  │
   │                 │                     │                  │
   │ Show booking    │                     │                  │
   │ success with    │                     │                  │
   │ unlock message  │                     │                  │
   │<───────────────│                     │                  │
```

### 5.2 State Diagram: Scooter Lifecycle

```
                    ┌──────────┐
                    │          │
          ┌────────>│ AVAILABLE│<──────────┐
          │         │          │           │
          │         └─────┬────┘           │
          │               │                │
          │               │ User books     │
          │               │ (POST /bookings)│
          │               ▼                │
          │         ┌──────────┐           │
          │         │          │           │
          │         │ RESERVED │           │
          │         │          │           │
          │         └─────┬────┘           │
          │               │                │
          │               │ Booking        │
          │               │ cancelled      │
          │               ▼                │
          │         ┌──────────┐           │
          │         │ (ongoing │           │
          │         │  booking)│           │
          │         └─────┬────┘           │
          │               │                │
          │               │ Booking        │
          │               │ returned/paid  │
          │               ▼                │
          │         ┌──────────┐           │
          │         │          │           │
          │         │ AVAILABLE│───────────┘
          │         │          │
          │         └──────────┘
          │
          │  ┌───────────┐     ┌─────────────┐
          │  │           │     │             │
          └──│ CHARGING  │     │ MAINTENANCE │
             │           │     │             │
             └───────────┘     └─────────────┘
              Admin action:     Admin action:
              mark charging     mark maintenance

              After charge      After repair
              complete:         complete:
              → AVAILABLE       → AVAILABLE
```

### 5.3 State Diagram: Booking Lifecycle

```
    ┌──────────┐
    │          │      User cancels
    │ ONGOING  │──────────────────────►┌───────────┐
    │          │                       │ CANCELLED │
    └────┬─────┘                       └───────────┘
         │
         │ Time expires
         │ without return
         ▼
    ┌──────────┐
    │ OVERDUE  │
    └──────────┘
         │
         │ User/Admin pays
         ▼
    ┌──────────┐
    │  PAID    │
    └────┬─────┘
         │
         │ User completes return
         │ (damage check, battery record)
         ▼
    ┌──────────┐
    │ RETURNED │
    └──────────┘
```

### 5.4 Sequence Diagram: Data Sync (Local → Remote)

```
App launches
     │
     │ Check local storage for unsynced data
     │
     │ POST /api/sync/local
     │ { users: [...], scooters: [...],
     │   bookings: [...], issues: [...] }
     │────────────────────────────────────> Backend
     │                                      │
     │                                      │ BEGIN TRANSACTION
     │                                      │
     │                                      │ For each user:
     │                                      │   INSERT ... ON DUPLICATE
     │                                      │   KEY UPDATE
     │                                      │
     │                                      │ For each scooter:
     │                                      │   INSERT ... ON DUPLICATE
     │                                      │   KEY UPDATE
     │                                      │
     │                                      │ For each booking:
     │                                      │   ensure user exists
     │                                      │   ensure scooter exists
     │                                      │   INSERT ... ON DUPLICATE
     │                                      │   KEY UPDATE
     │                                      │
     │                                      │ For each issue:
     │                                      │   ensure user exists
     │                                      │   ensure scooter (if provided)
     │                                      │   INSERT ... ON DUPLICATE
     │                                      │   KEY UPDATE
     │                                      │
     │                                      │ COMMIT
     │                                      │
     │  { ok: true, synced: {               │
     │    users: 3, scooters: 6,           │
     │    bookings: 2, issues: 2 } }       │
     │<─────────────────────────────────────│
     │
     │ Sync complete; continue with remote data
```

---

## 6. Database Design

### 6.1 Entity-Relationship Diagram

```
                    ┌─────────────────────────────────────────────────────────────────────┐
                    │                                                                      │
 users              │    scooters                    return_zones           stores         │
 ┌─────────────┐    │   ┌──────────────┐            ┌─────────────┐       ┌────────────┐  │
  id         PK ├────┼───┤ id         PK│            │ id       PK │       │ id      PK │  │
 │account      │   │   │ code       UQ│            │ name        │       │ name        │  │
 │password_hash│   │   │ qr_code    UQ│            │ latitude    │       │ address     │  │
 │name         │   │   │ store_id  FK ├────────────┼─────────────────────┤ latitude    │  │
 │phone        │   │   │ model        │            │ longitude   │       │ longitude   │  │
 │email        │   │   │ image_url    │            │ radius_m    │       │ open_hours  │  │
 │role         │   │   │ status       │            └─────────────┘       │ available   │  │
 │country      │   │   │ battery      │                 ▲                │ rating      │  │
 │...          │   │   │ range_km     │                 │                └────────────┘  │
 └─────────────┘   │   │ price_per_min│                 │ return_zone_id FK              │
      │            │   │ latitude     │                 │                                │
      │            │   │ longitude    │                 │                                │
      │            │   │ mileage_km   │                 │                                │
      │            │   │ helmet       │                 │                                │
      │            │   │ lock_status  │                 └────────────────────────────────┘
      │            │   │ comm_status  │
      │            │   │ last_teleme- │
      │            │   │   try_at     │         ┌──────────────┐
      │            │   │ return_zone  ├─────────┤return_zones  │
      │            │   │   _id    FK  │         │              │
      │            │   └──────────────┘         └──────────────┘
      │            │
      │ 1:N        │          1:N
      │            │
      ├──────────────────────┐
      │                      │
      │  ┌───────────────┐   │    ┌──────────────┐
      │  │   bookings    │   │    │    issues    │
      │  ├───────────────┤   │    ├──────────────┤
      └──┤ user_id   FK  │   └────┤ user_id  FK  │
         │ scooter_id FK │        │ scooter_id FK│
         │ code       UQ │        │ code      UQ │
         │ rental_mode   │        │ type         │
         │ status        │        │ message      │
         │ minutes       │        │ priority     │
         │ insurance     │        │ status       │
         │ start_battery │        │ created_at   │
         │ end_battery   │        └──────────────┘
         │ start_mileage │
         │ end_mileage   │
         │ damage_report │
         │ overdue_fee   │
         │ battery_fee   │
         │ dispatch_fee  │
         │ return_out_of │
         │   _zone       │
         │ return_checked│
         │ payment_method│
         │ safety_accep- │
         │   ted         │
         │ deduction_ac- │
         │   cepted      │
         │ total         │
         │ last_action   │
         │ unlock_message│
         │ created_at    │
         └───────────────┘
```

### 6.2 Table: users

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Internal user ID |
| account | VARCHAR(80) | NOT NULL, UNIQUE | Login account name |
| password_hash | VARCHAR(255) | NOT NULL | bcrypt hash or plaintext for demo seeds |
| name | VARCHAR(100) | NOT NULL | Display name |
| phone | VARCHAR(40) | DEFAULT '' | Phone number |
| email | VARCHAR(120) | DEFAULT '' | Email address |
| role | ENUM('customer','admin') | NOT NULL, DEFAULT 'customer' | User role |
| country | VARCHAR(20) | NOT NULL, DEFAULT '中国' | Country (中国/英国) |
| real_name_verified | TINYINT(1) | NOT NULL, DEFAULT 0 | Whether real-name verified |
| identity_number | VARCHAR(80) | DEFAULT '' | National ID number |
| bank_name | VARCHAR(80) | DEFAULT '' | Bank name |
| bank_card_last4 | VARCHAR(4) | DEFAULT '' | Last 4 digits of bank card |
| card_last4 | VARCHAR(4) | DEFAULT '' | Last 4 digits of credit card (UK) |
| campus | VARCHAR(120) | DEFAULT '西南交通大学犀浦校区' | Campus name |
| status | ENUM('active','suspended') | NOT NULL, DEFAULT 'active' | Account status |
| last_login_at | TIMESTAMP | NULL | Last login time |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Registration time |

### 6.3 Table: scooters

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Internal ID |
| code | VARCHAR(20) | NOT NULL, UNIQUE | External scooter code (e.g., SC101) |
| qr_code | VARCHAR(40) | NOT NULL, UNIQUE | QR code identifier |
| store_id | VARCHAR(20) | NOT NULL, FK→stores.id | Home store |
| model | ENUM('Swift One','Swift Plus','Swift City') | NOT NULL | Scooter model |
| image_url | VARCHAR(160) | NOT NULL | Photo path |
| status | ENUM('available','reserved','charging','maintenance') | NOT NULL, DEFAULT 'available' | Current state |
| battery | INT | NOT NULL, DEFAULT 100 | Battery percentage 0-100 |
| range_km | INT | NOT NULL, DEFAULT 30 | Estimated remaining range |
| price_per_minute | DECIMAL(10,2) | NOT NULL, DEFAULT 1.20 | Rental price/minute |
| latitude | DECIMAL(10,6) | NOT NULL | GPS latitude |
| longitude | DECIMAL(10,6) | NOT NULL | GPS longitude |
| mileage_km | DECIMAL(10,1) | NOT NULL, DEFAULT 0 | Total odometer |
| helmet | TINYINT(1) | NOT NULL, DEFAULT 1 | Helmet present (0=missing) |
| lock_status | VARCHAR(40) | NOT NULL, DEFAULT '已上锁' | Lock state description |
| comm_status | VARCHAR(40) | NOT NULL, DEFAULT '在线' | Communication status |
| last_telemetry_at | VARCHAR(20) | NOT NULL, DEFAULT '刚刚' | Last telemetry timestamp |
| return_zone_id | VARCHAR(20) | NOT NULL, FK→return_zones.id | Designated return zone |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

### 6.4 Table: bookings

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Internal ID |
| code | VARCHAR(30) | NOT NULL, UNIQUE | Booking number (ORD{timestamp}) |
| user_id | INT | NOT NULL, FK→users.id | Customer |
| scooter_id | INT | NOT NULL, FK→scooters.id | Scooter |
| rental_mode | VARCHAR(40) | NOT NULL, DEFAULT 'sharing-cn' | Rental mode |
| status | ENUM('ongoing','paid','returned','cancelled','overdue') | NOT NULL, DEFAULT 'ongoing' | Booking status |
| minutes | INT | NOT NULL, DEFAULT 30 | Rental duration |
| insurance | TINYINT(1) | NOT NULL, DEFAULT 1 | Insurance selected |
| start_battery | INT | NOT NULL | Battery at rental start |
| end_battery | INT | NULL | Battery at return |
| start_mileage | DECIMAL(10,1) | NOT NULL | Odometer at start |
| end_mileage | DECIMAL(10,1) | NULL | Odometer at return |
| damage_report | TEXT | NULL | Damage description |
| overdue_fee | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Late return penalty |
| battery_fee | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Battery consumption fee |
| dispatch_fee | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Out-of-zone dispatch fee |
| return_out_of_zone | TINYINT(1) | NOT NULL, DEFAULT 0 | Returned outside designated zone |
| return_checked | TINYINT(1) | NOT NULL, DEFAULT 0 | Return inspection completed |
| payment_method | VARCHAR(120) | DEFAULT '' | Payment method description |
| safety_accepted | TINYINT(1) | NOT NULL, DEFAULT 0 | Safety terms accepted |
| deduction_accepted | TINYINT(1) | NOT NULL, DEFAULT 0 | Fee deduction terms accepted |
| total | DECIMAL(10,2) | NOT NULL, DEFAULT 0 | Total charge |
| last_action | TEXT | NULL | Last operation description |
| unlock_message | TEXT | NULL | Unlock instruction message |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Creation time |

### 6.5 Indexes

| Table | Index | Type | Purpose |
|-------|-------|------|---------|
| users | account (UNIQUE) | B-tree | Fast login lookup by account |
| scooters | code (UNIQUE) | B-tree | Fast lookup by scooter code |
| scooters | qr_code (UNIQUE) | B-tree | QR code scan resolution |
| bookings | code (UNIQUE) | B-tree | Booking lookup by order number |
| bookings | user_id (FK) | B-tree | User booking history queries |
| bookings | scooter_id (FK) | B-tree | Scooter booking history queries |
| issues | code (UNIQUE) | B-tree | Issue lookup |

---

## 7. API Interface Design

### 7.1 Design Principles

- **RESTful conventions**: Resources are nouns, HTTP verbs define operations
- **JSON exclusively**: All request and response bodies use `application/json`
- **Consistent error format**: `{ "message": "human-readable error" }`
- **CamelCase in JSON, snake_case in MySQL**: Row-to-DTO mapping functions handle conversion
- **Entity codes as external IDs**: Users see `SC101`, `ORD240501`; internal integer IDs are hidden

### 7.2 Authentication

All endpoints except `/api/auth/login`, `/api/auth/register`, `/api/auth/recover`, `/api`, and `/api/health` require:

```
Authorization: Bearer <jwt_token>
```

Admin endpoints (`/api/admin/*`) additionally require the user's role to be `admin`.

### 7.3 Detailed API Specification

#### Auth

**POST /api/auth/login**
```
Request:  { "account": "student001", "password": "123456" }
Response: { "token": "eyJ...", "user": { "id": 2, "account": "student001", "name": "张同学", ... } }
Errors:   401 — Invalid credentials
```

**POST /api/auth/register**
```
Request:  { "account": "newuser", "password": "pass123456", "name": "Li", "phone": "138...", "email": "li@swjtu.edu.cn", "country": "中国", "identityNumber": "5101...", "bankName": "中国银行", "bankCardLast4": "6226", "campus": "..." }
Response: 201 — { "token": "eyJ...", "user": { ... } }
Errors:   400 — Missing required fields; 409 — Duplicate account
```

**POST /api/auth/recover**
```
Request:  { "account": "student001", "contact": "13800000000" }
Response: { "ok": true, "account": "student001" }
```

#### Scooters

**GET /api/scooters**
```
Response: [ { "id": "SC101", "qr": "SR-SC101", "storeId": "st-01", "model": "Swift One", "image": "/static/scooters/swift-one.jpg", "status": "available", "battery": 92, "rangeKm": 36, "price": 1.2, "latitude": 30.7693, "longitude": 103.9849, "mileage": 184, "helmet": true, "lockStatus": "已上锁", "commStatus": "在线", "lastTelemetryAt": "19:38", "returnZoneId": "rz-01" }, ... ]
```

**GET /api/scooters/:code**
```
Response: { (single scooter object) }
Errors:   404 — Scooter not found
```

**POST /api/scooters**
```
Request:  { "model": "Swift One", "storeId": "st-01", "status": "available", "battery": 100, "rangeKm": 35 }
Response: 201 — { (new scooter object with auto-generated SCxxx code) }
Errors:   400 — Invalid store; 409 — Duplicate code
```

**PATCH /api/scooters/:code**
```
Request:  { "status": "charging", "battery": 50 }
Response: { (updated scooter object) }
```

#### Bookings

**GET /api/bookings**
**GET /api/bookings?account=student001**
```
Response: [ { "id": "ORD240501", "account": "student001", "scooterId": "SC104", "scooterModel": "Swift Plus", "scooterImage": "/static/scooters/swift-plus.jpg", "storeName": "图书馆广场站", "rentalMode": "remote-store", "status": "paid", "createdAt": "2026-05-08 14:30", "minutes": 45, "insurance": true, "startBattery": 88, "endBattery": 74, "startMileage": 95, "endMileage": 101, "damageReport": "无", "overdueFee": 0, "batteryFee": 1.4, "dispatchFee": 0, "returnOutOfZone": false, "returnChecked": true, "paymentMethod": "中国银行 ****8888", "safetyAccepted": true, "deductionAccepted": true, "total": 69.5, "lastAction": "门店验车完成...", "unlockMessage": "通信模块已向后台发送 SC104 解锁指令" }, ... ]
```

**POST /api/bookings**
```
Request:  { "account": "student001", "scooterId": "SC101", "minutes": 30, "insurance": true, "rentalMode": "sharing-cn", "paymentMethod": "中国银行卡 ****6226", "safetyAccepted": true, "deductionAccepted": true }
Response: 201 — { (new booking object with auto-generated ORD code, calculated total, unlock message) }
```

**PATCH /api/bookings/:code**
```
Request:  { "status": "returned", "endBattery": 74, "endMileage": 101, "damageReport": "无", "lastAction": "已在指定还车区完成还车检查。" }
Response: { (updated booking object) }
```

**DELETE /api/bookings/:code**
```
Response: { "ok": true }
Errors:   404 — Not found
```

#### Stores

**GET /api/stores**
```
Response: [ { "id": "st-01", "name": "犀安路北门站", "address": "西南交通大学犀浦校区北门 · 犀安路 999 号", "latitude": 30.7689, "longitude": 103.9843, "open": "07:00-23:30", "available": 7, "rating": 4.8 }, ... ]
```

#### Issues

**GET /api/issues**
```
Response: [ { "id": "ISS240501", "scooterId": "SC103", "type": "车辆损坏", "message": "头盔缺失...", "priority": "高", "status": "待处理", "account": "student001", "createdAt": "2026-05-08 16:20" }, ... ]
```

**POST /api/issues**
```
Request:  { "account": "student001", "scooterId": "SC103", "type": "车辆损坏", "message": "头盔缺失", "priority": "高" }
Response: 201 — { (new issue object) }
```

**PATCH /api/issues/:code**
```
Request:  { "priority": "高", "status": "处理中" }
Response: { "ok": true }
```

#### Admin

**GET /api/admin/dashboard**
```
Response: {
  "users": [...],
  "frequentUsers": [...],
  "scooters": [...],
  "stores": [...],
  "bookings": [...],
  "issues": [...],
  "priceSettings": [...],
  "promotions": [...],
  "staff": [...],
  "chargingQueue": [...],
  "faults": [...],
  "usage": { "activeUsers": 3, "availableScooters": 4, "totalMinutes": 45, "activeOrders": 0 },
  "finance": { "revenue": 69.50, "paidRevenue": 69.50, "unpaid": 0, "returned": 0 }
}
```

**DELETE /api/admin/users/:account**
```
Response: { "ok": true }
Errors:   403 — Cannot delete admin users; 404 — Not found
```

#### Sync

**POST /api/sync/local**
```
Request:  { "users": [...], "scooters": [...], "bookings": [...], "issues": [...], "currentUser": {...} }
Response: { "ok": true, "synced": { "users": 3, "scooters": 6, "bookings": 2, "issues": 2 } }
```

---

## 8. User Interface Design

### 8.1 Customer App — Navigation Structure

```
┌──────────────────────────────────────────────────────────┐
│                    Tab Bar Navigation                     │
├──────────┬──────────┬──────────┬──────────┬──────────────┤
│  Home    │ Scooters │   Map    │ Bookings │   Profile    │
│  (首页)  │  (车辆)   │  (地图)  │  (订单)   │   (我的)     │
└──────────┴──────────┴──────────┴──────────┴──────────────┘
```

### 8.2 Customer App — Key Page Layouts

**Home Page:**
```
┌────────────────────────────┐
│     SwiftRide              │
│     扫码解锁，按点还车       │
│  ┌──────────────────────┐  │
│  │   🛴 Scooter Hero    │  │
│  │   校园共享电动滑板车    │  │
│  └──────────────────────┘  │
│  ┌──────┐ ┌──────┐ ┌────┐ │
│  │  7   │ │  4   │ │ 24h│ │
│  │可用车 │ │ 站点  │ │服务 │ │
│  └──────┘ └──────┘ └────┘ │
│  ┌──────────────────────┐  │
│  │ Active Booking Card  │  │
│  │ (if ongoing booking) │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │  [扫码租车] (primary) │  │
│  └──────────────────────┘  │
│  Section: Nearby Stores    │
│  Section: How It Works     │
└────────────────────────────┘
```

**Scooter List Page:**
```
┌────────────────────────────┐
│  Nearby Scooters           │
│  Store tabs: 北门 | 图书馆  │
│              | 兴业北街| 南区│
│  ┌──────────────────────┐  │
│  │ SC101  Swift One     │  │
│  │ ████████░░ 92%       │  │
│  │ 续航 36km · 184km    │  │
│  │ 🟢 可租    ¥1.2/min  │  │
│  └──────────────────────┘  │
│  ┌──────────────────────┐  │
│  │ SC104  Swift Plus    │  │
│  │ ████████░░ 88%       │  │
│  │ 续航 32km · 95km     │  │
│  │ 🟢 可租    ¥1.5/min  │  │
│  └──────────────────────┘  │
└────────────────────────────┘
```

### 8.3 Management Web — Layout

```
┌──────────┬──────────────────────────────────────────────────┐
│ Sidebar  │  Top Bar                                         │
│          │  ┌──────────────────────────────────────────┐   │
│  SR     │  │ Backend Operations                        │   │
│ SwiftRide│  │ 运营管理后台                                │   │
│ Operations│ │ [API: ________] [刷新] [打开 API]           │   │
│          │  └──────────────────────────────────────────┘   │
│ ──────── │                                                   │
│ 概览 OK  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ 车辆 6   │  │注册用户│ │可用车辆│ │订单收入│ │待处理问题│          │
│ 订单 1   │  │  3    │ │  4    │ │¥69.50│ │  2    │          │
│ 用户 3   │  └──────┘ └──────┘ └──────┘ └──────┘          │
│ 收入 ¥69 │                                                   │
│ 站点 4   │  ┌──────────────────────────────────────────┐   │
│ 充电 2   │  │           Active Panel Content            │   │
│ 故障 2   │  │  (Table with data and action buttons)     │   │
│ 问题 2   │  │                                           │   │
│          │  └──────────────────────────────────────────┘   │
│ ──────── │                                                   │
│ ● MySQL  │                                                   │
│  已连接   │                                                   │
└──────────┴──────────────────────────────────────────────────┘
```

---

## 9. Security Design

### 9.1 Authentication Flow

1. User registers with account + password → password is bcrypt-hashed (salt factor 10) → stored in `users.password_hash`
2. User logs in → server compares password using `bcrypt.compare()` → issues JWT with 7-day expiry
3. All subsequent requests include `Authorization: Bearer <token>` header
4. `requireAuth` middleware verifies the JWT signature and extracts `{ id, account, role }` into `req.user`
5. `requireAdmin` middleware additionally checks `role === 'admin'`

### 9.2 Password Handling

- **Demo seeds**: Password stored as plaintext `'123456'` for backward compatibility
- **New registrations**: Always bcrypt-hashed
- **Login comparison**: First tries direct comparison (for demo seeds), then bcrypt comparison

### 9.3 SQL Injection Prevention

All database queries use **parameterized queries** via `mysql2` prepared statements:

```javascript
// Safe: parameters are escaped by mysql2
await query('SELECT * FROM users WHERE account = ?', [account])

// Safe: named placeholders
await pool.execute('SELECT * FROM scooters WHERE code = :code', { code })
```

No string concatenation is used for SQL construction.

### 9.4 CORS Policy

```javascript
app.use(cors({ origin: true, credentials: true }))
```

During development, all origins are allowed. In production, this should be restricted to the specific deployment domain.

### 9.5 Environment Security

- Database credentials, JWT secret, and API keys are stored in `.env` (gitignored)
- `.env.example` provides a template without real secrets
- `JWT_SECRET` should be a strong random string in production

---

## Appendix A: Document Revision History

| Version | Date | Author | Description |
|---------|------|--------|-------------|
| 1.0 | 2026-05-18 | SwiftRide Team | Initial release |

## Appendix B: Technology Versions

| Package | Version |
|---------|---------|
| Node.js | 20.19+ |
| Express | 4.19.2 |
| mysql2 | 3.11.0 |
| jsonwebtoken | 9.0.2 |
| bcryptjs | 2.4.3 |
| Vue | 3.5.29 |
| Element Plus | 2.13.5 |
| Vite | 7.3.1 |
| uni-app (HBuilderX) | 3.x |
