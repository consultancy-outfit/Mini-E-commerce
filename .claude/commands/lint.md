---
description: Lint and auto-fix both backend (ESLint + Prettier) and frontend (ESLint), then TypeScript type-check both
---

Run linting, formatting, and type-checking across the entire ShopHub project.

## Backend — ESLint (auto-fix)
```bash
cd backend && npm run lint
```
Runs ESLint with `--fix` on all `src/**/*.ts` files.

## Backend — Prettier (format)
```bash
cd backend && npm run format
```
Formats all `src/**/*.ts` and `test/**/*.ts` files.

## Frontend — ESLint
```bash
cd frontend && npm run lint
```

## TypeScript Type Check — Backend
```bash
cd backend && npx tsc --noEmit
```

## TypeScript Type Check — Frontend
```bash
cd frontend && npx tsc --noEmit
```

## All-in-one sequence (run these in order)
```bash
cd backend && npm run lint && npm run format
cd frontend && npm run lint
cd backend && npx tsc --noEmit
cd frontend && npx tsc --noEmit
```

## After Running
- List any ESLint errors that couldn't be auto-fixed (these need manual fixes)
- List any TypeScript errors with the file path and line number
- For each error, suggest the specific fix
- If everything passes, confirm with "✅ All checks passed"

## Common Issues in This Project
- Tailwind v4: Do not add custom CSS class names to JSX (unreliable)
- MongoDB IDs: Use `@Matches(/^[a-f\d]{24}$/i)` not `@IsUUID()` in DTOs
- `any` types: Replace with proper interface or `unknown` + type guard
