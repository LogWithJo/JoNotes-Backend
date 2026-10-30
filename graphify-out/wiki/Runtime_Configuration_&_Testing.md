# Runtime Configuration & Testing

> 16 nodes

## Key Concepts

- **runtime.ts** (10 connections) — `src/config/runtime.ts`
- **auth.controller.test.ts** (10 connections) — `src/controller/auth.controller.test.ts`
- **account-linking.ts** (6 connections) — `src/services/oauth/account-linking.ts`
- **runtime.test.ts** (5 connections) — `src/config/runtime.test.ts`
- **src_generated_prisma_client** (5 connections)
- **src_generated_prisma_client_prismaclient** (5 connections)
- **buildRuntimeConfig()** (3 connections) — `src/config/runtime.ts`
- **parseAllowedOrigins()** (3 connections) — `src/config/runtime.ts`
- **app** (2 connections) — `src/server.ts`
- **ref_node_assert** (2 connections)
- **ref_node_test** (2 connections)
- **RuntimeEnv** (1 connections) — `src/config/runtime.ts`
- **OAuthProfile** (1 connections) — `src/services/oauth/account-linking.ts`
- **prisma** (1 connections) — `src/controller/auth.controller.test.ts`
- **prisma** (1 connections) — `src/services/oauth/account-linking.ts`
- **ref_node_net** (1 connections)

## Relationships

- [Core API Routing & Middleware](Core_API_Routing_&_Middleware.md) (7 shared connections)
- [Authentication & Token Management](Authentication_&_Token_Management.md) (5 shared connections)
- [OAuth Services & Callbacks](OAuth_Services_&_Callbacks.md) (4 shared connections)
- [Notes CRUD & Pinning](Notes_CRUD_&_Pinning.md) (2 shared connections)

## Source Files

- `src/config/runtime.test.ts`
- `src/config/runtime.ts`
- `src/controller/auth.controller.test.ts`
- `src/server.ts`
- `src/services/oauth/account-linking.ts`

## Audit Trail

- EXTRACTED: 38 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*