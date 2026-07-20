<div align="center">
  <h1>🛒 MegaMart E-Commerce Backend</h1>
  <p><strong>Production-grade REST API — Multi-tenant e-commerce platform with RBAC, event-driven architecture, 3 payment gateways, Redis caching, and RabbitMQ async processing</strong></p>
  <p>
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white" />
    <img src="https://img.shields.io/badge/NestJS-11-E0234E?style=flat-square&logo=nestjs&logoColor=white" />
    <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql&logoColor=white" />
    <img src="https://img.shields.io/badge/Redis-7-DC382D?style=flat-square&logo=redis&logoColor=white" />
    <img src="https://img.shields.io/badge/RabbitMQ-4-FF6600?style=flat-square&logo=rabbitmq&logoColor=white" />
    <img src="https://img.shields.io/badge/Stripe-008CDD?style=flat-square&logo=stripe&logoColor=white" />
    <img src="https://img.shields.io/badge/TypeORM-0.3-262627?style=flat-square&logo=typeorm&logoColor=white" />
    <img src="https://img.shields.io/badge/Docker_compose-2496ED?style=flat-square&logo=docker&logoColor=white" />
    <img src="https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white" />
    <img src="https://img.shields.io/badge/Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black" />
    <img src="https://img.shields.io/badge/license-MIT-blue?style=flat-square" />
  </p>
  <p>
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-architecture">Architecture</a> •
    <a href="#-features">Features</a> •
    <a href="#-payment-gateways">Payments</a> •
    <a href="#-api-documentation">API Docs</a>
  </p>
</div>

