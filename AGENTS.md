# AGENTS.md

## Repo structure

Two pnpm workspace packages: `server/` and `app/`. No root `package.json` — run all commands with `pnpm` inside the package directory.

## Server (`server/`)

- **Framework**: Fastify 5.x + TypeScript + Drizzle ORM (MySQL via mysql2)
- **Entry**: `src/index.ts` loads dotenv, calls `buildApp()` from `src/app.ts`, listens on `0.0.0.0:3333`
- **Architecture**: `routes/ → controllers/ → services/ → repositories/`
- **Services/Repos instantiated in `app.ts`** and decorated on the Fastify instance (`authService`, `gpsService`, `bemService`)

### Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Hot-reload via `tsx watch src/index.ts` |
| `pnpm build` | `tsc` — compiles to `dist/` |
| `pnpm lint` | Biome linter |
| `pnpm lint:fix` | Biome linter + fix + auto-organize imports |
| `pnpm db:generate` | `drizzle-kit generate` (migrations to `drizzle/`) |
| `pnpm db:push` | `drizzle-kit push` (sync schema to DB) |

- **No test framework** configured.
- **Lint before committing** — Biome is picky about double quotes, trailing commas, and import organization. `lint:fix` also runs `organizeImports`.

### Auth quirks

- Access token: 15min expiry via `reply.jwtSign({ id, email }, { expiresIn: "15m" })`
- Refresh token: **365d** expiry (not 7d — old CLAUDE.md was wrong)
- Refresh endpoint `POST /api/cliente/refresh` — pass `{ refreshToken }`, get back `{ token }`
- Login accepts `email` or `apelido` for the `email` field
- Password hashing: MD5 (legacy — `crypto.createHash("md5")`)
- Two auth middleware mechanisms coexist:
  - `server/src/middleware/auth.ts` — standalone `authenticate` function used as `preHandler`
  - `app.authenticate` decorator — used within route handlers, throws `AppError` on failure
- JWT secret from `JWT_SECRET` env var (fallback `"supersecretjwtkeychangemeinprod"`)

### Data quirks

- **Coordinate conversion** (`src/utils/coordinates.ts`): GPRS format (DDMM.MMMM) → decimal degrees. Latitude always gets `"0"` prepended; longitude only if 9 chars. Southern hemisphere lat negated. **Bug**: longitude hemisphere check uses `latitudeHemisphere` instead of `longitudeHemisphere`.
- **Speed**: km/h × 1.60934 → mph
- **DB connection retry** (`src/db/retry.ts`): Proxy-based auto-retry on `read ECONNRESET` for `execute()` and direct query calls
- **DB defaults**: host=localhost, user=root, pass=root, db=tracker
- IMEI validation: exactly 15 chars (`z.string().length(15)`)
- All routes prefixed with `/api`

### Env (`.env.example`)

```
DB_NAME= DB_USER= DB_PASS= DB_HOST=
JWT_SECRET=
PORT=3333
```

## App (`app/`)

- **Framework**: Expo SDK 54 (React Native 0.81), Expo Router 6
- **Entry**: `expo-router/entry` — pages in `app/` dir (`_layout.tsx`, `index.tsx`, `add-account.tsx`, `map.tsx`)
- **Path alias**: `@/*` → `./` (e.g. `@/common/model`, `@/components/accounts`)
- **Native maps**: `react-native-maps` with Google Maps; requires `GOOGLE_MAPS_API_KEY` env var for Android

### Commands

| Command | What it does |
|---|---|
| `pnpm start` | Expo dev server |
| `pnpm android` | Run on Android |
| `pnpm ios` | Run on iOS (macOS only) |
| `pnpm web` | Run in browser |
| `pnpm build:android` | EAS build (APK, internal distribution) |

### Auth flow (app-side)

- Multiple user accounts stored in AsyncStorage under key `"users"` as JSON array
- `tryAuthRequest` auto-refreshes on 401: calls `refreshAccessToken` which calls `POST /api/cliente/refresh` and persists the new token
- `EXPO_PUBLIC_API_URL` env var must point to the running API (no default fallback)

### Env (`.env.example`)

```
EXPO_PUBLIC_API_URL=
GOOGLE_MAPS_API_KEY=
EAS_PROJECT_ID=
```

## Existing instruction files

- `CLAUDE.md` — existing, **partially stale** (check against current code)
- `.agents/skills/expo-react-native-javascript-best-practices/`
- `.agents/skills/nodejs-backend-patterns/`

## Flags

- `pnpm-lock.yaml` in `.gitignore` — committed lockfile goes under `server/` or `app/`
- `expo-env.d.ts` generated and gitignored
- `app.config.js` loads `dotenv` at require time — app env vars read from `.env`
