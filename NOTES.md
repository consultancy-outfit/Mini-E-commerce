# Technical Notes

## Architecture overview

```
e-commerce-assessment/
├── backend/    NestJS 11 REST API  (port 3001)
└── frontend/   Next.js 16 App Router (port 3000)
```

All communication is over HTTP REST with JWT Bearer tokens. There is no shared package between the two — intentional for a clean monorepo boundary.

---

## Key design decisions

### 1. PrismaModule is `@Global()`

`PrismaService` is declared global so every feature module can inject it without re-importing `PrismaModule`. With Prisma 7 + `@prisma/adapter-pg`, a single connection pool is shared across the process.

### 2. Prisma 7 adapter-pg

Prisma 7 removed the bundled TCP connector and now requires an explicit adapter. `PrismaPg` wraps a `pg` connection string and handles pool management. This means `DATABASE_URL` must be a full `postgresql://` connection string, not just a host/port tuple.

### 3. JWT strategy — `fallback-secret` in AuthModule

`JwtModule.register` is evaluated once at module load time before `ConfigModule` is ready in some bootstrap orderings. To avoid a race condition, `process.env.JWT_SECRET || 'fallback-secret'` is used directly. In production `JWT_SECRET` is always set via env, making the fallback unreachable.

### 4. Server-side cart (1-to-1 with user)

Each user has one `Cart` (unique on `userId`). `CartItem` has a compound unique key `(cartId, productId)` so duplicate product additions increment quantity instead of creating a second row. This pattern avoids client-side cart state entirely — the server is always authoritative.

### 5. Stripe webhook raw body

NestJS body-parses every POST by default, destroying the raw bytes Stripe needs for HMAC signature verification. `rawBody: true` in `NestFactory.create` preserves the raw buffer on `req.rawBody`. The webhook controller reads `req.rawBody` while all other routes continue receiving parsed JSON.

`isolatedModules: true` is set in `tsconfig.json`, which means type-only imports used in decorated parameters must be imported with `import type { ... }` rather than `import { ... }`. This required the special import forms in `checkout.controller.ts`:

```typescript
import { type RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
```

### 6. Webhook idempotency

Before creating an `Order`, the checkout service checks whether an `Order` with `stripeSessionId` already exists. This ensures a re-delivered `checkout.session.completed` event is a no-op rather than duplicating the order and double-decrementing stock.

### 7. Order ownership scoping

`OrdersService.findOne` uses `findFirst({ where: { id, userId } })` rather than `findUnique({ where: { id } })`. This means a user who guesses another user's order UUID gets a 404, not 403 — the existence of the order is not disclosed.

### 8. Admin routes on existing controllers

Admin-only product mutations (`POST`, `PATCH`, `DELETE`) are co-located in `ProductsController` rather than in `AdminController`. This keeps the resource URL canonical (`/api/products` for all product operations) while access control is enforced by `RolesGuard` + `@Roles(Role.ADMIN)`. `AdminController` owns cross-resource admin views (all orders, analytics).

### 9. Product suggestions algorithm

`GET /api/products/:id/suggestions` uses a two-stage algorithm:

1. **Co-occurrence** — find all orders that contain the target product, then `groupBy productId` on the other items in those orders sorted by co-occurrence count descending. This surfaces "frequently bought together" products.
2. **Category fallback** — if fewer than 4 co-purchase suggestions exist, fill remaining slots with same-category products ordered by newest, excluding the current product and already-selected suggestions.

Result order is preserved by building a `Map<id, product>` from the final `findMany` and mapping back through the ranked `suggestionIds` array.

### 10. Next.js 16 App Router — params is a Promise

In Next.js 16, `params` and `searchParams` props on server components are `Promise<{ ... }>` and must be `await`ed. Client components use `useParams()` from `next/navigation` instead (the hook resolves the promise internally).

### 11. Client-only pages (orders, admin)

The orders and admin sections require a JWT token, which lives in `localStorage`. Server components cannot access `localStorage`, so these pages are client components with a `useEffect` redirect for unauthenticated users. The trade-off is no server-side rendering for those pages; acceptable for an authenticated-only dashboard.

### 12. `cartReady` flag

`CartContext` has a `cartReady: boolean` state that is `false` until the first cart fetch completes. The checkout page reads `cartReady` before deciding whether to redirect to `/shop` — this prevents a redirect flash where the cart appears empty for ~100 ms on first load before the API response arrives.

---

## Testing strategy

| Layer | Tool | Files |
|---|---|---|
| Unit | Jest + `@nestjs/testing` | `src/**/*.spec.ts` |
| E2E | Jest + supertest + `@nestjs/testing` | `test/auth.e2e-spec.ts` |

Unit tests mock `PrismaService` entirely with `jest.fn()` delegates. No database is required to run the unit suite.

E2E tests spin up the full NestJS application with `PrismaService` and `CheckoutService` overridden via `overrideProvider`. A real server listens on a random port; supertest issues actual HTTP requests. No database is required for the E2E suite either.

**To run unit tests:**
```bash
cd backend && npm test
```

**To run E2E tests:**
```bash
cd backend && npm run test:e2e
```

**Frontend testing** was not included in this phase. The Next.js frontend would require `jest` + `jest-environment-jsdom` + `@testing-library/react` added as dev dependencies. Key things to test: `AuthContext` token persistence, `CartContext` item accumulation, and the checkout redirect logic.

---

## Known limitations / future improvements

- **No refresh tokens** — JWTs are 7-day-lived bearer tokens. A refresh-token rotation scheme would improve security for long-lived sessions.
- **No rate limiting** — the auth endpoints accept unlimited login attempts. `@nestjs/throttler` would address this.
- **Image uploads** — products use external `imageUrl` strings. A real upload flow would use S3/Cloudflare R2 with pre-signed URLs.
- **Pagination on admin orders** — the admin orders list fetches all orders. Should be paginated for large datasets.
- **Frontend tests** — see above.
- **CI pipeline** — no GitHub Actions workflow is included. A basic pipeline would run `tsc --noEmit`, `npm test`, and `npm run test:e2e` on each push.
