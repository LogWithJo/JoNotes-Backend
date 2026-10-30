# JoNotes Backend API Endpoints

This document describes the current backend API implemented by the project.

## Base URL

- Local development: `http://localhost:3000`

## Authentication model

Protected routes accept a JWT in either of these ways:

- `Authorization: Bearer <access_token>`
- HTTP-only cookies: `token`, `accessToken`, and `refreshToken`

The server validates access tokens through the `requireAuth` middleware. Refresh tokens are stored in the database and can be rotated or revoked.

---

## 1) Health and status

### `GET /`

Returns a basic server status payload.

**Response**

```json
{
  "message": "Server is alive!"
}
```

**Status codes**
- `200 OK`

### `GET /health`

Returns a lightweight service health response.

**Response**

```json
{
  "ok": true,
  "environment": "development"
}
```

**Status codes**
- `200 OK`

---

## 2) Authentication routes

Base route: `/auth`

### `POST /auth/continue`

Creates a user or logs in an existing user using email/password. This is the main credential-based login flow.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Behavior**
- Normalizes and validates the email address.
- Requires a password between 8 and 128 characters.
- Creates a user if none exists.
- Verifies the password for existing users.
- Sets auth cookies (`token`, `accessToken`, `refreshToken`).
- Returns the auth tokens without returning the user profile in the response.

**Success response**

