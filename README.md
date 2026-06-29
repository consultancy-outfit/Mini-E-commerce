# ShopHub — Mini E-Commerce Platform

Full-stack mini e-commerce platform with a customer storefront and admin panel.

## Stack

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** Next.js 16.2.9 (App Router) + Tailwind CSS 4
- **Auth:** JWT (via NestJS Passport)
- **Payments:** Stripe test mode

---

## Prerequisites

- Node.js 18+
- PostgreSQL running locally (or a connection string to a hosted instance)
- A Stripe account (free) for test keys

---

## Setup

### 1. Clone & install

```bash
git clone https://github.com/consultancy-outfit/Mini-E-commerce.git
cd Mini-E-commerce

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Environment variables

**Backend** — create `backend/.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ecommerce_db"
JWT_SECRET="your-secret-here"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**Frontend** — create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### 3. Database setup & seed

```bash
cd backend

# Create the database tables (runs the initial migration)
npm run db:migrate
# When prompted for a migration name, enter: init

# Seed the database (admin user, customer user, 22 sample products)
npm run db:seed
```

> **Note:** This project uses Prisma 7. The connection URL is configured in
> `prisma.config.ts` (for CLI/migrations) and read from `DATABASE_URL` at
> runtime via the `@prisma/adapter-pg` driver adapter.

### 4. Start the apps

```bash
# Terminal 1 — Backend (port 3001)
cd backend && npm run start:dev

# Terminal 2 — Frontend (port 3000)
cd frontend && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Seeded Credentials

| Role     | Email                  | Password    |
|----------|------------------------|-------------|
| Admin    | admin@shophub.com      | Admin123!   |
| Customer | customer@shophub.com   | Customer123!|

---

## Stripe Test Payments

Use Stripe's test card: **4242 4242 4242 4242**, any future expiry, any CVC.

---

## Running Tests

```bash
# Unit tests — no database required (PrismaService fully mocked)
cd backend && npm test

# Unit tests with coverage report
cd backend && npm run test:cov

# E2E tests — no database required (PrismaService + CheckoutService mocked)
cd backend && npm run test:e2e
```

**Unit test files:**
- `src/auth/auth.service.spec.ts` — register, login, password hashing, duplicate detection
- `src/products/products.service.spec.ts` — pagination, 404 handling, suggestions (co-occurrence + fallback)
- `src/orders/orders.service.spec.ts` — order listing, ownership scoping, Decimal serialization

**E2E test file:**
- `test/auth.e2e-spec.ts` — full HTTP layer tests for auth endpoints + public products API

For more detail on the testing approach, see [`NOTES.md`](./NOTES.md).

---

## Project Structure

```
e-commerce-assessment/
├── NOTES.md                  # Architecture decisions & trade-offs
├── backend/                  # NestJS API (port 3001)
│   ├── src/
│   │   ├── prisma/           # Global PrismaService (adapter-pg)
│   │   ├── auth/             # JWT, bcrypt, JwtAuthGuard, RolesGuard
│   │   ├── products/         # Catalogue CRUD + /suggestions
│   │   ├── cart/             # Server-side cart (1:1 per user)
│   │   ├── checkout/         # Stripe session + raw-body webhook
│   │   ├── orders/           # Order history (customer view)
│   │   └── admin/            # Admin orders, analytics
│   ├── test/
│   │   └── auth.e2e-spec.ts  # E2E tests (supertest, mocked Prisma)
│   └── prisma/
│       ├── schema.prisma     # 6 models: User, Product, Cart, CartItem, Order, OrderItem
│       └── seed.ts           # 2 users + 20 products
└── frontend/                 # Next.js 16 App Router (port 3000)
    └── src/
        ├── app/
        │   ├── shop/         # Catalogue + product detail + suggestions
        │   ├── checkout/     # Cart summary → Stripe → success/cancel
        │   ├── orders/       # Order history + detail
        │   ├── admin/        # Dashboard, products CRUD, orders
        │   └── (auth)/       # Login + register pages
        ├── components/       # Navbar, ProductCard, ProductForm, CartDrawer
        ├── context/          # AuthContext, CartContext
        └── lib/              # apiFetch, order-utils
```
