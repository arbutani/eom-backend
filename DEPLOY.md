# Deployment

This NestJS backend (Sequelize + PostgreSQL) is ready for Render or Railway.

## Required environment variables

Set these on the host. Copy `.env.example` to `.env` locally for development, never commit real values.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Listen port (default 3000) |
| `NODE_ENV` | Yes | Set to `production` |
| `CORS_ORIGINS` | Yes (production) | Comma-separated allowed frontend origins, e.g. `https://app.example.com`. No localhost fallback in production. |
| `DATABASE_URL` | Yes* | Full PostgreSQL connection string (Render/Railway provide this) |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Yes* | Individual DB credentials (used when `DATABASE_URL` is unset) |
| `DB_SSL` | No | Set `true` to require SSL (`rejectUnauthorized: false`) |
| `DB_LOGGING` | No | Set `true` to log SQL |
| `JWT_ACCESS_SECRET` | Yes | Secret used to sign/verify access tokens |
| `JWT_PRIVATE_KEY` | No | Unused by current code path; keep for compatibility |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth client secret (not used by login flow today) |
| `FRONTEND_URL` | No | Frontend base URL |

\* Provide either `DATABASE_URL` or the individual `DB_*` credentials.

Startup fails fast if a required variable is missing.

## Build

```bash
npm ci && npm run build
```

Output goes to `dist/`.

## Start

```bash
NODE_ENV=production npm run start:prod
# i.e. NODE_ENV=production node dist/main
```

The app listens on `PORT` (default 3000) bound to `0.0.0.0`.

## Migrations

Sequelize migrations live under `src/database/migrations/` and are driven by `.sequelizerc`.

```bash
npm run migrate
# sequelize-cli db:migrate
```

Create a new migration:

```bash
npm run migrate:generate -- --name migration_name
```

Run migrations before starting the app on a fresh database. The initial migration (`20261116125300-initial-schema.js`) creates the `users`, `refresh_tokens`, `orders` and `order_items` tables.

## Health check

`GET /health` returns `{ "status": "ok" }` when the database answers `SELECT 1`, otherwise `503`. Use it with your uptime monitor to keep a free-tier backend awake.

## Production checklist

1. Set all required environment variables on Render/Railway.
2. Add your production frontend origin(s) to `CORS_ORIGINS`.
3. Add your production domain to the Google Cloud OAuth consent screen / authorized redirect URIs.
4. Run `npm run migrate` against the production database.
5. Ensure `DATABASE_URL` (or `DB_*`) credentials are correct; set `DB_SSL=true` if your provider requires SSL.