---

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Database Design](#-database-design)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Documentation](#-api-documentation)
- [Authentication & Authorization](#-authentication--authorization)
- [Event-Driven Architecture](#-event-driven-architecture)
- [Payment Gateways](#-payment-gateways)
- [Testing](#-testing)
- [Scripts](#-scripts)

---

## 🏗 Architecture

<img src="docs/diagrams/architecture.svg" alt="Architecture Diagram" width="100%"/>

---

## 💾 Database Design

<img src="docs/diagrams/erd.svg" alt="Database ERD" width="100%"/>

---

## ✨ Features

### 🔐 Authentication & Security
- **JWT Access + Refresh Token** pair with configurable expiry
- **3 user types**: Admin, Customer, Vendor with dedicated auth flows
- **OAuth 2.0** — Google & Facebook login for customers
- **RBAC** — Roles + fine-grained scope-based permissions (`action:resource:scope`)
- **Account lockout** — 10 failed attempts → 25-min lockout (Redis-backed)
- **Password reset** — Secure token-based with 1-hour expiry (hashed)
- **Argon2id** password hashing with configurable parameters
- **Global JWT guard** with `@Public()` opt-out decorator

### 🛍️ E-Commerce Core
- **Product management** — Full CRUD, SKU/slug auto-generation, full-text search, SEO fields
- **Category tree** — Hierarchical with parent/children, display order, visibility
- **Brand management** — With logo upload
- **Product variants** — Attribute-value pivot system (Color, Size, Material, etc.)
- **Shopping cart** — Product snapshots (price-at-add), JSONB attributes, expiration
- **Wishlist** — Per-customer unique wishlist
- **Coupon system** — Percentage/fixed, usage limits, date ranges, min purchase
- **Product reviews** — 1-5 star ratings with comments

### 📦 Order Management
- **Full order lifecycle** — pending → confirmed → processing → shipped → delivered / cancelled / returned / refunded
- **Order items** — Product snapshots (name, SKU, description, image, attributes)
- **Return & refund** workflow with approval tracking
- **Shipping tracking** — Carrier info, tracking numbers, ETA

### 💳 Payment Gateways
- **Stripe** — PaymentIntents, CheckoutSessions, webhooks
- **PayPal** — Orders, captures, refunds
- **SSLCommerz** — Initiation, validation, IPN

### 📬 Notifications
- **In-app notifications** with read tracking
- **Email** via Nodemailer with templating & delivery logs
- **SMS** with delivery status tracking

### ⚡ Event-Driven & Async
- **RabbitMQ** — Topic & direct exchanges, dead-letter queue, retry
- **Event emitter** — Local + distributed events for loose coupling
- **Scheduled/delayed messages** via RabbitMQ

### 🚀 Performance & Reliability
- **Redis caching** — Domain-based with tagging, stats, warm-up, bulk ops
- **Distributed locks** — Redis-based for concurrent safety
- **Image optimization** — Automatic 4 WebP variants (150px–1200px) via Sharp
- **Rate limiting** — Per-role upload limits (size, count, dimensions)

### 🧹 Developer Experience
- **Swagger/OpenAPI** docs at `/docs` with Bearer auth
- **Global response envelope** — `{ data, status, meta }` with auto-pagination
- **Global exception filter** — Structured errors with request ID
- **Request ID tracking** — `x-request-id` UUID on every request
- **URI-based API versioning**
- **Joi env validation** at startup
- **Soft delete** on all entities (`deletedAt`)

### 👥 Multi-Tenancy
- Admin / Customer / Vendor separation via user type
- **Vendor KYC** — Multi-step verification with document upload, admin review
- **Vendor commission** — Per-vendor rate (percentage or flat)
- **Customer loyalty tiers** — Bronze → Silver → Gold → Platinum with reward points

---

## 🛠 Tech Stack

| Category | Technology |
|---|---|
| **Runtime** | Node.js, TypeScript 5.7 |
| **Framework** | NestJS 11, Express |
| **Database** | PostgreSQL 16 via TypeORM 0.3 |
| **Cache** | Redis 7 via ioredis, cache-manager |
| **Message Broker** | RabbitMQ 4 via @golevelup/nestjs-rabbitmq |
| **Auth** | Passport, JWT, Argon2, Google/Facebook OAuth |
| **Payments** | Stripe, PayPal, SSLCommerz |
| **File Storage** | Cloudinary, Multer, Sharp |
| **Notifications** | Nodemailer (Email), SMS service |
| **Validation** | class-validator, Joi |
| **API Docs** | Swagger/OpenAPI (@nestjs/swagger 11) |
| **Testing** | Jest, Supertest |
| **Linting** | ESLint, Prettier, typescript-eslint |
| **Infrastructure** | Docker Compose (PostgreSQL, Redis, RabbitMQ) |

---

## 📁 Project Structure

```
src/
├── core/                          # Shared core infrastructure
│   ├── auth/                      # JWT auth, guards, decorators, RBAC
│   ├── cache/                     # Redis-backed domain caching
│   ├── database/                  # PostgreSQL config, env validation
│   ├── rabbitmq/                  # Message broker setup & service
│   ├── redis/                     # Low-level Redis client & service
│   └── upload/                    # File upload, Cloudinary, image optimization
│
├── modules/                       # Feature modules
│   ├── personnel-management/      # Users, Admins, Customers, Vendors, Roles, Permissions, Addresses
│   ├── product-management/        # Products, Categories, Brands, Cart, Wishlist, Reviews, Coupons, Attributes
│   ├── order-management/          # Orders, Payments, Inventory, Gateways (Stripe/PayPal/SSLCommerz)
│   └── notification-management/   # In-App, Email, SMS notifications
│
└── shared/                        # Shared utilities
    ├── dto/                       # PaginationQueryDto
    ├── entity/                    # BaseEntity (id, createdAt, updatedAt, deletedAt)
    ├── filter/                    # Global HttpExceptionFilter
    ├── interceptor/               # ResponseInterceptor (envelope wrapper)
    ├── interface/                 # ApiResponse, PaginationMeta types
    ├── middleware/                # RequestIdMiddleware
    └── utils/                     # PasswordUtil (argon2id)
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js ≥ 22
- Docker & Docker Compose (for PostgreSQL, Redis, RabbitMQ)

### 1. Clone & Install

```bash
git clone <repo-url>
cd megamart
yarn install
```

### 2. Start Infrastructure (PostgreSQL, Redis, RabbitMQ)

```bash
docker compose up -d
```

This starts:
- **PostgreSQL 16** on `localhost:5432` (user: `postgres`, password: `postgres`)
- **Redis 7** on `localhost:6379` (password: `redis`)
- **RabbitMQ 4** on `localhost:5672` (AMQP) + `localhost:15672` (Management UI)

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values. At minimum, set:

```env
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/app_db_dev
REDIS_URL=redis://:redis@127.0.0.1:6379
RABBITMQ_URL=amqp://guest:guest@127.0.0.1:5672
JWT_REFRESH_SECRET=your_random_64_char_secret

# Payment keys (optional in dev — mock mode fallback)
STRIPE_SECRET_KEY=sk_test_***
PAYPAL_CLIENT_ID=***
SSL_COMMERZ_STORE_ID=***
```

> 🧪 **Payment mock mode**: If a gateway's env vars are missing, the API falls back to a `MockPaymentProvider` — no real credentials needed for local development.

### 4. Run Migrations

```bash
# Migrations are in ./migrations/ and auto-run on first docker compose up
# Alternatively, let TypeORM sync (synchronize: true in development)
```

### 5. Start Development Server

```bash
yarn start:dev
```

Server starts at [http://127.0.0.1:3000](http://127.0.0.1:3000) with Swagger at [http://127.0.0.1:3000/docs](http://127.0.0.1:3000/docs).

---

## 🌍 Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection URL |
| `REDIS_URL` | ✅ | — | Redis connection URL |
| `RABBITMQ_URL` | ✅ | — | RabbitMQ connection URL |
| `JWT_REFRESH_SECRET` | ✅ | — | Secret for refresh token signing (min 32 chars) |
| `NODE_ENV` | — | `development` | `development` or `production` |
| `PORT` | — | `3000` | Application port |
| `APP_BASE_URL` | — | `http://localhost:5000` | Callback URL for payment gateways |
| `CLOUDINARY_API_KEY` | — | — | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | — | — | Cloudinary API secret |
| `CLOUDINARY_CLOUD_NAME` | — | — | Cloudinary cloud name |
| **Payments** | | | |
| `STRIPE_SECRET_KEY` | ✅ | — | [Stripe](https://dashboard.stripe.com/apikeys) secret key (`sk_live_*` / `sk_test_*`) |
| `STRIPE_WEBHOOK_SECRET` | ✅ | — | [Stripe](https://dashboard.stripe.com/webhooks) webhook signing secret (`whsec_*`) |
| `PAYPAL_CLIENT_ID` | ✅ | — | [PayPal](https://developer.paypal.com/dashboard/applications) REST app client ID |
| `PAYPAL_CLIENT_SECRET` | ✅ | — | [PayPal](https://developer.paypal.com/dashboard/applications) REST app secret |
| `PAYPAL_ENVIRONMENT` | — | `sandbox` | `sandbox` or `live` |
| `SSL_COMMERZ_STORE_ID` | ✅ | — | [SSLCommerz](https://sandbox.sslcommerz.com) store ID |
| `SSL_COMMERZ_STORE_PASSWORD` | ✅ | — | [SSLCommerz](https://sandbox.sslcommerz.com) store password |
| `SSL_COMMERZ_IS_LIVE` | — | `false` | `true` for production, `false` for sandbox |

---

## 📖 API Documentation

Interactive Swagger/OpenAPI documentation is available at **`/docs`** when the server is running:

```
http://127.0.0.1:3000/docs
```

- All endpoints are documented with request/response schemas
- Bearer JWT authentication via "Authorize" button
- Grouped by feature module tags

---

## 🔐 Authentication & Authorization

### Flow

```
Client                    API
  │                        │
  │── POST /auth/login ────│── Verify credentials
  │                        │── Generate access token (15m) + refresh token (7d)
  │◄──── tokens ──────────│
  │                        │
  │── GET /resource ──────│── JwtAuthGuard validates Bearer token
  │   Authorization:       │── ScopePermissionGuard checks action:resource:scope
  │   Bearer <token>       │── Execute handler
  │◄──── response ───────│
```

### Guards & Decorators

| Decorator | Access |
|---|---|
| `@Public()` | No authentication required |
| `@Auth()` | Any authenticated user |
| `@CustomerOnly()` | Customer role only |
| `@VendorOnly()` | Vendor role only |
| `@AdminOnly()` | Admin role only |
| `@AdminWithPermission()` | Admin with specific scope permission |
| `@RequireOwn(action, resource)` | Own scope |
| `@RequireAll(action, resource)` | All scope |
| `@RequireScopes(action, resource, scopes)` | Custom scopes |

---

## ⚡ Event-Driven Architecture

### RabbitMQ Exchanges

| Exchange | Type | Purpose |
|---|---|---|
| `ecommerce.events` | Topic | General domain events |
| `ecommerce.notifications` | Direct | Email, SMS, push notifications |
| `ecommerce.orders` | Topic | Order lifecycle events |
| `ecommerce.payments` | Direct | Payment status changes |
| `ecommerce.inventory` | Topic | Stock level changes |
| `ecommerce.deadletter` | Direct | Failed message handling |

### Published Events

- **User events**: registration, login, password reset, profile update
- **Order events**: created, confirmed, shipped, delivered, cancelled, returned, refunded
- **Payment events**: succeeded, failed, refunded
- **Inventory events**: low stock, out of stock, restocked

---

## 💳 Payment Gateways

The API supports three payment providers through a **unified abstraction layer** — switch between them via configuration, no code changes needed.

| Gateway | Integration | Webhooks | Setup Guide |
|---|---|---|---|
| **Stripe** | PaymentIntents, CheckoutSessions | ✅ | [Dashboard](https://dashboard.stripe.com/apikeys) → Get `STRIPE_SECRET_KEY` + [webhook](https://dashboard.stripe.com/webhooks) `STRIPE_WEBHOOK_SECRET` |
| **PayPal** | Orders API, captures, refunds | — | [Developer Dashboard](https://developer.paypal.com/dashboard/applications) → Create REST app → Copy `CLIENT_ID` & `SECRET` |
| **SSLCommerz** | Initiation, validation, IPN | ✅ | [Sandbox](https://sandbox.sslcommerz.com) → Register store → Get `STORE_ID` & `STORE_PASSWORD` |

```bash
# Copy .env.example → .env and fill in your credentials
# The gateway controller routes to the correct provider based on the request payload
```

### Webhook Endpoints

| Gateway | Endpoint | Event |
|---|---|---|
| **Stripe** | `POST /api/v1/payments/stripe/webhook` | `payment_intent.succeeded`, `payment_intent.payment_failed` |
| **PayPal** | `POST /api/v1/payments/paypal/webhook` | `CHECKOUT.ORDER.APPROVED`, `PAYMENT.CAPTURE.COMPLETED` |
| **SSLCommerz** | `POST /api/v1/payments/sslcommerz/ipn` | Instant Payment Notification |

---

## 🧪 Testing

```bash
# Unit tests
yarn test

# Watch mode
yarn test:watch

# With coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

---

## 📜 Scripts

| Command | Description |
|---|---|
| `yarn build` | Compile TypeScript |
| `yarn start` | Start production server |
| `yarn start:dev` | Start with watch mode |
| `yarn lint` | Lint with ESLint (auto-fix) |
| `yarn format` | Format with Prettier |
| `yarn test` | Run unit tests |
| `yarn test:cov` | Run tests with coverage |
| `yarn test:e2e` | Run end-to-end tests |

---

