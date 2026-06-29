---
description: Re-seed the database with 22 products and 2 test users (safe — uses upsert, won't duplicate)
---

Re-seed the ShopHub ecommerce_db database.

## Pre-check
First verify MongoDB is running on port 27018:
Run: `netstat -ano | findstr :27018`

If nothing returned, tell the user:
```
MongoDB is not running. Start it first:
mongod --port 27018 --dbpath C:\data\db27018 --replSet rs0
```

## Run Seed
```bash
cd backend && npm run db:seed
```

The seed script (`backend/prisma/seed.ts`) uses upsert operations — it's safe to run multiple times without duplicating data.

## What Gets Created

**Products (22 total across 6 categories):**
- Electronics: wireless headphones, smart watch, mechanical keyboard, webcam, USB hub, portable charger
- Clothing: running shoes, leather wallet, sunglasses, winter jacket, yoga pants
- Books: Clean Code, Atomic Habits, System Design interview, JavaScript definitive guide
- Kitchen: cast iron skillet, coffee grinder, bamboo cutting board, french press
- Sports: yoga mat, resistance bands
- Home Decor: smart LED strip, aromatherapy diffuser

**Users:**
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@shophub.com | Admin1234! |
| Customer | customer@shophub.com | Customer1234! |

## Full Reset (⚠️ DESTRUCTIVE)
If you need to wipe all data (orders, carts, custom products) and start fresh:
```bash
cd backend && npm run db:reset
```
**Warning:** This permanently deletes ALL data including any orders placed during testing.

## Verify in Compass
After seeding, connect MongoDB Compass to `mongodb://localhost:27018`:
- `ecommerce_db` → `products` should show 22 documents
- `ecommerce_db` → `users` should show 2 documents
