# Notes CRUD & Pinning

> 18 nodes

## Key Concepts

- **notes.controller.ts** (13 connections) — `src/controller/notes.controller.ts`
- **notes.routes.ts** (12 connections) — `src/routes/notes.routes.ts`
- **togglePin()** (4 connections) — `src/controller/notes.controller.ts`
- **AuthRequest** (3 connections) — `src/middleware/requireAuth.ts`
- **createNote()** (3 connections) — `src/controller/notes.controller.ts`
- **deleteNote()** (3 connections) — `src/controller/notes.controller.ts`
- **getNoteById()** (3 connections) — `src/controller/notes.controller.ts`
- **getNotes()** (3 connections) — `src/controller/notes.controller.ts`
- **updateNote()** (3 connections) — `src/controller/notes.controller.ts`
- **router** (2 connections) — `src/routes/notes.routes.ts`
- **prisma** (1 connections) — `src/controller/notes.controller.ts`
- **Pinned Note Limit Rule** (1 connections) — `API_ENDPOINTS.md`
- **Notes Create Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **Notes Query Delete Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **Notes Get By ID Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **Notes List Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **Notes Toggle Pin Endpoint** (1 connections) — `API_ENDPOINTS.md`
- **Notes Query Update Endpoint** (1 connections) — `API_ENDPOINTS.md`

## Relationships

- [Core API Routing & Middleware](Core_API_Routing_&_Middleware.md) (8 shared connections)
- [Runtime Configuration & Testing](Runtime_Configuration_&_Testing.md) (2 shared connections)
- [Authentication & Token Management](Authentication_&_Token_Management.md) (1 shared connections)

## Source Files

- `API_ENDPOINTS.md`
- `src/controller/notes.controller.ts`
- `src/middleware/requireAuth.ts`
- `src/routes/notes.routes.ts`

## Audit Trail

- EXTRACTED: 20 (59%)
- INFERRED: 14 (41%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*