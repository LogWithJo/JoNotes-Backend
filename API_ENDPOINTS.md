# JoNotes Backend API Endpoints

This reference describes the routes registered by the current Express application.

## Base URL

- Local development: `http://localhost:3000`

## Authentication

Protected endpoints accept an access token in either of these forms:

- `Authorization: Bearer access-token-from-login-response`
- The HTTP-only `accessToken` or `token` cookie

The `requireAuth` middleware validates the access token and checks that its user still exists. Refresh tokens are kept in the `refreshToken` HTTP-only cookie and stored in the database; they are used by refresh, revoke, and logout, not as access tokens.

Successful credential and OAuth sign-ins set `token`, `accessToken`, and `refreshToken` cookies. Refresh rotates the refresh token. In production, auth cookies are secure and use `SameSite=None`; in other modes they use `SameSite=Lax`.

## CORS

- Credentialed requests are enabled.
- Origins include the configured comma-separated `FRONTEND_URL` values and `http://localhost:3000`, `http://localhost:5173`, `http://127.0.0.1:3000`, and `http://127.0.0.1:5173`.
- Requests without an `Origin` header are allowed.
- Allowed methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, and `OPTIONS`.
- Allowed headers: `Content-Type` and `Authorization`.
- Preflight requests are handled for all paths.

---

## 1. Health and status

### `GET /`

Returns basic server status.

```json
{
  "message": "Server is alive!"
}
```

Status: `200 OK`.

### `GET /health`

Returns the current runtime mode.

```json
{
  "ok": true,
  "environment": "development"
}
```

Status: `200 OK`.

---

## 2. Authentication routes

Base route: `/auth`.

### `POST /auth/continue`

Creates an account when the normalized email is new, or signs in an existing password-based account.

**Request body**

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Email is trimmed and lowercased. A valid email and a password of 8 to 128 characters are required. If the email belongs to an OAuth-only account without a password, the request returns `401`.

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

The same tokens are set in HTTP-only cookies. Status codes:

- `200 OK` for a successful login
- `201 Created` for a new account
- `400 Bad Request` for invalid input
- `401 Unauthorized` for invalid credentials
- `500 Internal Server Error` for an unexpected authentication error

### `POST /auth/register` and `POST /auth/login`

Aliases of `POST /auth/continue`; they have the same request body, behavior, response, and status codes.

### `GET /auth/me`

Returns the authenticated user's profile. Requires an access token.

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

Status codes: `200 OK`, `401 Unauthorized` for a missing or invalid access token, `404 Not Found` if the user no longer exists, and `500 Internal Server Error` if the profile lookup fails.

### `POST /auth/refresh`

Reads the refresh token from the `refreshToken` cookie; a request-body token is not used. Returns and sets a new access/refresh token pair after revoking the old refresh token.

```json
{
  "token": "new_jwt_access_token",
  "accessToken": "new_jwt_access_token",
  "refreshToken": "new_jwt_refresh_token",
  "tokenType": "Bearer",
  "expiresIn": 900
}
```

Status codes: `200 OK`, `400 Bad Request` if the cookie is missing, `401 Unauthorized` if the token is invalid, expired, revoked, or its user is missing, and `500 Internal Server Error` for a refresh operation failure.

### `POST /auth/revoke`

Revokes the refresh token supplied in the `refreshToken` cookie, or in the JSON body if no cookie token is supplied.

```json
{
  "refreshToken": "jwt_refresh_token_to_revoke"
}
```

On success, returns `{"message":"Token revoked successfully"}` and clears the auth cookies. Status codes: `200 OK`, `400 Bad Request` if no token is supplied, and `500 Internal Server Error` if revocation fails.

### `POST /auth/logout`

Attempts to revoke a refresh token from the `refreshToken` cookie or, if absent, the request body. The body is optional:

```json
{
  "refreshToken": "jwt_refresh_token_to_revoke"
}
```

Always clears auth cookies and returns `{"message":"Logged out successfully"}` with `200 OK`. If database revocation fails, the error is logged and logout still returns `200`.

### `GET /auth/google` and `GET /auth/google/callback`

`GET /auth/google` redirects to Google's consent screen and requires `GOOGLE_CLIENT_ID` and `GOOGLE_CALLBACK_URL`. It requests the `openid email profile` scopes.

The callback exchanges the supplied `code`, finds or creates/links the account, sets auth cookies, and redirects to the first `FRONTEND_URL` origin. It returns `400 Bad Request` if the code is missing and `500 Internal Server Error` if OAuth configuration or sign-in fails.

### `GET /auth/github` and `GET /auth/github/callback`

`GET /auth/github` redirects to GitHub and requires `GITHUB_CLIENT_ID` and `GITHUB_CALLBACK_URL`. It requests `read:user user:email`.

The callback exchanges the supplied `code`, finds or creates/links the account, sets auth cookies, and redirects to the first `FRONTEND_URL` origin. It returns `400 Bad Request` if the code is missing and `500 Internal Server Error` if OAuth configuration or sign-in fails.

### Top-level authentication aliases

The server also registers:

