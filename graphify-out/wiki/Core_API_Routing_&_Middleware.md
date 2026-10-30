# Core API Routing & Middleware

> 18 nodes

## Key Concepts

- **server.ts** (20 connections) — `src/server.ts`
- **auth.routes.ts** (18 connections) — `src/routes/auth.routes.ts`
- **requireAuth.ts** (14 connections) — `src/middleware/requireAuth.ts`
- **express** (9 connections) — `package.json`
- **revokeToken()** (5 connections) — `src/controller/auth.controller.ts`
- **requireAuth()** (5 connections) — `src/middleware/requireAuth.ts`
- **runtimeConfig** (4 connections) — `src/config/runtime.ts`
- **getMe()** (4 connections) — `src/controller/auth.controller.ts`
- **redirectToGitHub()** (2 connections) — `src/controller/oauth.controller.ts`
- **redirectToGoogle()** (2 connections) — `src/controller/oauth.controller.ts`
- **express@^5.2.1** (2 connections) — `package.json`
- **router** (2 connections) — `src/routes/auth.routes.ts`
- **startServer()** (1 connections) — `src/server.ts`
- **prisma** (1 connections) — `src/middleware/requireAuth.ts`
- **JWT Bearer Authentication** (1 connections) — `API_ENDPOINTS.md`
- **Auth Profile (Me) Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **Auth Revoke Token Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **ref_node_url** (1 connections)

## Relationships

- [Authentication & Token Management](Authentication_&_Token_Management.md) (14 shared connections)
- [Notes CRUD & Pinning](Notes_CRUD_&_Pinning.md) (8 shared connections)
- [Runtime Configuration & Testing](Runtime_Configuration_&_Testing.md) (7 shared connections)
- [OAuth Services & Callbacks](OAuth_Services_&_Callbacks.md) (6 shared connections)
- [Package Dependencies & Tooling](Package_Dependencies_&_Tooling.md) (5 shared connections)
- [Prisma ORM & Database Config](Prisma_ORM_&_Database_Config.md) (1 shared connections)

## Source Files

- `API_ENDPOINTS.md`
- `package.json`
- `src/config/runtime.ts`
- `src/controller/auth.controller.ts`
- `src/controller/oauth.controller.ts`
- `src/middleware/requireAuth.ts`
- `src/routes/auth.routes.ts`
- `src/server.ts`

## Audit Trail

- EXTRACTED: 47 (70%)
- INFERRED: 20 (30%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*