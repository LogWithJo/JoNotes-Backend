# Graph Report - JoNotes-Back  (2026-10-30)

## Corpus Check
- 24 files · ~6,232 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .map 2, .example 1)

## Summary
- 199 nodes · 324 edges · 12 communities (9 shown, 3 thin omitted)
- Extraction: 88% EXTRACTED · 12% INFERRED · 0% AMBIGUOUS · INFERRED: 39 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `b9739e00`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Package Dependencies & Tooling
- Authentication & Token Management
- TypeScript Compiler Configuration
- OAuth Services & Callbacks
- Notes CRUD & Pinning
- Runtime Configuration & Testing
- Biome Linter & Formatter Config
- NPM Scripts & Build Pipeline
- Vercel Deployment Configuration
- Health Check Endpoint
- Note Deletion API
- Note Update API

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 23 edges
2. `refresh()` - 10 edges
3. `express` - 9 edges
4. `issueTokens()` - 9 edges
5. `continueAuth()` - 8 edges
6. `scripts` - 7 edges
7. `handleGoogleCallback()` - 7 edges
8. `handleGitHubCallback()` - 7 edges
9. `dotenv` - 6 edges
10. `clearAuthCookies()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `Auth Continue Endpoint` --implements--> `continueAuth()`  [INFERRED]
  API_ENDPOINTS.md → src/controller/auth.controller.ts
- `Auth Refresh Token Endpoint` --implements--> `refresh()`  [INFERRED]
  API_ENDPOINTS.md → src/controller/auth.controller.ts
- `Refresh Token Rotation` --conceptually_related_to--> `refresh()`  [INFERRED]
  API_ENDPOINTS.md → src/controller/auth.controller.ts
- `Auth Revoke Token Endpoint` --implements--> `revokeToken()`  [INFERRED]
  API_ENDPOINTS.md → src/controller/auth.controller.ts
- `JWT Bearer Authentication` --implements--> `requireAuth()`  [INFERRED]
  API_ENDPOINTS.md → src/middleware/requireAuth.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication and Token Lifecycle Flow** — api_endpoints_auth_continue, api_endpoints_auth_refresh, api_endpoints_auth_logout, api_endpoints_jwt_auth_mechanism [INFERRED 0.85]
- **Notes Management CRUD Lifecycle** — api_endpoints_notes_create, api_endpoints_notes_list, api_endpoints_notes_update, api_endpoints_notes_delete [INFERRED 0.85]

## Communities (12 total, 3 thin omitted)

### Community 0 - "Package Dependencies & Tooling"
Cohesion: 0.06
Nodes (44): author, dependencies, bcrypt@^6.0.0, @biomejs/biome@^2.5.12, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.2, jsonwebtoken@^9.0.3 (+36 more)

### Community 1 - "Authentication & Token Management"
Cohesion: 0.12
Nodes (30): Auth Continue Endpoint, Auth Login Endpoint, Auth Logout Endpoint, Auth Profile (Me) Endpoint, Auth Refresh Token Endpoint, Auth Register Endpoint, Auth Revoke Token Endpoint, Refresh Token Rotation (+22 more)

### Community 2 - "TypeScript Compiler Configuration"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames, isolatedModules (+17 more)

### Community 3 - "OAuth Services & Callbacks"
Cohesion: 0.17
Nodes (18): axios@^1.20.0, axios, getPrimaryFrontendUrl(), handleGitHubCallback(), handleGoogleCallback(), redirectToGitHub(), redirectToGoogle(), setTokenCookies() (+10 more)

### Community 5 - "Notes CRUD & Pinning"
Cohesion: 0.14
Nodes (18): Notes Create Endpoint, Notes Query Delete Endpoint, Notes Get By ID Endpoint, Notes List Endpoint, Notes Toggle Pin Endpoint, Notes Query Update Endpoint, Pinned Note Limit Rule, express@^5.2.1 (+10 more)

### Community 6 - "Runtime Configuration & Testing"
Cohesion: 0.12
Nodes (12): JWT Bearer Authentication, buildRuntimeConfig(), parseAllowedOrigins(), runtimeConfig, RuntimeEnv, prisma, prisma, requireAuth() (+4 more)

### Community 7 - "Biome Linter & Formatter Config"
Cohesion: 0.18
Nodes (10): files, includes, formatter, enabled, indentStyle, linter, enabled, rules (+2 more)

### Community 9 - "NPM Scripts & Build Pipeline"
Cohesion: 0.29
Nodes (7): scripts, build, dev, postinstall, prestart, start, test

### Community 10 - "Vercel Deployment Configuration"
Cohesion: 0.50
Nodes (3): builds, routes, version

## Knowledge Gaps
- **19 isolated node(s):** `Refresh Token Rotation`, `Auth Continue Endpoint`, `Auth Login Endpoint`, `Auth Logout Endpoint`, `Auth Refresh Token Endpoint` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 84 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `Notes CRUD & Pinning` to `Package Dependencies & Tooling`, `Authentication & Token Management`, `OAuth Services & Callbacks`, `Runtime Configuration & Testing`?**
  _High betweenness centrality (0.146) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `refresh()` (e.g. with `Auth Refresh Token Endpoint` and `Refresh Token Rotation`) actually correct?**
  _`refresh()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Refresh Token Rotation`, `Auth Continue Endpoint`, `Auth Login Endpoint` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Package Dependencies & Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.05697278911564626 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `NPM Scripts & Build Pipeline` to `Package Dependencies & Tooling`?**
  _High betweenness centrality (0.046) - this node is a cross-community bridge._
- **Should `Authentication & Token Management` be split into smaller, more focused modules?**
  _Cohesion score 0.12121212121212122 - nodes in this community are weakly interconnected._
- **Why does `dotenv` connect `Package Dependencies & Tooling` to `Runtime Configuration & Testing`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._