```json
{
  "token": "jwt_access_token_here",
  "accessToken": "jwt_access_token_here",
  "refreshToken": "jwt_refresh_token_here",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

**Status codes**
- `200 OK` for a successful login
- `201 Created` for a newly created account
- `400 Bad Request` for invalid input
- `401 Unauthorized` for invalid credentials
- `500 Internal Server Error` for unexpected server errors

### `POST /auth/register`

Alias of `POST /auth/continue`.

### `POST /auth/login`

Alias of `POST /auth/continue`.

### `GET /auth/me`

Returns the authenticated user profile.

**Headers**
- `Authorization: Bearer <access_token>` or valid auth cookies

**Success response**

```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": null,
    "avatar": null,
    "createdAt": "2026-10-30T18:00:00.000Z"
  }
}
```

**Status codes**
- `200 OK`
- `401 Unauthorized` when the token is missing or invalid
- `404 Not Found` if the user no longer exists

### `POST /auth/refresh`

Issues a new access token and rotates the refresh token.

**Request**

- Reads `refreshToken` from cookie or from JSON body:

```json
{
  "refreshToken": "jwt_refresh_token_here"
}
```

**Success response**

```json
{
  "token": "new_jwt_access_token",
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_jwt_refresh_token",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

**Status codes**
- `200 OK`
- `400 Bad Request` if no refresh token is provided
- `401 Unauthorized` if the token is invalid, expired, revoked, or the user no longer exists
- `500 Internal Server Error` for unexpected refresh failures

### `POST /auth/revoke`

Revokes a refresh token so it cannot be used again.

**Request**

```json
{
  "refreshToken": "jwt_refresh_token_to_revoke"
}
```

**Success response**

```json
{
  "message": "Token revoked successfully"
}
```

**Status codes**
- `200 OK`
- `400 Bad Request` if no refresh token is provided
- `500 Internal Server Error` for unexpected errors

### `POST /auth/logout`

Revokes the current refresh token if present and clears all auth cookies.

**Success response**

```json
{
  "message": "Logged out successfully"
}
```

**Status codes**
- `200 OK`

### `GET /auth/google`

Redirects the user to the Google OAuth consent screen.

**Behavior**
- Requires `GOOGLE_CLIENT_ID` and `GOOGLE_CALLBACK_URL` to be configured.
- Uses the `openid email profile` scope.

### `GET /auth/google/callback`

Handles the Google OAuth callback, exchanges the auth code, creates or links the account, sets cookies, and redirects to the frontend.

**Possible results**
- Redirect to frontend on success
- `400 Bad Request` when no OAuth code is present
- `500 Internal Server Error` if Google sign-in fails

### `GET /auth/github`

Redirects the user to the GitHub OAuth login flow.

**Behavior**
- Requires `GITHUB_CLIENT_ID` and `GITHUB_CALLBACK_URL` to be configured.
- Requests `read:user user:email` scope.

### `GET /auth/github/callback`

Handles the GitHub OAuth callback, exchanges the code, creates or links the account, sets cookies, and redirects to the frontend.

**Possible results**
- Redirect to frontend on success
- `400 Bad Request` when no OAuth code is present
- `500 Internal Server Error` if GitHub sign-in fails

### Top-level auth aliases

The server also exposes these top-level endpoints:

- `GET /me`
- `POST /refresh-token`
- `POST /revoke-token`

These are aliases that call the same logic as their `/auth` equivalents.

---

## 3) Notes routes

Base route: `/notes`

All `/notes` routes require a valid access token unless otherwise stated.

### `GET /notes`

Lists notes for the authenticated user.

**Query parameters**
- `category`: filter by category
- `search`: text search against title and content
- `sort`: one of `oldest`, `az`, `za`; default is newest first
- `id`: fetch a single note by numeric id

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
- `400 Bad Request` if an invalid numeric `id` is supplied
- `401 Unauthorized` when no valid token is provided
- `404 Not Found` when the requested note does not belong to the authenticated user

### `POST /notes`

Creates a note.

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
- `content` defaults to an empty string if omitted

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
- `400 Bad Request` for invalid payload
- `401 Unauthorized` when no valid token is provided

### `PATCH /notes`

Updates a note using the `id` query parameter.

**Example**

```http
PATCH /notes?id=2
```

```json
{
  "title": "Updated meeting notes",
  "content": "Discuss launch sequence",
  "category": "work"
}
```

**Success response**

```json
{
  "id": 2,
  "title": "Updated meeting notes",
  "category": "work",
  "content": "Discuss launch sequence",
  "userId": 42,
  "isPin": false,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-06T10:00:00.000Z"
}
```

**Status codes**
- `200 OK`
- `400 Bad Request` for missing or invalid `id`
- `401 Unauthorized`
- `404 Not Found`

### `DELETE /notes`

Deletes a note using the `id` query parameter.

**Example**

```http
DELETE /notes?id=2
```

**Success response**

```json
{
  "success": true
}
```

**Status codes**
- `200 OK`
- `400 Bad Request` for missing or invalid `id`
- `401 Unauthorized`
- `404 Not Found`

### `GET /notes/:id`

Returns a single note for the authenticated user.

**Example**

```http
GET /notes/12
```

**Success response**

```json
{
  "id": 12,
  "title": "Project notes",
  "category": "personal",
  "content": "Keep track of tasks",
  "userId": 42,
  "isPin": true,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-05T12:00:00.000Z"
}
```

**Status codes**
- `200 OK`
- `401 Unauthorized`
- `404 Not Found`

### `PATCH /notes/:id`

Updates a note by path parameter instead of query string.

**Request body**

```json
{
  "title": "Updated title",
  "content": "Updated content",
  "category": "work"
}
```

**Status codes**
- `200 OK`
- `401 Unauthorized`
- `404 Not Found`

### `DELETE /notes/:id`

Deletes a note by path parameter.

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

### `PATCH /notes/:id/pin`

Toggles the pinned state of a note.

- Maximum pinned notes: `3`
- If the user already has three pinned notes, the endpoint returns `409 Conflict`

**Success response**

```json
{
  "id": 12,
  "title": "Pinned note",
  "category": "work",
  "content": "Important details",
  "userId": 42,
  "isPin": true,
  "createdAt": "2026-10-05T12:00:00.000Z",
  "updatedAt": "2026-10-06T10:00:00.000Z"
}
```

**Status codes**
- `200 OK`
- `401 Unauthorized`
- `404 Not Found`
- `409 Conflict` when the pin limit is reached

---

## 4) Notes and implementation summary

The current project exposes these relevant routes and files:

- `src/server.ts`
- `src/routes/auth.routes.ts`
- `src/routes/notes.routes.ts`
- `src/controller/auth.controller.ts`
- `src/controller/notes.controller.ts`
- `src/controller/oauth.controller.ts`

This documentation reflects the live route registration and controller logic in the app, including the newer OAuth and top-level alias endpoints.
