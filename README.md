# Diet Tracker

App personal para registrar comidas, actividades y peso, con objetivos de calorías y proteína según días de gym vs descanso. Los datos se guardan **en tu computadora** (SQLite); no hay cuenta ni nube.

## Qué incluye

- **Vista del día**: navegación por fecha, resumen de kcal/proteína, comidas por horario, actividades y comida libre.
- **Tendencias**: gráficos de consumo y peso (últimos 14 días) y sugerencias automáticas.
- **Ajustes**: lectura del plan (gastos base, déficit, proteína, etc.).
- **API REST** local (`/api`) con backup/import JSON.
- **Importación** de histórico desde un JSON o markdown exportado del chat (`npm run db:import-chat`).

La navegación por fechas está limitada al rango **inicio del seguimiento → hoy** (ver `src/lib/tracking.ts`).

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, Vite, TypeScript, Tailwind, shadcn/ui, TanStack Query, Recharts |
| Backend | Fastify, Zod |
| Base de datos | SQLite (`better-sqlite3`) + Drizzle ORM |

## Requisitos

- Node.js 20+ (recomendado)
- npm

## Puesta en marcha

```bash
git clone https://github.com/LucasMontecino/diet-tracker-app.git
cd diet-tracker-app
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

- **Web**: http://localhost:5173  
- **API**: http://localhost:3001 (Vite hace proxy de `/api` al backend)

Solo frontend o solo API:

```bash
npm run dev:web
npm run dev:server
```

## Scripts útiles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Frontend + API en paralelo |
| `npm run db:migrate` | Aplica migraciones SQLite |
| `npm run db:seed` | Alimentos por defecto y settings iniciales |
| `npm run db:import-chat` | Importa datos desde JSON local o `.md` con bloque JSON |
| `npm run test` | Tests (lógica de cálculo en `src/lib/calc.test.ts`) |
| `npm run build` | Build de producción del frontend |
| `npm run lint` | Oxlint |

## Dónde se guardan los datos

Todo el registro diario vive en:

```text
data/diet.db
```

Esa carpeta **no se sube a Git** (está en `.gitignore`). Para respaldar: copiá `data/diet.db` o usá `GET /api/backup/export`.

## Importar histórico del chat (local)

Los archivos con datos personales **no van al repositorio**:

- `server/db/chat-import-data.json`
- `diet-tracker-data.md`

Colocá tu export en una de esas rutas (o pasá la ruta al script):

```bash
npm run db:import-chat
# o
npm run db:import-chat -- "C:\ruta\a\diet-tracker-data.md"
```

El import es idempotente para las fechas del archivo (reemplaza entradas y actividades de esos días).

## Estructura del proyecto

```text
server/          API Fastify, rutas, SQLite, migraciones, seed/import
shared/          Esquemas Zod compartidos (comidas, settings, etc.)
src/             UI React (páginas, componentes, cliente API, cálculos)
data/            Base SQLite local (gitignored)
```

## API (resumen)

Prefijo: `/api`

- `GET/PUT /days/:date` — resumen del día y metadatos
- `GET/POST/PATCH/DELETE` — `entries`, `foods`, `activities`, `weights`
- `GET/PUT /settings`
- `GET /trends?from=&to=`
- `GET /backup/export`, `POST /backup/import`

## Licencia

Proyecto privado / uso personal. Ajustá según prefieras si lo publicás con otra licencia.
