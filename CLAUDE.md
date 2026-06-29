# ShopHub — E-Commerce Assessment

> **Git rule (permanent):** Never commit or push to git. The developer reviews all changes and commits manually to `https://github.com/consultancy-outfit/Mini-E-Commerce.git`.

---

## What This Project Is

Full-stack e-commerce platform: NestJS REST API + Next.js App Router storefront + MongoDB. Supports a customer shopping flow (browse → cart → Stripe checkout → order history) and an admin panel (product CRUD, order management, analytics dashboard).

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS 11, Prisma 6.19.3, MongoDB (port **27018**, replica set `rs0`) |
| Frontend | Next.js 16.2.9 (App Router), React 19, Tailwind CSS v4 |
| Auth | JWT 7-day, bcryptjs, `JwtAuthGuard` + `RolesGuard` |
| Payments | Stripe test mode; orders created via `POST /checkout/confirm` (no webhook required locally) |
| Validation | `class-validator` + `class-transformer` (backend); TypeScript (both) |
| Docs | Swagger at `http://localhost:3001/api/docs` |

---

## Running Locally

```bash
# ── Step 1: MongoDB (must run on port 27018 with replica set) ──────────
# Run after every PC restart — replica set init only needed once ever
mongod --port 27018 --dbpath C:\data\db27018 --replSet rs0

# ── Step 2: Backend ───────────────────────────────────────────────────
cd backend
npm run start:dev        # → http://localhost:3001/api

# ── Step 3: Frontend ─────────────────────────────────────────────────
cd frontend
npm run dev              # → http://localhost:3000
```

**Swagger API docs:** `http://localhost:3001/api/docs`

---

## Environment Variables

### `backend/.env`
```
DATABASE_URL="mongodb://localhost:27018/ecommerce_db?replicaSet=rs0&directConnection=true"
JWT_SECRET="<long random string>"
JWT_EXPIRES_IN="7d"
STRIPE_SECRET_KEY="sk_test_..."       # from Stripe dashboard (test mode)
STRIPE_WEBHOOK_SECRET="whsec_..."     # only needed with Stripe CLI
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

### `frontend/.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shophub.com | Admin1234! |
| Customer | customer@shophub.com | Customer1234! |

**Stripe test card:** `4242 4242 4242 4242` · any future expiry · any CVC · any ZIP

---

## Project Structure

```
e-commerce-assessment/
├── CLAUDE.md                         ← you are here
├── .claude/
│   ├── agents/                       ← custom subagent definitions
│   └── commands/                     ← project slash commands
│
├── backend/                          NestJS API (port 3001)
│   ├── src/
│   │   ├── auth/                     JWT auth, bcrypt, guards, decorators
│   │   ├── products/                 Product CRUD + catalog (search, filter, paginate)
│   │   ├── cart/                     Per-user server-side cart
│   │   ├── checkout/                 Stripe session + /confirm endpoint
│   │   ├── orders/                   Customer order history (GET /orders, GET /orders/:id)
│   │   ├── admin/                    Admin orders + analytics (ADMIN role required)
│   │   └── prisma/                   PrismaService global singleton
│   ├── prisma/
│   │   ├── schema.prisma             6 models: User, Product, Cart, CartItem, Order, OrderItem
│   │   └── seed.ts                   22 products + 2 users
│   └── .env                          Local secrets (never commit)
│
└── frontend/                         Next.js app (port 3000)
    └── src/
        ├── app/                      App Router pages & layouts
        │   ├── page.tsx              Home / landing page
        │   ├── auth/login            Split-screen login → role-based redirect
        │   ├── auth/register         Split-screen register
        │   ├── shop/                 Catalog (filter, sort, paginate) + product detail
        │   ├── checkout/             Checkout page + success + cancel
        │   ├── orders/               Order list + order detail
        │   ├── account/              Profile page + change password
        │   └── admin/                Dashboard + product CRUD + order management
        ├── components/
        │   ├── Navbar.tsx            Sticky nav, frosted glass, avatar dropdown
        │   ├── cart/CartDrawer.tsx   Side drawer cart
        │   ├── shop/ProductCard.tsx  Product card with wishlist + quick view
        │   ├── shop/CatalogClient.tsx Filter sidebar + pagination
        │   └── admin/ProductForm.tsx Shared create/edit product form
        ├── context/
        │   ├── AuthContext.tsx       JWT auth state (login returns User for redirect)
        │   └── CartContext.tsx       Server-side cart state
        └── lib/
            ├── api.ts                apiFetch<T>() — handles token + base URL
            ├── auth.ts               getToken / setToken / clearToken (localStorage)
            └── order-utils.ts        Status labels, classes, date formatting
```

---

## Critical Architecture Decisions

### 1. MongoDB ObjectId Validation
```typescript
// ✅ CORRECT — MongoDB ObjectIds are 24-char hex, NOT UUIDs
@Matches(/^[a-f\d]{24}$/i, { message: 'Must be a valid MongoDB ObjectId' })

// ❌ WRONG — rejects all MongoDB ObjectIds
@IsUUID()
```

