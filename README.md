# CvToAI

AI-powered CV optimizer: match analysis against a job offer, cover letters, interview prep, skills-gap roadmap, LinkedIn optimization and job search.

React SPA (Vite) served by an Express backend. All Gemini calls run **on the server** (`/api/ai/*`); the API key is never shipped to the browser.

## Environment variables

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | yes | Google Gemini API key (server-side only). |
| `SESSION_SECRET` | yes in production | Random string used to sign session cookies. The server refuses to start in production without it. |
| `DATABASE_URL` | no | PostgreSQL connection string (e.g. Neon). Without it the app uses local SQLite (`database.sqlite`). |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | no | Enables "Sign in with Google". |
| `APP_URL` | with Google login | Public URL of the app, used to build the OAuth redirect URI (`$APP_URL/auth/google/callback`). |
| `GEMINI_MODEL` | no | Override the model (default `gemini-3.1-pro-preview`). |
| `AI_RATE_LIMIT_PER_HOUR` | no | AI requests allowed per IP per hour (default 30). |

See `.env.example`.

## Deployment to Render (recommended)

This repository includes a `render.yaml` Blueprint.

1. Push the code to GitHub.
2. In Render: **New** > **Blueprint**, then connect the repository.
3. Fill in `GEMINI_API_KEY` (and optionally `DATABASE_URL`, Google OAuth variables and `APP_URL`). `SESSION_SECRET` is generated automatically.
4. Deploy.

> Without `DATABASE_URL` the SQLite database and uploaded avatars live on the instance's disk and are lost on restart unless you attach a persistent disk.

## Manual deployment

1. Build command: `npm ci --include=dev && npm run build`
2. Start command: `npm start`
3. Set `NODE_ENV=production` plus the variables above.

## Local development

```bash
npm install
cp .env.example .env   # fill in GEMINI_API_KEY
npm run dev            # http://localhost:3000
```

Useful scripts: `npm run lint` (TypeScript typecheck), `npm run build`.

## Project structure

* `server.ts` – Express entry point (sessions, static files, Vite middleware in dev).
* `server/routes/` – API routes: `auth`, `profile`, `history`, `ai`.
* `server/services/gemini.ts` – Gemini prompts and calls (server-only).
* `server/db.ts` – SQLite / PostgreSQL adapter and schema.
* `src/` – React frontend; `src/services/gemini.ts` is a thin client for `/api/ai/*`.
