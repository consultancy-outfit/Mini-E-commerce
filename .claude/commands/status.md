---
description: Check health of all services — MongoDB (27018), backend (3001), frontend (3000)
---

Check whether all three required services are running for the ShopHub project. Run these checks and report clearly.

1. Run `netstat -ano | findstr :27018` — MongoDB status
2. Run `netstat -ano | findstr :3001` — Backend API status
3. Run `netstat -ano | findstr :3000` — Frontend status

Report the result in this format:

```
SERVICE STATUS
─────────────────────────────────────────
MongoDB   (port 27018)  ✅ RUNNING  /  ❌ STOPPED
Backend   (port 3001)   ✅ RUNNING  /  ❌ STOPPED
Frontend  (port 3000)   ✅ RUNNING  /  ❌ STOPPED
```

For each STOPPED service, show the exact command to start it:

**MongoDB (start first — others depend on it):**
```bash
mongod --port 27018 --dbpath C:\data\db27018 --replSet rs0
```

**Backend (new terminal in backend/ folder):**
```bash
cd backend && npm run start:dev
```

**Frontend (new terminal in frontend/ folder):**
```bash
cd frontend && npm run dev
```

If all services are running, show these quick-access URLs:
- Frontend:    http://localhost:3000
- Admin Panel: http://localhost:3000/admin
- Backend API: http://localhost:3001/api
- Swagger:     http://localhost:3001/api/docs

Also remind: MongoDB Compass should connect to `mongodb://localhost:27018` (not 27017) to see the ecommerce_db data.
