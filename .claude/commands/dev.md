---
description: Show how to start all development servers with environment pre-checks
---

Guide the developer through starting the full ShopHub development environment. Do pre-checks first, then give precise startup instructions.

## Step 1 — Check MongoDB on port 27018
Run: `netstat -ano | findstr :27018`

If NOT running, show this warning and command:
```
⚠️  MongoDB is not running. Start it first (other services depend on it):

mongod --port 27018 --dbpath C:\data\db27018 --replSet rs0

Run that in a dedicated terminal and leave it open.
The replica set initialisation (rs.initiate()) only needs to be done once ever.
```

## Step 2 — Verify backend .env
Read `backend/.env` and confirm these critical values are set (not placeholder):
- `DATABASE_URL` contains `27018` (not 27017)
- `JWT_SECRET` is not empty
- `STRIPE_SECRET_KEY` starts with `sk_test_` and is longer than 20 chars

If any are wrong, point out exactly which line to fix.

## Step 3 — Verify frontend .env.local
Read `frontend/.env.local` and confirm:
- `NEXT_PUBLIC_API_URL=http://localhost:3001/api`

## Step 4 — Startup commands

Tell the developer to open **3 separate terminals**:

**Terminal 1 — MongoDB** (if not already running):
```bash
mongod --port 27018 --dbpath C:\data\db27018 --replSet rs0
```

**Terminal 2 — Backend:**
```bash
cd backend
npm run start:dev
# Starts on http://localhost:3001/api
# Swagger: http://localhost:3001/api/docs
```

**Terminal 3 — Frontend:**
```bash
cd frontend
npm run dev
# Starts on http://localhost:3000
```

## Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shophub.com | Admin1234! |
| Customer | customer@shophub.com | Customer1234! |

**Stripe test card:** `4242 4242 4242 4242` · any future date · any CVC

## MongoDB Compass
Connect to `mongodb://localhost:27018` to browse data in the `ecommerce_db` database.