- `GET /me` — same authenticated profile handler as `GET /auth/me`
- `POST /refresh-token` — same handler as `POST /auth/refresh`
- `POST /revoke-token` — same handler as `POST /auth/revoke`

---

## 3. Notes routes

All `/notes` endpoints require an access token.

### `GET /notes`

Lists notes belonging to the authenticated user. With no pagination parameters, the response remains a JSON array.

**Query parameters**

- `category`: filter by category; `all` does not apply a category filter
- `search`: case-insensitive substring search in title or content
- `sort`: `oldest`, `az`, or `za`; defaults to newest first
- `id`: return one of the authenticated user's notes by ID instead of a list
- `page`: positive one-based page number; enables offset pagination
- `limit`: positive page size up to `50`; enables offset pagination and defaults to `10` when only `page` is supplied

Example:

```http
GET /notes?category=work&search=meeting&sort=az
```

An unpaginated list is ordered newest first by default. If either `page` or `limit` is supplied, the response is offset-paginated and ordered by `createdAt` descending, then `id` descending; `sort` does not change this paginated order.

**Unpaginated success response**

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

**Paginated request**

```http
GET /notes?page=1&limit=10
```

**Paginated success response**

```json
{
  "items": [
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
  ],
  "total": 21,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

An out-of-range page succeeds with an empty `items` array. Invalid `page` or `limit` values, including non-positive values or a limit above 50, return `400 Bad Request`.

When `id` is supplied, the response is the matching note object. Status codes: `200 OK`, `400 Bad Request` for a non-numeric `id` or invalid pagination values, `401 Unauthorized`, and `404 Not Found` if the requested note does not belong to the user.

### `GET /notes/feed`

Returns a cursor-paginated feed ordered by `createdAt` descending and then `id` descending. `limit` is optional, defaults to `10`, and must be from 1 to 50. Pass the returned `nextCursor` as the `cursor` parameter to fetch the next page:

```http
GET /notes/feed?limit=10
GET /notes/feed?limit=10&cursor=eyJjcmVhdGVkQXQiOiIyMDI2LTEwLTA1VDEyOjAwOjAwLjAwMFoiLCJpZCI6MTJ9
```

Response:

```json
{
  "items": [
    {
      "id": 12,
      "title": "Project ideas",
      "category": "work",
      "content": "Talk about roadmap",
      "userId": 42,
      "isPin": false,
      "createdAt": "2026-10-05T12:00:00.000Z",
      "updatedAt": "2026-10-05T12:00:00.000Z"
    }
  ],
  "nextCursor": "eyJjcmVhdGVkQXQiOiIyMDI2LTEwLTA1VDEyOjAwOjAwLjAwMFoiLCJpZCI6MTJ9"
}
```

`nextCursor` is `null` when there is no further page. Invalid limits or cursor values return `400 Bad Request`; unauthenticated requests return `401 Unauthorized`.

### `POST /notes`

Creates a note for the authenticated user.

```json
{
  "title": "Meeting notes",
  "category": "work",
  "content": "Discuss launch timeline"
}
```

`title` and `category` are required. `content` defaults to an empty string when omitted or falsy. Returns the created note with `201 Created`; invalid required fields return `400 Bad Request`, and unauthenticated requests return `401 Unauthorized`.

### `PATCH /notes?id=12` and `PATCH /notes/:id`

Updates the specified note owned by the authenticated user. The ID can be supplied as a query parameter or as a path parameter; the path parameter takes precedence. The number in the query example is illustrative.

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

Returns the updated note with `200 OK`. Missing or non-numeric IDs return `400 Bad Request`; a note not owned by the user returns `404 Not Found`; unauthenticated requests return `401 Unauthorized`.

### `DELETE /notes?id=12` and `DELETE /notes/:id`

Deletes the specified note owned by the authenticated user. The path parameter takes precedence over the query parameter.

```http
DELETE /notes?id=2
```

Success response: `{"success":true}` with `200 OK`. Missing or non-numeric IDs return `400 Bad Request`; a note not owned by the user returns `404 Not Found`; unauthenticated requests return `401 Unauthorized`.

### `GET /notes/:id`

Returns one note owned by the authenticated user. Success returns the note object with `200 OK`; a note not found for that user returns `404 Not Found`; unauthenticated requests return `401 Unauthorized`.

### `PATCH /notes/:id/pin`

Toggles the note's `isPin` value. A user can have at most three pinned notes. Returns the updated note with `200 OK`; if pinning would exceed the limit, returns `409 Conflict`. A note not found for that user returns `404 Not Found`; unauthenticated requests return `401 Unauthorized`.

---

## 4. Data and route implementation

- `src/server.ts` registers health, auth aliases, CORS, JSON parsing, and error handling.
- `src/routes/auth.routes.ts` and `src/routes/notes.routes.ts` register route handlers.
- `src/controller/` contains auth, OAuth, and notes behavior, including the pagination helpers.
- `prisma/schema.prisma` defines users, provider accounts, refresh tokens, and notes.

The API serves JSON except for OAuth redirects. Error responses use an `error` field where the handler explicitly returns one.
