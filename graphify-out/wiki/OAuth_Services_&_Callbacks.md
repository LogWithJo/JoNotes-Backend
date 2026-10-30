# OAuth Services & Callbacks

> 19 nodes

## Key Concepts

- **oauth.controller.ts** (19 connections) — `src/controller/oauth.controller.ts`
- **handleGitHubCallback()** (7 connections) — `src/controller/oauth.controller.ts`
- **handleGoogleCallback()** (7 connections) — `src/controller/oauth.controller.ts`
- **github.ts** (7 connections) — `src/services/oauth/github.ts`
- **google.ts** (6 connections) — `src/services/oauth/google.ts`
- **getPrimaryFrontendUrl()** (4 connections) — `src/config/runtime.ts`
- **setTokenCookies()** (4 connections) — `src/controller/oauth.controller.ts`
- **findOrCreateUserFromOAuth()** (4 connections) — `src/services/oauth/account-linking.ts`
- **axios** (4 connections) — `package.json`
- **exchangeGitHubCode()** (3 connections) — `src/services/oauth/github.ts`
- **fetchGitHubUser()** (3 connections) — `src/services/oauth/github.ts`
- **exchangeGoogleCode()** (3 connections) — `src/services/oauth/google.ts`
- **fetchGoogleProfile()** (3 connections) — `src/services/oauth/google.ts`
- **axios@^1.20.0** (2 connections) — `package.json`
- **GitHubEmail** (1 connections) — `src/services/oauth/github.ts`
- **GitHubTokenResponse** (1 connections) — `src/services/oauth/github.ts`
- **GitHubUser** (1 connections) — `src/services/oauth/github.ts`
- **GoogleProfile** (1 connections) — `src/services/oauth/google.ts`
- **GoogleTokenResponse** (1 connections) — `src/services/oauth/google.ts`

## Relationships

- [Core API Routing & Middleware](Core_API_Routing_&_Middleware.md) (6 shared connections)
- [Runtime Configuration & Testing](Runtime_Configuration_&_Testing.md) (4 shared connections)
- [Authentication & Token Management](Authentication_&_Token_Management.md) (3 shared connections)
- [Package Dependencies & Tooling](Package_Dependencies_&_Tooling.md) (2 shared connections)

## Source Files

- `package.json`
- `src/config/runtime.ts`
- `src/controller/oauth.controller.ts`
- `src/services/oauth/account-linking.ts`
- `src/services/oauth/github.ts`
- `src/services/oauth/google.ts`

## Audit Trail

- EXTRACTED: 46 (96%)
- INFERRED: 2 (4%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*