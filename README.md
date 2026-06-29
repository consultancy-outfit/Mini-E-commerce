# ShopHub — Mini E-Commerce Platform

Full-stack mini e-commerce platform with a customer storefront and admin panel.

## Stack

- **Backend:** NestJS + Prisma + PostgreSQL
- **Frontend:** Next.js 14 (App Router) + Tailwind CSS
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

**Backend** — copy `.env.example` to `backend/.env` and fill in:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ecommerce_db"
JWT_SECRET="your-secret-here"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

**Frontend** — copy `.env.example` to `frontend/.env.local` and fill in:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 3. Database setup & seed

```bash
cd backend

# Run migrations
npx prisma migrate dev --name init

# Seed the database
npx ts-node prisma/seed.ts
```

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
cd backend && npm run test        # unit tests
cd backend && npm run test:e2e    # e2e tests
```

---

## Project Structure

```
e-commerce-assessment/
├── backend/                  # NestJS API
│   ├── src/
│   │   ├── prisma/           # PrismaService + PrismaModule
│   │   ├── auth/             # JWT auth, guards, strategies
│   │   ├── products/         # Product CRUD + suggestions
│   │   ├── cart/             # Cart management
│   │   ├── orders/           # Checkout + order history
│   │   └── admin/            # Admin analytics
│   └── prisma/
│       ├── schema.prisma     # All 6 data models
│       └── seed.ts           # Seed script
└── frontend/                 # Next.js storefront + admin
    └── src/
        ├── app/
        │   ├── shop/         # Product catalog + detail
        │   ├── cart/         # Cart page
        │   ├── checkout/     # Checkout flow
        │   ├── orders/       # Order history
        │   ├── auth/         # Login + register
        │   └── admin/        # Admin panel (protected)
        └── lib/
            └── api.ts        # Shared fetch client
```