### 2. Tailwind CSS v4
Custom CSS classes defined in `globals.css` are **not reliably applied** in JSX components. Always write all styling as inline Tailwind utility classes directly on elements.

### 3. Stripe Checkout (Local Dev)
Stripe webhooks cannot reach `localhost`. Order creation happens via:
```
POST /api/checkout/confirm   { sessionId: "cs_test_..." }
```
The success page calls this with the `session_id` from the URL. The endpoint is idempotent — safe to call even if the webhook later fires.

### 4. MongoDB Replica Set
Port 27017 (default MongoDB service) has **no replica set**. Prisma's `@unique` constraints require transactions, which require a replica set. Always use port 27018.

### 5. Admin Redirect on Login
`AuthContext.login()` returns the `User` object so the login page can redirect:
```typescript
const user = await login(email, password);
router.push(user.role === 'ADMIN' ? '/admin' : '/shop');
```

---

## Backend Patterns

```typescript
// ── Protecting endpoints ──────────────────────────────────────────────
@UseGuards(JwtAuthGuard)                    // any authenticated user
@UseGuards(JwtAuthGuard, RolesGuard)        // + role check
@Roles(Role.ADMIN)                          // must pair with RolesGuard

// ── Current user in controller ────────────────────────────────────────
@CurrentUser() user: JwtPayload    // { sub: userId, email, role }

// ── MongoDB ObjectId DTO ──────────────────────────────────────────────
@IsString()
@Matches(/^[a-f\d]{24}$/i, { message: 'Must be a valid MongoDB ObjectId' })
productId: string;

// ── Atomic multi-step writes ──────────────────────────────────────────
await this.prisma.$transaction(async (tx) => {
  const order = await tx.order.create({ ... });
  await tx.cartItem.deleteMany({ where: { cartId } });
  return order;
});

// ── Shape Prisma output ───────────────────────────────────────────────
await this.prisma.order.findMany({
  where: { userId },
  include: { items: { include: { product: { select: { name: true, imageUrl: true } } } } },
  orderBy: { createdAt: 'desc' },
});
```

---

## Frontend Patterns

```typescript
// ── API calls ─────────────────────────────────────────────────────────
const data = await apiFetch<ResponseType>('/endpoint', {
  method: 'POST',   // default: GET
  token,            // JWT from useAuth()
  body: { ... },    // auto JSON.stringify'd
});
// Throws Error with server message on non-ok; returns undefined on 204

// ── Auth guard on protected pages ─────────────────────────────────────
useEffect(() => {
  if (!loading && !user) router.replace('/auth/login');
}, [loading, user, router]);

// ── Role-based render ─────────────────────────────────────────────────
{user?.role === 'ADMIN' && <AdminComponent />}

// ── Standard input class ──────────────────────────────────────────────
className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm
           text-gray-900 placeholder-gray-400 outline-none transition-all
           focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"

// ── Standard button class ─────────────────────────────────────────────
className="rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-bold text-white
           shadow-lg shadow-blue-200 transition-all hover:bg-blue-500
           hover:-translate-y-0.5 hover:shadow-xl disabled:opacity-60"
```

---

## Database Commands

```bash
cd backend

npm run db:push          # push schema changes to MongoDB (no migration files)
npm run db:seed          # seed 22 products + 2 users (safe, uses upsert)
npm run db:reset         # ⚠️  DESTRUCTIVE: wipe all data, then re-seed

npx prisma generate      # regenerate client after schema changes
npx prisma studio        # open Prisma Studio GUI at http://localhost:5555
```

---

## Available Slash Commands

| Command | Description |
|---------|-------------|
| `/dev` | Check which services are running and how to start any that aren't |
| `/status` | Health check for MongoDB, backend, and frontend ports |
| `/seed` | Re-seed the database with products and test users |
| `/test` | Run backend unit tests (with optional coverage) |
| `/lint` | Lint and auto-fix both backend and frontend |
| `/add-module` | Scaffold a new NestJS feature module following project patterns |

---

## Available Agents

| Agent | When to Use |
|-------|------------|
| `backend-dev` | NestJS controllers, services, DTOs, guards, Prisma queries |
| `frontend-dev` | Next.js pages, React components, Tailwind styling, context |
| `fullstack-reviewer` | Code review, security audit, API/UI consistency checks |
| `db-admin` | Schema changes, seed data, Prisma migrations, MongoDB queries |

---

## What NOT to Do

- Never use `@IsUUID()` for MongoDB IDs — use `@Matches(/^[a-f\d]{24}$/i)`
- Never change `DATABASE_URL` to port 27017 (no replica set there)
- Never define Tailwind utility classes in CSS and use them in JSX components
- Never commit `.env` or `.env.local` files
- Never commit or push to git — developer handles all git operations
- Never remove `JwtAuthGuard` from admin or user-specific endpoints
- Never return `passwordHash` in any API response
