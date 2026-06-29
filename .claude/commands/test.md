---
description: Run backend unit tests with Jest. Optionally run with coverage or target a specific module.
---

Run the ShopHub backend test suite.

## Run All Tests
```bash
cd backend && npm test
```

## Run with Coverage Report
```bash
cd backend && npm run test:cov
```
Coverage HTML report: `backend/coverage/lcov-report/index.html`

## Run Tests for a Specific Module
Ask the user which module they want to test if not specified. Then run:
```bash
# Auth module
cd backend && npm test -- --testPathPattern=auth

# Products module
cd backend && npm test -- --testPathPattern=products

# Orders module
cd backend && npm test -- --testPathPattern=orders
```

## Run in Watch Mode (during development)
```bash
cd backend && npm run test:watch
```

## Run E2E Tests
```bash
cd backend && npm run test:e2e
```
Note: E2E tests require the backend to NOT be running on port 3001 (the test suite starts its own instance).

## Existing Test Files
- `backend/src/auth/auth.service.spec.ts` — auth service unit tests
- `backend/src/products/products.service.spec.ts` — products service unit tests
- `backend/src/orders/orders.service.spec.ts` — orders service unit tests
- `backend/test/app.e2e-spec.ts` — app E2E test
- `backend/test/auth.e2e-spec.ts` — auth E2E test

## After Running
Report clearly:
- Total tests: X passed, Y failed
- Which tests failed and the exact error
- Coverage percentages by module (if run with --coverage)
- Suggest fixes for any failures
