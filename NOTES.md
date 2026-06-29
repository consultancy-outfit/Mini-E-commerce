# NOTES.md — ShopHub E-Commerce Assessment

---

## 1. Agent Workflow

### Tool Used
**Claude Code** (Anthropic CLI) — an interactive agentic coding assistant with persistent context, tool access (file read/write/edit, bash execution, search), and a custom subagent/command system built into the project.

### How Tasks Were Scoped and Driven

The build was driven phase-by-phase through a Claude Code session. Each phase was issued as a focused natural-language instruction — e.g. "add Stripe checkout flow", "add avatar dropdown with profile page" — and Claude Code translated that into concrete file edits across both backend and frontend.

**Context management via CLAUDE.md:** A `CLAUDE.md` file was created at the project root to give Claude Code persistent, session-independent context. It contains:
- Stack versions and port numbers
- Critical architecture decisions (MongoDB ObjectId format, Tailwind v4 limits, Stripe webhook workaround, replica set requirement)
- Exact backend and frontend code patterns
- A "What NOT to Do" list encoding mistakes that had already been caught
- Full project file tree and running instructions

This meant that even after context compaction or a new session, the agent re-oriented instantly without the developer needing to re-explain project conventions.

**Subagents in `.claude/agents/`:**
- `backend-dev` — NestJS/Prisma/MongoDB specialist
- `frontend-dev` — Next.js/React/Tailwind specialist
- `fullstack-reviewer` — security and consistency auditor
- `db-admin` — schema, seed, and MongoDB operations

**Slash commands in `.claude/commands/`:** `/dev`, `/status`, `/seed`, `/test`, `/lint`, `/add-module` — each runs with full project context so the agent doesn't make generic assumptions.

**Git rule** was enforced as a CLAUDE.md permanent constraint: the agent never commits or pushes. The developer reviewed all diffs and committed manually.

---

## 2. Where the Agent Helped

- **Module scaffolding:** Built the entire NestJS module structure (auth, products, cart, checkout, orders, admin) with correct guards, decorators, and Swagger annotations in a single pass — saving hours of boilerplate
- **Co-purchase algorithm:** Implemented the product suggestions algorithm unprompted — correctly interpreted "product suggestions" as a co-occurrence ranking with category fallback, not a random related-items query
- **Unit tests:** Wrote all three service test suites (auth, products, orders) with proper Prisma mocking, covering happy paths and edge cases
- **Stripe workaround:** Identified the localhost webhook limitation before it was encountered and proactively designed the idempotent `POST /checkout/confirm` endpoint so order creation works in local dev without a webhook tunnel
- **UI implementation:** Built the entire frontend UI (auth pages, catalog, cart drawer, checkout flow, orders, account, admin dashboard) in inline Tailwind utilities consistent with v4 constraints — matched design intent on first pass without visual iteration for most pages

---

## 3. Where the Agent Failed — and How It Was Caught

### Failure 1: `@IsUUID()` on MongoDB ObjectId
**What happened:** `AddToCartDto` used `@IsUUID()` to validate `productId`. MongoDB ObjectIds are 24-character hex strings, not UUIDs — every Add to Cart request returned `"productId must be a UUID"`.

**How caught:** Runtime error visible in the browser console when the user clicked "Add to Cart".

**Fix:** Replaced `@IsUUID()` with `@Matches(/^[a-f\d]{24}$/i)`. Became rule #1 in CLAUDE.md's "What NOT to Do" list and applies to all ID-type DTOs in the project.

**Lesson:** The agent defaulted to the standard NestJS validator without accounting for MongoDB's non-UUID ID format. Project-specific ID formats must be stated explicitly upfront.

---

### Failure 2: Stripe Placeholder Key Not Flagged
**What happened:** `backend/.env` contained the literal placeholder `STRIPE_SECRET_KEY="sk_test_..."`. The agent accepted this during initial setup without verifying it was a real key. The error only surfaced when the user attempted a real checkout and saw "Invalid API Key provided" in the browser.

**How caught:** The user shared a screenshot of the Stripe error.

**Fix:** Replaced the placeholder with the actual test key from the Stripe dashboard. The `/dev` slash command now reads `.env` and explicitly checks that `STRIPE_SECRET_KEY` is longer than 20 characters before giving the all-clear.

**Lesson:** Placeholder values in `.env` should be detected and blocked at setup time, not discovered at runtime.

---

