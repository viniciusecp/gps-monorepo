---
id: app-history-screen
title: App - History screen
intent: vehicle-history
complexity: medium
mode: confirm
status: completed
depends_on:
  - server-history-endpoint
created: 2026-05-24T23:37:32Z
run_id: run-gps-monorepo-001
completed_at: 2026-05-25T00:38:32.195Z
---

# Work Item: App - History screen

## Description

Create a new Expo Router page for vehicle history with date/time filters, list view, and map route view. User selects start/end date+time, sees coordinates chronologically in a list (tapping opens map detail) or as a polyline route on the map, with toggle between views.

## Acceptance Criteria

- [ ] New Expo Router page at `app/history.tsx` with navigation entry point
- [ ] Date and time pickers for start (day + hour) and end (day + hour)
- [ ] Selected vehicle context carried from main screen or selectable
- [ ] API call to `GET /api/gprmc/history/:imei?startDate=...&endDate=...`
- [ ] List view showing coordinates chronologically with date, time, speed
- [ ] Tapping a coordinate item navigates to map detail (same as existing flow)
- [ ] Map view with polyline route connecting all coordinates
- [ ] Toggle button to switch between list and map views
- [ ] Works on Android and iOS
- [ ] Loading state while fetching data
- [ ] Error state if API fails or no data found
- [ ] Uses existing `tryAuthRequest` pattern for authenticated API calls

## Technical Notes

- For date picker, use `@react-native-community/datetimepicker` (cross-platform)
- Map polyline via `react-native-maps` `<Polyline>` component
- Follow existing component patterns (Colors, Spacing, Typography from theme)
- Coordinate model already exists in `common/model.ts`
- Navigation: use `router.push()` with Expo Router

## Dependencies

- server-history-endpoint (must be deployed first)
