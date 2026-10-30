# JoNotes Backend API Endpoints

This document describes the API exposed by the backend server.

## Base URL

- Local development: `http://localhost:3000`
- The server also exposes a health check at `/`

## Authentication

Most note-related routes require a JWT token sent in the `Authorization` header:

```http
Authorization: Bearer <token>
```

Tokens are issued by the authentication endpoints and validated by the `requireAuth` middleware.

---

## 1) Health Check

### `GET /`

Returns a simple server status response.

**Response**

```json
{
  "message": "Server is alive!"
}
```

**Status codes**
- `200 OK`

---

## 2) Authentication Routes

Base route: `/auth`

### `POST /auth/continue`

Creates or logs in a user using email/password flow.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Behavior**
- Normalizes and validates the email.
- Requires password length between 8 and 128 characters.
- If the user does not exist, it creates a new account.
- If the user exists, it verifies the password.
- Returns a JWT token and user profile.

**Success response**

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": null,
    "avatar": null
  }
}
```

**Status codes**
- `200 OK` when an existing user logs in successfully
- `201 Created` when a new user is created
- `400 Bad Request` for invalid input
- `401 Unauthorized` for wrong credentials
- `500 Internal Server Error` for server-side auth issues

### `POST /auth/register`

Alias of `/auth/continue`.

### `POST /auth/login`

Alias of `/auth/continue`.

---

## 3) Notes Routes

Base route: `/notes`

All routes under `/notes` require authentication unless otherwise noted.

### `GET /notes`

Gets all notes for the authenticated user.

**Query parameters**
- `category`: filter by note category (for example `general` or `work`)
- `search`: text search against note title/content
- `sort`: sorting options:
  - `oldest`
  - `az`
  - `za`
  - default: newest first
- `id`: fetch a single note by its numeric note ID

**Example**

```http
GET /notes?category=work&search=meeting&sort=az
```

**Success response**

```json
[
  {
    "id": 1,
    "title": "Project ideas",
    "category": "work",
    "content": "Talk about roadmap",
    "userId": 42,
    "isPin": false,
    "createdAt": "2026-10-05T12:00:00.000Z",
    "updatedAt": "2026-10-05T12:00:00.000Z"
  }
]
```

**Status codes**
- `200 OK`
- `400 Bad Request` for invalid `id` query value
- `401 Unauthorized` when no valid token is provided
- `404 Not Found` when a requested note by `id` does not exist

### `POST /notes`

Creates a note for the authenticated user.

**Request body**

```json
{
  "title": "Meeting notes",
  "category": "work",
  "content": "Discuss launch timeline"
}
```

**Validation**
- `title` is required
- `category` is required
- `content` defaults to an empty string if missing

**Success response**

```json
{
  "id": 2,
  "title": "Meeting notes",
  "category": "work",
  "content": "Discuss launch timeline",
  "userId": 42,
  "isPin": false,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-05T12:00:00.000Z"
}
```

**Status codes**
- `201 Created`
- `400 Bad Request` for missing title/category
- `401 Unauthorized`

### `PATCH /notes`

Updates a note by `id` passed in the query string.

**Query parameters**
- `id`: required numeric note id

**Request body**

```json
{
  "title": "Updated title",
  "content": "Updated content",
  "category": "personal"
}
```

**Success response**

```json
{
  "id": 2,
  "title": "Updated title",
  "category": "personal",
  "content": "Updated content",
  "userId": 42,
  "isPin": false,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-05T12:05:00.000Z"
}
```

**Status codes**
- `200 OK`
- `400 Bad Request` for missing/invalid note id
- `401 Unauthorized`
- `404 Not Found`

### `DELETE /notes`

Deletes a note by `id` passed in the query string.

**Query parameters**
- `id`: required numeric note id

**Success response**

```json
{
  "success": true
}
```

**Status codes**
- `200 OK`
- `400 Bad Request` for missing/invalid note id
- `401 Unauthorized`
- `404 Not Found`

### `GET /notes/:id`

Gets a single note by its ID for the authenticated user.

**Example**

```http
GET /notes/12
```

**Success response**

```json
{
  "id": 12,
  "title": "Daily journal",
  "category": "personal",
  "content": "Notes for today",
  "userId": 42,
  "isPin": false,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-05T12:00:00.000Z"
}
```

**Status codes**
- `200 OK`
- `401 Unauthorized`
- `404 Not Found`

### `PATCH /notes/:id`

Updates a single note by path parameter ID.

**Request body**

```json
{
  "title": "New title",
  "content": "New content",
  "category": "work"
}
```

**Status codes**
- `200 OK`
- `401 Unauthorized`
- `404 Not Found`
- `400 Bad Request` when the ID is invalid

### `DELETE /notes/:id`

Deletes a single note by path parameter ID.

**Success response**

```json
{
  "success": true
}
```

**Status codes**
- `200 OK`
- `401 Unauthorized`
- `404 Not Found`
- `400 Bad Request` when the ID is invalid

### `PATCH /notes/:id/pin`

Toggles the pin state of a note.

**Behavior**
- If the note is not pinned, the server checks the user’s pinned note limit.
- A user can pin up to 3 notes.
- If they already have 3 pinned notes, the request fails with a conflict error.

**Success response**

```json
{
  "id": 7,
  "title": "Pinned note",
  "category": "ideas",
  "content": "Important reminder",
  "userId": 42,
  "isPin": true,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-05T12:10:00.000Z"
}
```

**Status codes**
- `200 OK`
- `401 Unauthorized`
- `404 Not Found`
- `409 Conflict` when pin limit is exceeded

---

## Notes on API Design

- The project uses Express with JSON request bodies.
- Cross-origin requests are allowed only from `http://localhost:1999` in development.
- All note routes depend on a valid bearer token.
- Authentication and note management are implemented in dedicated controller files under `src/controller`.

## Relevant Files

- `src/server.ts`
- `src/routes/auth.routes.ts`
- `src/routes/notes.routes.ts`
- `src/controller/auth.controller.ts`
- `src/controller/notes.controller.ts`
- `src/middleware/requireAuth.ts`
