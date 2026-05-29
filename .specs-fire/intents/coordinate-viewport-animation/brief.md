# Intent Brief: Coordinate Viewport-Triggered Animation

## Goal
Make CoordinateItem's entrance animation play **only when items enter the viewport for the first time**. Items rendered beyond the initial viewport (e.g., after scrolling down in the history screen) should mount already visible, with no animated entrance.

## Context
- `CoordinateItem` currently uses `index * 60ms` staggered delay for all items
- Works well on main screen (~10 items), but on history screen (hundreds) off-screen items take too long to appear when scrolling back up
- Items 100+ have 6+ second delays before they become visible

## User Preferences
- Initial viewport items (~first 5-10) still get staggered entrance animation on data load
- Animation is **first-time only** — scrolling away and back should NOT replay it

## Success Criteria
- History screen: items initially in viewport animate in; items beyond viewport mount instantly
- Main screen: behavior unchanged (10 items, all in viewport, all animate)
- No re-animation on scroll-back for any previously seen item
