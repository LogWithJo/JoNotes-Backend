# JoNotes

[![Express 5.2.1](https://img.shields.io/badge/Express-5.2.1-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![TypeScript 5.9.3](https://img.shields.io/badge/TypeScript-5.9.3-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/license/isc-license-txt/)

JoNotes is a TypeScript backend API for private note management, with email/password and Google or GitHub sign-in backed by PostgreSQL.

## Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Prerequisites](#prerequisites)
4. [Getting Started](#getting-started)
5. [Environment Variables](#environment-variables)
6. [Available Scripts](#available-scripts)
7. [Project Structure](#project-structure)
8. [Architecture & Conventions](#architecture--conventions)
9. [API Routing](#api-routing)
10. [Testing](#testing)
11. [Code Quality](#code-quality)
12. [Build & Deployment](#build--deployment)
13. [Troubleshooting](#troubleshooting)
14. [License](#license)

## Overview

The API stores users and their notes in PostgreSQL through Prisma. It supports credential-based registration and login, Google and GitHub OAuth, refresh-token rotation, note search and filtering, and offset or cursor pagination. Authenticated users can create, update, delete, and pin their own notes.

## Tech Stack

- Node.js and TypeScript 5.9
- Express 5.2
- Prisma 6 with PostgreSQL
- JSON Web Tokens, `bcrypt`, and HTTP-only cookies for authentication
- Axios for Google and GitHub OAuth requests
- Node.js test runner with `tsx`
- Biome for linting and formatting
- Vercel Node function configuration in `vercel.json`

## Prerequisites

- Node.js 22.x and npm
- A PostgreSQL database
- Google and/or GitHub OAuth application credentials if using those sign-in providers

The repository does not declare a Node.js engine range; Node.js 22.x is the baseline used for this setup.

## Getting Started

1. Clone the repository and install dependencies:

   ```sh
   git clone https://github.com/LogWithJo/Notes-App-Backend.git
   cd Notes-App-Backend
   npm install
   ```

   The install hook generates the Prisma client.

2. Create a local environment file and configure it:

   ```sh
   cp .env.example .env
   ```

   At minimum, set `DATABASE_URL`. Set a strong `JWT_SECRET` and a `FRONTEND_URL` before running in production. Configure provider credentials and callback URLs to enable OAuth.

3. Apply database migrations:

   ```sh
   npx prisma migrate deploy
   ```

4. Start the development server:

   ```sh
   npm run dev
   ```

   The server listens on port `3000` by default. Check `http://localhost:3000/health` for its health response.

## Environment Variables

The checked-in `.env.example` lists the app settings. Values below are defaults or requirements implemented by the runtime and Prisma configuration.

| Variable | Required | Default / purpose |
| --- | --- | --- |
| `DATABASE_URL` | Yes | PostgreSQL connection string used by Prisma. |
| `PORT` | No | HTTP port; defaults to `3000`. |
| `NODE_ENV` | No | Runtime mode; defaults to `development`. Production mode enables secure, `SameSite=None` auth cookies. |
| `FRONTEND_URL` | Production | Comma-separated frontend origins allowed by CORS and the destination for OAuth success redirects. Required in production. |
| `JWT_SECRET` | Production | Secret for signing access tokens. Required in production; development has a source-defined fallback. |
| `JWT_REFRESH_SECRET` | No | Secret for refresh tokens; defaults to the access-token secret with `_refresh` appended. Set a separate strong value in production. |
| `ACCESS_TOKEN_EXPIRES_IN` | No | Access-token lifetime; defaults to `15m`. Accepts a duration such as `30m` or `1h`. |
| `REFRESH_TOKEN_EXPIRES_IN` | No | Refresh JWT lifetime; defaults to `7d`. |
| `REFRESH_TOKEN_EXPIRES_IN_DAYS` | No | Refresh-token database expiry and cookie lifetime in days; defaults to `7`. Keep this consistent with `REFRESH_TOKEN_EXPIRES_IN`. |
| `GOOGLE_CLIENT_ID` | OAuth only | Google OAuth client ID. |
| `GOOGLE_CLIENT_SECRET` | OAuth only | Google OAuth client secret. |
| `GOOGLE_CALLBACK_URL` | OAuth only | Registered Google callback URL, typically `/auth/google/callback`. |
| `GITHUB_CLIENT_ID` | OAuth only | GitHub OAuth client ID. |
| `GITHUB_CLIENT_SECRET` | OAuth only | GitHub OAuth client secret. |
| `GITHUB_CALLBACK_URL` | OAuth only | Registered GitHub callback URL, typically `/auth/github/callback`. |
| `SEED_USER_ID` | Seed script only | Positive ID of an existing user for `npm run seed:pagination-notes`. |

`FRONTEND_URL` may contain multiple comma-separated origins. The server also allows its four built-in localhost origins in every environment. OAuth callback URLs must match the URLs registered with the corresponding provider.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies and generate the Prisma client through `postinstall`. |
| `npm run dev` | Run `src/server.ts` with `tsx watch`. |
| `npm test` | Run Node.js tests through `tsx`; integration tests need a migrated PostgreSQL database. |
| `npm run build` | Generate the Prisma client and compile TypeScript into `dist/`. |
| `npm start` | Run the `prestart` build, then start `dist/server.js`. |
| `npm run seed:pagination-notes` | Add 200 pagination sample notes for the existing user identified by `SEED_USER_ID`. |

## Project Structure

```text
JoNotes-Back/
├── notes/readme/             # README authoring template and prompts
├── prisma/
│   ├── migrations/           # PostgreSQL schema migrations
│   ├── schema.prisma         # User, account, refresh-token, and note models
│   └── seed-pagination-notes.ts # Pagination sample-data script
├── src/
│   ├── config/               # Runtime configuration and tests
│   ├── controller/           # Auth, OAuth, and note handlers and tests
│   ├── middleware/           # Access-token authentication
│   ├── routes/               # Express auth and note route registration
│   ├── services/oauth/       # Provider clients and OAuth account linking
│   └── server.ts             # Express app, middleware, health routes, listener
├── .env.example              # Environment variable template
├── API_ENDPOINTS.md          # Detailed HTTP API reference
├── biome.json                # Biome formatter and linter configuration
├── package.json              # Dependencies and npm scripts
├── package-lock.json         # Locked npm dependency tree
├── prisma.config.ts          # Prisma schema, migration, and database settings
├── tsconfig.json             # Strict TypeScript and build settings
└── vercel.json               # Vercel Node function and rewrite configuration
```

The code is organized by backend responsibility: routes connect HTTP paths to controllers, services handle OAuth integrations, and shared runtime settings and authentication middleware are kept separate. Generated Prisma client files and compiled `dist/` output are omitted from this tree.

## Architecture & Conventions

- Express registers `/auth` and `/notes` route modules; top-level auth aliases and health routes are registered in `src/server.ts`.
- Controllers implement request validation and business logic. Prisma models and migrations define persisted users, OAuth accounts, refresh tokens, and notes.
- Protected routes use `requireAuth`, which accepts a bearer access token or the `accessToken`/`token` cookie and attaches the authenticated user ID to the request.
- Access and refresh tokens are set as HTTP-only cookies. Refresh tokens are stored in the database, rotated on refresh, and revoked on logout or revoke.
- TypeScript is strict, uses ES2022 with NodeNext module resolution, and emits ESM JavaScript to `dist/`. Source imports use `.js` specifiers for Node ESM compatibility.
- CORS allows credentials and configured `FRONTEND_URL` origins as well as local development origins.

## API Routing

All note routes and the authenticated profile routes require a valid access token. The main route groups are:

| Method and path | Purpose |
| --- | --- |
| `GET /`, `GET /health` | Server status and health response |
| `POST /auth/continue`, `/auth/register`, `/auth/login` | Register or log in with email and password |
| `GET /auth/me`, `GET /me` | Get the authenticated user's profile |
| `POST /auth/refresh`, `POST /refresh-token` | Rotate refresh token and issue an access token |
| `POST /auth/revoke`, `POST /revoke-token`, `POST /auth/logout` | Revoke refresh tokens and/or clear auth cookies |
| `GET /auth/google`, `GET /auth/google/callback` | Google OAuth |
| `GET /auth/github`, `GET /auth/github/callback` | GitHub OAuth |
| `GET`, `POST`, `PATCH`, `DELETE /notes` | List, create, update, and delete notes |
| `GET /notes/feed` | Cursor-paginated notes feed |
| `GET`, `PATCH`, `DELETE /notes/:id`, `PATCH /notes/:id/pin` | Read, update, delete, or pin an individual note |

`GET /notes` retains its array response when no `page` or `limit` is supplied. Supplying either enables offset pagination; `/notes/feed` provides cursor pagination. Users can pin up to three notes. For request and response examples, validation, and status codes, see [API_ENDPOINTS.md](./API_ENDPOINTS.md).

## Testing

Tests use the built-in Node.js test runner and are written in TypeScript. Run them with:

```sh
npm test
```

Runtime configuration and pagination utility tests do not require a database. The server and notes pagination integration tests create and remove database records, so configure `DATABASE_URL` and apply the Prisma migrations before running the full suite.

## Code Quality

Biome is configured to format with tabs and enable its recommended lint rules for `src/**/*.ts`, excluding generated Prisma files. Run the checks with:

```sh
npx @biomejs/biome check src
```

Format source files with:

```sh
npx @biomejs/biome format --write src
```

## Build & Deployment

`npm run build` generates the Prisma client and compiles source into `dist/`. `npm start` runs that build through npm's `prestart` lifecycle before launching the server.

`vercel.json` declares `src/server.ts` as an `@vercel/node` function and rewrites incoming paths to it. Production deployments need a PostgreSQL `DATABASE_URL`, a strong `JWT_SECRET`, a `FRONTEND_URL`, and any OAuth settings required by enabled providers.

## Troubleshooting

- **Prisma cannot connect:** Verify `DATABASE_URL` points to a reachable PostgreSQL database, then run `npx prisma migrate deploy`.
- **Production startup fails during configuration:** Set both `FRONTEND_URL` and `JWT_SECRET`; production mode requires them.
- **OAuth sign-in fails:** Check the provider client ID and secret, and ensure the callback URL in the environment matches the provider's registered callback.
- **Integration tests fail to connect:** The notes pagination and server tests use a real database; configure and migrate it before running `npm test`.

## License

The package metadata declares the project license as ISC.
