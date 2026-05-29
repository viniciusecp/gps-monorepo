# Work Item: Viewport-Triggered Coordinate Animation

## Description
Modify CoordinateItem to accept an `animateOnMount` prop, and update history.tsx FlatList with `onViewableItemsChanged` to track initially viewable indices.

## Complexity
Low

## Mode
Autopilot

## Acceptance Criteria
1. `CoordinateItem` accepts optional `animateOnMount` prop (defaults to `true`)
2. When `animateOnMount={false}`, the item renders at full opacity + final position immediately
3. History screen FlatList tracks viewable indices via `onViewableItemsChanged`
4. Items beyond the initial viewable set mount with `animateOnMount={false}`
5. Items that have been seen once never re-animate on scroll-back
6. Main screen (`coordinates/index.tsx`) unchanged — all items animate