### Failure 3: DATABASE_URL Port Change Broke Prisma
**What happened:** The user changed `DATABASE_URL` from port 27018 to port 27017 to use the default MongoDB instance. The agent did not proactively warn that port 27017 has no replica set. Prisma requires a replica set for `@unique` constraints (they use transactions), so all write operations failed silently.

**How caught:** `mongosh --port 27017` confirmed `rs.status()` returned "no replset config has been received". Prisma's writes threw replica-set errors.

**Fix:** Reverted `DATABASE_URL` to port 27018. The replica set requirement is now documented in CLAUDE.md as a critical architecture decision.

**Lesson:** The agent should have immediately warned when the user mentioned changing the database port. Infrastructure assumptions must be surfaced before the user acts on them.

---

### Failure 4: `refreshCart` Not Exposed from CartContext
**What happened:** `CartContext` defined `refreshCart` as an internal `useCallback` but did not include it in the `CartContextValue` interface or the provider's value object. The checkout success page needed to call it to reset the cart badge after order creation, but the property didn't exist on the context type.

**How caught:** TypeScript type error at the consumer — `Property 'refreshCart' does not exist on type 'CartContextValue'`.

**Fix:** Added `refreshCart: () => Promise<void>` to the interface and included it in the provider's value spread. The underlying implementation was already correct; only the exposure was missing.

**Lesson:** When writing context objects, define the complete public interface first, then implement. Methods defined but not exported are easy to miss.

---

### Failure 5: React StrictMode Double-Invocation
**What happened:** In development, the checkout success page called `POST /checkout/confirm` twice due to React 19 StrictMode's intentional double-invocation of effects. The first call created the order; the second either failed or (depending on timing) created a duplicate.

**How caught:** Browser Network tab showed two identical POST requests to `/checkout/confirm` on page load.

**Fix:** Added `const called = useRef(false)` guard before the API call inside `useEffect`. The backend's idempotency check (order lookup by `stripeSessionId`) provides a second layer of protection.

**Lesson:** In Next.js with React 19 (StrictMode on by default in dev), any `useEffect` side-effect that must run exactly once — especially payments/confirmations — needs a `useRef` guard. The agent should apply this pattern by default on such pages.

---

### Failure 6: Write Tool Used Without Prior Read
**What happened:** When asked to rewrite `Navbar.tsx`, the agent attempted `Write` without having read the file in the current session. The tool rejected the call with "File has not been read yet".

**How caught:** The tool itself returned an explicit error.

**Fix:** Read the file first, then wrote the replacement. No user data was lost, but it created an unnecessary retry cycle.

**Lesson:** This is a tool-level constraint (Write requires a prior Read in the same session context). It should be handled transparently; the retry is avoidable.

---

## 4. Supervision and Verification

The developer verified agent output before each commit:

- **Runtime testing** — browsed the actual UI after each feature (checkout flow, cart, orders, profile page) to confirm behaviour matched the request
- **Network inspection** — monitored browser DevTools Network tab to confirm API calls returned correct status codes and payloads
- **Database inspection** — used MongoDB Compass connected to `localhost:27018` to verify documents were created correctly in `orders`, `products`, `users` collections
- **Error screenshots** — when errors appeared, the developer shared screenshots with the agent rather than accepting agent-stated success blindly
- **Code review before committing** — all diffs were reviewed manually; the developer, not the agent, made all commits
- **TypeScript compilation** — `npx tsc --noEmit` run to catch type errors the agent introduced
- **Unit test runs** — `npm test` run after changes to verify all test suites pass
- **Negative constraint list** — each caught mistake was encoded into CLAUDE.md's "What NOT to Do" section so the same error could not recur in subsequent sessions

---

## 5. Design Workflow

The UI was designed entirely through natural-language direction to Claude Code. No external design tool (Figma, v0, etc.) was used.

**Developer-directed decisions:**
- Split-screen layout for auth pages (decorative left panel, form right)
- Frosted-glass sticky Navbar with clickable avatar dropdown
- Profile page showing member since date, role badge, and change-password form
- Admin vs customer role badge colour differentiation

**Agent-generated design decisions:**
- Blue-600 primary palette, gray-50 backgrounds, white cards with shadow
- Password strength meter (5 bar segments, red → yellow → green by length/complexity)
- Gradient header card on account page (avatar initials from email, role badge)
- Slide-in cart drawer with overlay backdrop
- Order status badge colour coding (PROCESSING=blue, SHIPPED=indigo, DELIVERED=green, CANCELLED=red)

