---
id: server-history-endpoint
title: Server - History query endpoint
intent: vehicle-history
complexity: medium
mode: confirm
status: completed
depends_on: []
created: 2026-05-24T23:37:32Z
run_id: run-gps-monorepo-001
completed_at: 2026-05-25T00:33:01.379Z
---

# Work Item: Server - History query endpoint

## Description

Create a new API endpoint `GET /api/gprmc/history/:imei` with `startDate` and `endDate` query parameters to query GPS coordinates by date range. Follow existing patterns: Zod validation, JWT auth, controller, service, repository layers.

## Acceptance Criteria

- [ ] New route `GET /api/gprmc/history/:imei` registered with prefix `/api`
- [ ] Query params `startDate` and `endDate` (ISO datetime strings) validated via Zod schema
- [ ] JWT authentication via `preHandler: authenticate`
- [ ] Controller handler extracts params and delegates to service
- [ ] Service method `getCoordinatesByDateRange(imei, startDate, endDate)` queries `gprmc` table
- [ ] Query filters by `imei` AND `date BETWEEN startDate AND endDate`
- [ ] Results ordered chronologically (ASC by `date`)
- [ ] No limit on results
- [ ] Coordinates converted to decimal degrees via `convertCoordinates()`
- [ ] Works alongside existing `GET /api/gprmc/coordinates/:imei` endpoint (no breaking changes)

## Technical Notes

- Use `and()`, `gte()`, `lte()` or `between()` from Drizzle ORM for date filtering
- `gprmc.date` is a MySQL `datetime` column
- Response format: `{ coordinates: [...] }` (same as existing endpoint)
- Leverage the existing `GprmcRepository` or extend `GpsService`

## Dependencies

(none)
