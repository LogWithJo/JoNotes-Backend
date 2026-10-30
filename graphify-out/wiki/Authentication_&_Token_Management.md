# Authentication & Token Management

> 28 nodes

## Key Concepts

- **auth.controller.ts** (36 connections) — `src/controller/auth.controller.ts`
- **refresh()** (10 connections) — `src/controller/auth.controller.ts`
- **issueTokens()** (9 connections) — `src/controller/auth.controller.ts`
- **continueAuth()** (8 connections) — `src/controller/auth.controller.ts`
- **clearAuthCookies()** (6 connections) — `src/controller/auth.controller.ts`
- **getAccessTokenCookieOptions()** (5 connections) — `src/controller/auth.controller.ts`
- **parseDurationToSeconds()** (5 connections) — `src/controller/auth.controller.ts`
- **setAuthCookies()** (5 connections) — `src/controller/auth.controller.ts`
- **login()** (4 connections) — `src/controller/auth.controller.ts`
- **logout()** (4 connections) — `src/controller/auth.controller.ts`
- **register()** (4 connections) — `src/controller/auth.controller.ts`
- **generateAccessToken()** (3 connections) — `src/controller/auth.controller.ts`
- **generateRefreshToken()** (3 connections) — `src/controller/auth.controller.ts`
- **getRefreshTokenCookieOptions()** (3 connections) — `src/controller/auth.controller.ts`
- **issueTokenAndRespond()** (3 connections) — `src/controller/auth.controller.ts`
- **saveRefreshToken()** (3 connections) — `src/controller/auth.controller.ts`
- **clearAuthCookie()** (2 connections) — `src/controller/auth.controller.ts`
- **getCookieOptions()** (2 connections) — `src/controller/auth.controller.ts`
- **normalizeEmail()** (2 connections) — `src/controller/auth.controller.ts`
- **validateEmailAndPassword()** (2 connections) — `src/controller/auth.controller.ts`
- **prisma** (1 connections) — `src/controller/auth.controller.ts`
- **Refresh Token Rotation** (1 connections) — `API_ENDPOINTS.md`
- **Auth Continue Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **Auth Login Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **Auth Logout Endpoint** (1 connections) — `API_ENDPOINTS.md`
- *... and 3 more nodes in this community*

## Relationships

- [Core API Routing & Middleware](Core_API_Routing_&_Middleware.md) (14 shared connections)
- [Runtime Configuration & Testing](Runtime_Configuration_&_Testing.md) (5 shared connections)
- [OAuth Services & Callbacks](OAuth_Services_&_Callbacks.md) (3 shared connections)
- [Package Dependencies & Tooling](Package_Dependencies_&_Tooling.md) (2 shared connections)
- [Notes CRUD & Pinning](Notes_CRUD_&_Pinning.md) (1 shared connections)

## Source Files

- `API_ENDPOINTS.md`
- `src/controller/auth.controller.ts`

## Audit Trail

- EXTRACTED: 64 (84%)
- INFERRED: 12 (16%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*