**Tailwind v4 constraint:** Custom CSS class names defined in `globals.css` are not reliably applied in JSX components under Tailwind v4. Every style is written as inline utility classes directly on elements. This was identified early, documented in CLAUDE.md, and applied consistently — zero custom-class regressions after the rule was set.

**Iteration:** Most pages matched expectations on first pass. The Navbar dropdown required one follow-up edit to add click-outside-to-close behaviour (`useRef` + `document.addEventListener('mousedown')`).

---

## 6. Assumptions

| Area | Decision Made |
|------|--------------|
| MongoDB IDs | All entity IDs are 24-char hex ObjectIds. All DTOs use `@Matches(/^[a-f\d]{24}$/i)` — never `@IsUUID()`. |
| Stripe local dev | Webhooks can't reach localhost. Order creation goes through `POST /checkout/confirm` called by the success page. Idempotent — safe if webhook also fires later. |
| MongoDB port | Port 27017 (default service) has no replica set. Port 27018 with `--replSet rs0` is required for all Prisma `@unique` / transaction operations. |
| "Product suggestions" | Interpreted as co-purchase co-occurrence: rank products by frequency of appearing in the same orders, fall back to same-category products if purchase history is sparse. |
| Order initial status | Orders start as `PROCESSING` (not `PENDING`) because payment is confirmed at creation time via Stripe session verification. |
| Admin analytics | Dashboard shows: total revenue (excluding CANCELLED), total orders, breakdown by status, top 5 products by units sold, 10 most recent orders. |
| Cart | Server-side, per-user, persisted in MongoDB. No localStorage fallback. Guests cannot add to cart. |
| Password change | Requires current password verification. Returns HTTP 204 No Content on success. |
| JWT | 7-day expiry. No refresh token — user re-authenticates after expiry. |
| Image storage | Products use `imageUrl` string. No file upload implemented. |

---

## 7. Trade-offs and Scope

### Fully Built
- NestJS REST API: auth, products, cart, checkout, orders, admin (6 modules)
- Prisma schema: 6 models (User, Product, Cart, CartItem, Order, OrderItem)
- JWT auth with role-based guards (`JwtAuthGuard`, `RolesGuard`, `@Roles()`)
- Product catalog: search, category filter, price range, sort, pagination
- Server-side cart with compound-unique `(cartId, productId)` — increments quantity on duplicate add
- Stripe checkout (test mode): session creation → hosted checkout → success page confirm
- Order creation in a single `$transaction` with stock decrement and cart clear
- Customer order history with order detail view
- Admin panel: product CRUD, order management with status updates, analytics dashboard
- Avatar dropdown, profile/account page, change password with strength meter
- Product suggestions (co-purchase + category fallback, preserving ranking order)
- Unit tests: AuthService (3), ProductsService (5 including suggestions), OrdersService (4)
- Swagger docs at `/api/docs`
- `.claude` agentic setup: CLAUDE.md, 4 agents, 6 slash commands

### Simplified or Worked Around
- **Stripe webhooks:** replaced with manual `/checkout/confirm` endpoint — functionally equivalent for local dev; production would use webhooks as the primary path
- **Image upload:** product images use URLs; no multipart upload or cloud storage
- **Email notifications:** no order confirmation or shipping update emails
- **Admin orders pagination:** fetches all orders without pagination (acceptable for assessment scale)
- **Password reset:** no "forgot password" / email-based reset flow

### With More Time
- Stripe CLI integration to re-enable webhook handler already scaffolded in `handleWebhook()`
- E2E tests covering the full checkout flow (supertest is already configured)
- Product image upload (Multer + S3 or Cloudinary)
- Email notifications (Resend or SendGrid)
- Refresh token rotation for long-lived sessions
- Rate limiting on auth endpoints (`@nestjs/throttler`)
- Frontend tests with `@testing-library/react`
- GitHub Actions CI pipeline (tsc + unit tests + e2e on push)

---

## 8. Agent Session Transcripts

Claude Code stores full session transcripts as JSONL files. The log for this build is at:

```
C:\Users\Ahsan Mukhtar\.claude\projects\c--Users-Ahsan-Mukhtar-Desktop-Ahsan-e-commerce-assessment\a2b91626-7a97-4fcf-9a9b-f56534623c63.jsonl
```

This file contains every tool call, file read/write, bash command, agent message, and developer message exchanged — the complete record of how each feature was built and where corrections were made.

---

## 9. Technical Architecture Notes

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
