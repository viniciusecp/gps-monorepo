---
run: run-gps-monorepo-001
intent: vehicle-history
generated: 2026-05-25T00:38:40Z
---

# Implementation Walkthrough: Histórico de Coordenadas por Período

## Summary

Implemented a new API endpoint `GET /api/gprmc/history/:imei` on the server for querying GPS coordinates by date range, and a new Expo Router page `app/history.tsx` on the mobile app with date/time pickers, list view, and map polyline view.

## Structure Overview

Server: New route at `/api/gprmc/history/:imei` follows the existing layered pattern (route → controller → service). The controller extracts `imei` from params and `startDate`/`endDate` from query string, delegates to `GpsService.getCoordinatesByDateRange()` which queries the `gprmc` table with Drizzle ORM date filters and returns converted coordinates.

App: New Expo Router page at `/history` receives the `imei` via URL query params. Users select start and end date/time via `@react-native-community/datetimepicker`, tap "Buscar" to fetch data via `tryAuthRequest`, and toggle between a FlatList view (date/time/speed) and a MapView with Polyline connecting all coordinates.

## Files Changed

### Created

| File | Purpose |
|------|---------|
| `server/src/validators/history.ts` | Zod schemas for history route params and query |
| `app/app/history.tsx` | Expo Router page with date pickers, list, map, toggle |

### Modified

| File | Changes |
|------|---------|
| `server/src/services/gps-service.ts` | Added `getCoordinatesByDateRange(imei, startDate, endDate)` method |
| `server/src/controllers/gps-controller.ts` | Added `getHistory` request handler |
| `server/src/routes/coordinates.ts` | Added `GET /gprmc/history/:imei` route definition |
| `app/app/index.tsx` | Added FAB button to navigate to `/history?imei=...` |

## Key Implementation Details

### 1. Server - Date Range Query

Uses Drizzle ORM `and()`, `gte()`, `lte()` to filter `gprmc.date` column between `startDate` and `endDate`. Results ordered ascending by `date`. No limit applied. Coordinates converted to decimal degrees via existing `convertCoordinates()` utility. Query params validated as ISO datetime strings via Zod schema.

### 2. App - Date/Time Selection

Four picker buttons (start date, start time, end date, end time) trigger `@react-native-community/datetimepicker` in date or time mode. Platform-aware display (spinner on iOS, default dialog on Android). The `dayjs` library handles ISO formatting for API calls and local formatting for display.

### 3. App - Map Polyline

Uses `react-native-maps` `Polyline` component to draw a route connecting all returned coordinates in order. Start and end markers labeled "Início" and "Fim". Initial region centered on first coordinate with `latitudeDelta: 0.05` for route-level zoom.

## Security Considerations

| Concern | Approach |
|---------|----------|
| Authentication | JWT via `preHandler: authenticate` (same as existing endpoints) |
| Input validation | Zod schemas validated via `validateParams` and `validateQuery` middleware |
| Token refresh | `tryAuthRequest` pattern auto-refreshes on 401 via refresh token |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Query params vs body | Query string (`startDate`, `endDate`) | GET endpoint semantics, follows REST conventions |
| GpsService vs GprmcRepository Used | GpsService (direct DB query) | Matches existing `getLastCoordinates` pattern. GprmcRepository is dead code |
| Date picker library | `@react-native-community/datetimepicker` | Specified in work item, cross-platform native picker |
| Page-level vs component | Single page file | Page is self-contained; follows `add-account.tsx` pattern |

## Deviations from Plan

None.

## Dependencies Added

| Package | Why Needed |
|---------|------------|
| `@react-native-community/datetimepicker@^9.1.0` | Native date/time picker for React Native |

## How to Verify

### 1. Start the server

```bash
cd server && pnpm dev
```

Then in another terminal:

```bash
curl -X POST http://localhost:3333/api/cliente/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","senha":"password"}'
# Save the token from the response
```

### 2. Test the history endpoint

```bash
curl "http://localhost:3333/api/gprmc/history/{IMEI}?startDate=2026-01-01T00:00:00.000Z&endDate=2026-12-31T23:59:59.000Z" \
  -H "Authorization: Bearer {TOKEN}"
```

Expected: `{ "coordinates": [...] }` with converted decimal degrees, ordered chronologically.

### 3. Test mobile app

Run `pnpm start` in `app/`, navigate to main screen, select a vehicle, tap the "H" FAB button, select date range, tap "Buscar".

## Test Coverage

- Tests added: 0 (no test framework configured)
- Coverage: N/A
- Status: N/A — code verified via linter (Biome for server, ESLint for app)

## Ready for Review

- [x] All acceptance criteria met
- [x] Linting passes
- [x] No critical issues
- [ ] Documentation updated
- [x] Developer notes captured

## Developer Notes

- The `history` page imports `dayjs` plugins (`utc`, `timezone`) locally rather than relying on the global extend in `_layout.tsx`. This is defensive in case the page is navigated to before the layout fully initializes.
- The `tryAuthRequest` pattern looks up the user by finding which user owns the selected IMEI. This assumes IMEIs are unique across users (matching existing pattern in `Coordinates` component).
- On Android, `@react-native-community/datetimepicker` shows a dialog that auto-dismisses after selection. On iOS with `display="spinner"`, it stays visible inline.
- The coordinate conversion bug in `coordinates.ts` (longitude hemisphere check using `latitudeHemisphere`) is pre-existing and not addressed in this run.

---

*Generated by specs.md - fabriqa.ai FIRE Flow Run run-gps-monorepo-001*
