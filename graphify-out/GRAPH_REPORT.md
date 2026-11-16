# Graph Report - JoNotes-Back  (2026-11-16)

## Corpus Check
- 33 files · ~8,968 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 2, .map 2, .example 1)

## Summary
- 236 nodes · 405 edges · 14 communities (10 shown, 4 thin omitted)
- Extraction: 90% EXTRACTED · 10% INFERRED · 0% AMBIGUOUS · INFERRED: 40 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `d3d5a52c`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Package Dependencies & Tooling
- Authentication & Token Management
- TypeScript Compiler Configuration
- OAuth Services & Callbacks
- Feature Specification to Evaluate
- notes.controller.ts
- server.ts
- Biome Linter & Formatter Config
- graphify
- NPM Scripts & Build Pipeline
- Vercel Deployment Configuration
- Health Check Endpoint
- Note Deletion API
- Note Update API

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 23 edges
2. `refresh()` - 11 edges
3. `express` - 9 edges
4. `issueTokens()` - 9 edges
5. `scripts` - 8 edges
6. `continueAuth()` - 8 edges
7. `dotenv` - 7 edges
8. `handleGoogleCallback()` - 7 edges
9. `handleGitHubCallback()` - 7 edges
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
- `Auth Logout Endpoint` --implements--> `logout()`  [INFERRED]
  API_ENDPOINTS.md → src/controller/auth.controller.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Authentication and Token Lifecycle Flow** — api_endpoints_auth_continue, api_endpoints_auth_refresh, api_endpoints_auth_logout, api_endpoints_jwt_auth_mechanism [INFERRED 0.85]
- **Notes Management CRUD Lifecycle** — api_endpoints_notes_create, api_endpoints_notes_list, api_endpoints_notes_update, api_endpoints_notes_delete [INFERRED 0.85]

## Communities (14 total, 4 thin omitted)

### Community 0 - "Package Dependencies & Tooling"
Cohesion: 0.06
Nodes (42): author, dependencies, bcrypt@^6.0.0, @biomejs/biome@^2.5.12, cookie-parser@^1.4.7, cors@^2.8.6, dotenv@^17.4.2, prisma@^6.19.3 (+34 more)

### Community 1 - "Authentication & Token Management"
Cohesion: 0.12
Nodes (29): Auth Continue Endpoint, Auth Login Endpoint, Auth Logout Endpoint, Auth Refresh Token Endpoint, Auth Register Endpoint, Auth Revoke Token Endpoint, Refresh Token Rotation, clearAuthCookie() (+21 more)

### Community 2 - "TypeScript Compiler Configuration"
Cohesion: 0.08
Nodes (25): compilerOptions, allowSyntheticDefaultImports, declaration, declarationMap, esModuleInterop, exactOptionalPropertyTypes, forceConsistentCasingInFileNames, isolatedModules (+17 more)

### Community 3 - "OAuth Services & Callbacks"
Cohesion: 0.15
Nodes (21): axios@^1.20.0, express@^5.2.1, axios, express, getPrimaryFrontendUrl(), handleGitHubCallback(), handleGoogleCallback(), redirectToGitHub() (+13 more)

### Community 4 - "Feature Specification to Evaluate"
Cohesion: 0.29
Nodes (6): Critical Guardrails & Constraints (MUST FOLLOW), Endpoint 1: Offset pagination, Endpoint 2: Cursor pagination, Feature Specification to Evaluate, Requirements, Resource

### Community 5 - "notes.controller.ts"
Cohesion: 0.12
Nodes (30): Notes Create Endpoint, Notes Query Delete Endpoint, Notes Get By ID Endpoint, Notes List Endpoint, Notes Toggle Pin Endpoint, Notes Query Update Endpoint, Pinned Note Limit Rule, createNote() (+22 more)

### Community 6 - "server.ts"
Cohesion: 0.09
Nodes (22): Auth Profile (Me) Endpoint, JWT Bearer Authentication, jsonwebtoken@^9.0.3, prisma, userId, jsonwebtoken, buildRuntimeConfig(), localDevelopmentOrigins (+14 more)

### Community 7 - "Biome Linter & Formatter Config"
Cohesion: 0.18
Nodes (10): files, includes, formatter, enabled, indentStyle, linter, enabled, rules (+2 more)

### Community 9 - "NPM Scripts & Build Pipeline"
Cohesion: 0.25
Nodes (8): scripts, build, dev, postinstall, prestart, seed:pagination-notes, start, test

### Community 10 - "Vercel Deployment Configuration"
Cohesion: 0.50
Nodes (3): builds, rewrites, version

## Knowledge Gaps
- **19 isolated node(s):** `Refresh Token Rotation`, `Auth Continue Endpoint`, `Auth Login Endpoint`, `Auth Logout Endpoint`, `Auth Refresh Token Endpoint` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 101 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `express` connect `OAuth Services & Callbacks` to `Package Dependencies & Tooling`, `Authentication & Token Management`, `notes.controller.ts`, `server.ts`?**
  _High betweenness centrality (0.150) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `refresh()` (e.g. with `Auth Refresh Token Endpoint` and `Refresh Token Rotation`) actually correct?**
  _`refresh()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `Refresh Token Rotation`, `Auth Continue Endpoint`, `Auth Login Endpoint` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Package Dependencies & Tooling` be split into smaller, more focused modules?**
  _Cohesion score 0.05920444033302498 - nodes in this community are weakly interconnected._
- **Why does `scripts` connect `NPM Scripts & Build Pipeline` to `Package Dependencies & Tooling`?**
  _High betweenness centrality (0.045) - this node is a cross-community bridge._
- **Should `Authentication & Token Management` be split into smaller, more focused modules?**
  _Cohesion score 0.12473118279569892 - nodes in this community are weakly interconnected._
- **Why does `dotenv` connect `Package Dependencies & Tooling` to `server.ts`?**
  _High betweenness centrality (0.044) - this node is a cross-community bridge._