Plan: Next.js + TypeScript app with SQLite persistence for Railway (single-instance, Docker + docker-compose, sample .env)

Goal
- Small web app where a visitor can submit a short string that is stored in an SQLite DB (single-instance), and the page shows the 10 latest entries.
- Provide a production minded scaffold that includes a Dockerfile, docker-compose.yaml, and a sample .env for easy local testing.

High-level decisions and rationale
- Stack: Next.js (TypeScript). Single-repo app that serves both UI and API routes.
  - Why: quickest to scaffold, supports server-side API routes without a separate server process, easy to deploy on Railway.
- Database: SQLite file stored on a persistent volume. Single-instance demo is fine for this setup.
- Dev / local testing: docker-compose with a single app service and a named volume mounting the sqlite DB path. Provide `.env.example`.
- Railway: use Railway Persistent Storage / Volume plugin and set SQLITE_DB_PATH to the mounted path.

Files to create
- package.json
- tsconfig.json
- next.config.js (optional, minimal)
- lib/db.ts             — opens SQLite at `process.env.SQLITE_DB_PATH`, ensures the `entries` table exists, provides insert and query functions
- pages/api/entries.ts  — GET (last 10 entries) and POST (insert new entry) endpoints
- pages/index.tsx       — UI with a short-form input and a list showing 10 latest entries
- Dockerfile            — multi-stage Node build for production
- docker-compose.yaml   — single-service setup for local testing with named volume for DB
- .env.example          — sample env (SQLITE_DB_PATH=/data/db.sqlite, PORT=3000)
- README.md             — quick run instructions and Railway deployment notes

Database schema (SQLite)
CREATE TABLE entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  text TEXT NOT NULL CHECK(length(text) <= 280),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

API design
- GET /api/entries
  - Returns last 10 entries, ordered by created_at DESC
- POST /api/entries
  - Accepts { text: string }
  - Validates non-empty string and limits length to 280 characters
  - Inserts the row and returns the created entry

Frontend
- Minimal page at `/` with:
  - Controlled text input (max length 280)
  - Submit button that POSTs to /api/entries
  - Displays the 10 most recent entries (fetched from /api/entries)
  - UI can optimistically update after successful POST

Docker & docker-compose
- Dockerfile
  - Use node:18-alpine or similar base image
  - Multi-stage: install deps and build then copy to a smaller runtime image
  - Ensure `process.env.PORT` is used
  - Default start script: `npm run start` (runs `next start` in production)
- docker-compose.yaml
  - Single service `web` for the app
  - Named volume `sqlite_data` mounted at /data (or configurable path)
  - Ports mapping 3000:3000
  - Use env_file pointing to `.env` for local testing
- .env.example
  - SQLITE_DB_PATH=/data/db.sqlite
  - PORT=3000

Railway deployment notes
- Set up a project in Railway
- Add a Persistent Storage / Volume plugin
- Configure environment variable `SQLITE_DB_PATH` in Railway to point to the mount path (e.g., /data/db.sqlite)
- Ensure the project start command matches `npm start` or `next start` for production
- Test persistence by restarting the service and verifying entries survive restarts

Local dev & test
- Local dev (Next.js) with TypeScript: `npm run dev` (next dev)
- Local production test with docker-compose:
  - Copy `.env.example` to `.env`
  - Start: `docker compose up --build` (or `docker-compose up --build` depending on Docker version)
  - Validate persistence: submit entries, stop the container, start again, and re-check entries

Notes & limitations
- SQLite locking can be a problem if scaled to multiple instances — use PostgreSQL for multi-instance.
- Consider adding simple rate-limiting and sanitization for the POST endpoint as a later improvement.

Next steps to implement
1. Scaffold the Next.js + TypeScript project with the files above.
2. Implement `lib/db.ts` and `pages/api/entries.ts`.
3. Implement the UI `pages/index.tsx`.
4. Add Dockerfile, docker-compose.yaml and `.env.example`.
5. Add README with instructions for local testing and Railway deployment.

This plan is ready for refinement or immediate scaffolding — tell me if you want me to scaffold the whole project now (I can create all files and test locally).
