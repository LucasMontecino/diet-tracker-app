# Diet Tracker

Personal app to log meals, activity, and weight, with calorie and protein targets that adapt to gym vs rest days. All data stays **on your machine** (SQLite)—no accounts or cloud sync.

## Features

- **Day view**: date navigation, kcal/protein summary, meals by time slot, activities, and free-meal toggle.
- **Trends**: 14-day charts for intake and weight, plus automatic suggestions.
- **Settings**: view your plan (baseline expenditure, deficit, protein targets, etc.).
- **Local REST API** (`/api`) with JSON backup/import.
- **Chat history import** from a local JSON file or markdown export (`npm run db:import-chat`).

Date navigation is clamped from **tracking start date → today** (see `src/lib/tracking.ts`).

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 19, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query, Recharts |
| Backend | Fastify, Zod |
| Database | SQLite (`better-sqlite3`) + Drizzle ORM |

## Requirements

- Node.js 20+ (recommended)
- npm

## Getting started

```bash
git clone https://github.com/LucasMontecino/diet-tracker-app.git
cd diet-tracker-app
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- **Web**: http://localhost:5173  
- **API**: http://localhost:3001 (Vite proxies `/api` to the backend)

Run only the web or API:

```bash
npm run dev:web
npm run dev:server
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Frontend + API together |
| `npm run db:migrate` | Apply SQLite migrations |
| `npm run db:seed` | Default foods and initial settings |
| `npm run db:import-chat` | Import from local JSON or markdown with a JSON block |
| `npm run test` | Tests (day calculations in `src/lib/calc.test.ts`) |
| `npm run build` | Production frontend build |
| `npm run lint` | Oxlint |

## Where data is stored

Daily logs live in:

```text
data/diet.db
```

This folder is **not committed** (see `.gitignore`). To back up: copy `data/diet.db` or call `GET /api/backup/export`.

## Importing chat history (local only)

Personal export files are **not** in the repo:

- `server/db/chat-import-data.json`
- `diet-tracker-data.md`

Place your export in one of those paths, or pass a file path to the script:

```bash
npm run db:import-chat
# or
npm run db:import-chat -- "C:\path\to\diet-tracker-data.md"
```

The import is idempotent for dates in the file (it replaces entries and activities for those days).

## Project layout

```text
server/          Fastify API, routes, SQLite, migrations, seed/import
shared/          Shared Zod schemas (meals, settings, etc.)
src/             React UI (pages, components, API client, calculations)
data/            Local SQLite database (gitignored)
```

## API overview

Prefix: `/api`

- `GET/PUT /days/:date` — day summary and metadata
- `GET/POST/PATCH/DELETE` — `entries`, `foods`, `activities`, `weights`
- `GET/PUT /settings`
- `GET /trends?from=&to=`
- `GET /backup/export`, `POST /backup/import`

## License

Private / personal use. Add a license file if you publish under different terms.
