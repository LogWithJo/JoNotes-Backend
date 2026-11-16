Task: Safely Evaluate & Plan Pagination Implementation

You are acting as a Senior Backend Engineer. Your task is to evaluate whether the pagination specification below (`AGENTS.md: Pagination rules`) fits into our current codebase, and if so, plan a strictly additive, zero-regression implementation.

## Critical Guardrails & Constraints (MUST FOLLOW)

1. **Audit Before Acting (Read-Only First):** Do NOT write, edit, delete, or generate any code or files yet. First, inspect the existing project structure, database schema/ORM, routing, middleware, error-handling patterns, and existing tests.
2. **Feasibility & Fit Decision:** Do not blindly follow the specification. Evaluate the specification against our actual codebase architecture and current needs:
   - Check if our current database/ORM supports composite descending indexes `(createdAt DESC, id DESC)` and tuple/keyset comparison for cursor pagination.
   - Check if `GET /notes` already exists. If it does, assess whether adding pagination breaks existing front-end consumers or tests.
   - Explicitly tell me whether this feature _should_ be implemented as-is, adapted to match our existing patterns, or rejected/deferred—and explain why.
3. **Zero Regression & No Unrequested Refactors:**
   - Do NOT modify, rename, or refactor existing working routes, services, schemas, or business logic unless strictly required for integration.
   - All changes must be strictly additive and isolated to the new pagination requirements.
   - Follow our existing codebase conventions (folder structure, validation library, error response format, TypeScript types) rather than inventing new patterns.
4. **No Silent Defaults / No `undefined` Fallbacks:**
   - Do NOT silently coerce missing, `undefined`, or malformed values into default values when validation or configuration is ambiguous.
   - Only apply explicit defaults where explicitly specified in the rules (`page = 1`, `limit = 10` when omitted). If an environment variable, schema field, database connection, or edge-case input is `undefined` or unclear, fail explicitly or ask me—never mask `undefined` with silent fallback defaults.
5. **Mandatory Stop & Ask Before Execution:**
   - After analyzing the codebase, present:
     1. Your **Architectural Assessment** (compatibility, conflicts with existing `GET /notes` or CORS setup, and your recommendation).
     2. Any **Ambiguities or `undefined` Edge Cases** you found (e.g., what happens if `limit=""` vs omitted, existing CORS config conflicts, ORM query limitations).
     3. A **Step-by-Step Implementation Plan** listing the exact files to be created or touched.
   - **STOP there and ask for my explicit approval and answers to your questions before making any code changes.**

---

## Feature Specification to Evaluate

### Resource

`Note`: `notetype`

### Endpoint 1: Offset pagination

`GET /notes?page=1&limit=10`

- `page` starts at 1. Default 1. `limit` default 10, max 50.
- Sort: `createdAt DESC`, then `id DESC` (tiebreaker).
- Response (200):
  `{ "items": Note[], "total": number, "page": number, "limit": number, "totalPages": number }`
- Invalid page/limit: return 400 with `{ "error": string }`.
- Page beyond the last: return empty items, not an error.

### Endpoint 2: Cursor pagination

`GET /notes/feed?cursor=<opaque string>&limit=10`

- `cursor` is optional. Missing cursor means first page.
- Sort: `createdAt DESC`, then `id DESC`. The cursor encodes BOTH values (base64 of JSON), so ties in `createdAt` cannot skip or duplicate rows.
- Fetch `limit + 1` rows to detect whether another page exists, then trim to `limit`.
- Response (200):
  `{ "items": Note[], "nextCursor": string | null }`
- `nextCursor` is `null` when there are no more items.
- Do NOT return `total`. Do NOT use `OFFSET` in the SQL.
- Invalid cursor: return 400.

### Requirements

- Write tests for: first page, last page, empty result, invalid input.
