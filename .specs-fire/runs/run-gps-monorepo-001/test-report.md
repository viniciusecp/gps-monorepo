## Work Item: server-history-endpoint

### Test Results

- Passed: N/A (no test framework configured)
- Failed: N/A
- Skipped: N/A

### Code Quality
- Lint: Clean (no new issues introduced)
- Pre-existing lint infos (2) in `coordinates.ts` — unrelated, pre-existing string concat warnings

### Acceptance Criteria Validation

| # | Criterion | Status |
|---|-----------|--------|
| 1 | New route `GET /api/gprmc/history/:imei` registered | ✅ `routes/coordinates.ts` — added route with authenticate + validateQuery |
| 2 | Query params `startDate` and `endDate` validated via Zod | ✅ `validators/history.ts` — ISO datetime validation |
| 3 | JWT authentication via `preHandler: authenticate` | ✅ Route uses standalone `authenticate` middleware |
| 4 | Controller handler extracts params and delegates | ✅ `controllers/gps-controller.ts` — `getHistory` handler |
| 5 | Service method queries `gprmc` table with date range | ✅ `services/gps-service.ts` — `getCoordinatesByDateRange` |
| 6 | Query filters by `imei` AND `date BETWEEN startDate AND endDate` | ✅ Uses `and(eq(), gte(), lte())` |
| 7 | Results ordered chronologically ASC | ✅ `orderBy(asc(gprmc.date))` |
| 8 | No limit on results | ✅ No `.limit()` call |
| 9 | Coordinates converted via `convertCoordinates()` | ✅ Wraps result with conversion |
| 10 | No breaking changes to existing endpoint | ✅ Existing `/gprmc/coordinates/:imei` untouched |

### Notes

- No test framework is configured in this project (per testing-standards.md). Manual verification via `pnpm dev` + curl is recommended.
- Pre-existing lint infos in `coordinates.ts` (string concatenation) are unrelated to this work item.

---

## Work Item: app-history-screen

### Test Results

- Passed: N/A (no test framework configured)
- Failed: N/A
- Skipped: N/A

### Code Quality
- Lint: Clean
- New dependency installed: `@react-native-community/datetimepicker@^9.1.0`

### Acceptance Criteria Validation

| # | Criterion | Status |
|---|-----------|--------|
| 1 | New Expo Router page at `app/history.tsx` | ✅ Created with date/time pickers, list, and map views |
| 2 | Date and time pickers for start and end | ✅ Using `@react-native-community/datetimepicker` (date + time modes) |
| 3 | Selected vehicle context from query params | ✅ `imei` passed via `useLocalSearchParams()` |
| 4 | API call to `GET /api/gprmc/history/:imei?startDate=...&endDate=...` | ✅ Via `tryAuthRequest` pattern |
| 5 | List view with date, time, speed | ✅ FlatList with date/time/speed columns, tap navigates to `/map` |
| 6 | Tapping item navigates to map detail | ✅ `router.push(\`/map?latitude=...&longitude=...\`)` |
| 7 | Map view with polyline route | ✅ `MapView` + `Polyline` connecting all coordinates |
| 8 | Toggle button to switch views | ✅ Toggle between "Lista" and "Mapa" views |
| 9 | Loading state | ✅ `ActivityIndicator` while fetching |
| 10 | Error state | ✅ Via `ErrorPopupContext.showError` |
| 11 | Uses `tryAuthRequest` pattern | ✅ Auto-refreshes on 401 |

### Notes

- Navigation entry point added to `app/index.tsx` as a floating button (bottom-right, "H") when a vehicle is selected
- No test framework configured — manual verification via Expo Go recommended
