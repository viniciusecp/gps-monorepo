## Implementation Plan for "Server - History query endpoint"

### Approach

Add a new API endpoint `GET /api/gprmc/history/:imei` with `startDate` and `endDate` query parameters. Follow existing patterns: Zod validation for query params (via `validateQuery` middleware), JWT auth via `preHandler: authenticate`, controller → service pattern. The service queries the `gprmc` table using Drizzle ORM with `and()`, `gte()`, `lte()` for date filtering, ordered ASC, no limit. Coordinates converted via `convertCoordinates()`.

### Files to Create

- `server/src/validators/history.ts` — Zod schema for `{ startDate: z.string(), endDate: z.string() }` (ISO datetime)

### Files to Modify

- `server/src/routes/coordinates.ts` — Add `GET /gprmc/history/:imei` route with `preHandler: authenticate`, `preValidation: validateQuery(historySchema)`
- `server/src/controllers/gps-controller.ts` — Add `getHistory` handler extracting params + query, delegating to service
- `server/src/services/gps-service.ts` — Add `getCoordinatesByDateRange(imei, startDate, endDate)` method using `and(gte(gprmc.date, startDate), lte(gprmc.date, endDate))`, ordered ASC, no limit

### Tests

No test framework configured per testing-standards.md. Manual verification via existing `pnpm dev` + curl.

### Acceptance Criteria Validation

- [x] New route `GET /api/gprmc/history/:imei` registered with prefix `/api`
- [x] Query params `startDate` and `endDate` validated via Zod schema
- [x] JWT authentication via `preHandler: authenticate`
- [x] Controller handler extracts params and delegates to service
- [x] Service method `getCoordinatesByDateRange(imei, startDate, endDate)` queries `gprmc` table
- [x] Query filters by `imei` AND `date BETWEEN startDate AND endDate`
- [x] Results ordered chronologically (ASC by `date`)
- [x] No limit on results
- [x] Coordinates converted to decimal degrees via `convertCoordinates()`
- [x] Works alongside existing `GET /api/gprmc/coordinates/:imei` endpoint (no breaking changes)

---

## Work Item: app-history-screen

### Approach

Create a new Expo Router page `app/history.tsx` with date/time pickers for start/end range, a list view showing coordinates chronologically, and a map view with a polyline route. Toggle between list and map views. Follow existing app patterns: dark theme via `Colors`/`getSpacing`/`getTypography`, API calls via `tryAuthRequest`, navigation via `router.push()`.

### Files to Create

- `app/app/history.tsx` — Expo Router page with date/time pickers, list, map, toggle

### Files to Modify

- `app/app/index.tsx` — Add navigation entry (button or link) to `/history` with `selectedImei` as query param
- `app/components/coordinates/coordinate-item.tsx` — Reuse or adapt (tapping navigates to `/map`)

### Dependencies

- `@react-native-community/datetimepicker` — already installed
- `react-native-maps` Polyline — already used in app

### Implementation Details

- Page receives `imei` via `useLocalSearchParams()`
- Date/time pickers: `@react-native-community/datetimepicker` for start and end
- API call: `tryAuthRequest` to `GET /api/gprmc/history/:imei?startDate=...&endDate=...`
- List view: FlatList with items showing date/time/speed (similar to CoordinateItem)
- Tap on item: navigates to `/map?latitude=...&longitude=...`
- Map view: `MapView` + `Polyline` connecting all coordinates
- Toggle button: switches between list and map views
- Loading state: `ActivityIndicator`
- Error state: via `ErrorPopupContext.showError`
- Empty state: message when no coordinates found

### Acceptance Criteria Validation

- [ ] New Expo Router page at `app/history.tsx`
- [ ] Date and time pickers for start (day + hour) and end (day + hour)
- [ ] Selected vehicle context from query params
- [ ] API call to `GET /api/gprmc/history/:imei?startDate=...&endDate=...`
- [ ] List view with date, time, speed
- [ ] Tapping item navigates to map detail
- [ ] Map view with polyline route
- [ ] Toggle button to switch views
- [ ] Loading state
- [ ] Error state
- [ ] Uses `tryAuthRequest` pattern
