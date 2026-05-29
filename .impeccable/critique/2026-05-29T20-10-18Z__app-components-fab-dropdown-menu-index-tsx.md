---
target: app/components/fab-dropdown-menu/index.tsx
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-05-29T20-10-18Z
slug: app-components-fab-dropdown-menu-index-tsx
---
# Critique: app/components/fab-dropdown-menu/index.tsx

## Design Health Score: 27/40

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Icon toggles (more-vert → close), overlay fades in, options stagger-animate; clear state communicated |
| 2 | Match System / Real World | 3 | Standard mobile FAB speed-dial pattern, Portuguese labels, recognizable icons |
| 3 | User Control and Freedom | 3 | Tap overlay to dismiss, tap FAB to toggle; clear escape at every step |
| 4 | Consistency and Standards | 3 | Follows design system (Colors.primary buttons, spacing tokens); FAB is a known pattern |
| 5 | Error Prevention | 3 | Menu-only; no destructive actions to prevent |
| 6 | Recognition Rather Than Recall | 3 | Icons + text labels on every option; no hidden gestures |
| 7 | Flexibility and Efficiency | 2 | Single path — tap FAB + pick option. No long-press shortcuts, no customization |
| 8 | Aesthetic and Minimalist Design | 3 | Clean and simple; solid blue option buttons feel a touch heavy but align with the button-primary spec |
| 9 | Error Recovery | 3 | Close via overlay tap; no error states in this component |
| 10 | Help and Documentation | 1 | None — FAB is self-explanatory, but the heuristic applies to the system level |
| **Total** | | **27/40** | **Acceptable** |

## Anti-Patterns Verdict

**LLM assessment**: This doesn't look AI-generated. The component follows a well-established mobile pattern (Material speed-dial FAB), uses the project's design tokens consistently, and has thoughtful touches like reduce-motion detection and staggered entrance animation. No absolute bans violated. No product register slop. The only tell is the hardcoded `80` — a human oversight, not a model reflex.

**Deterministic scan**: Unavailable — the bundled detector isn't present in this project setup.

## Overall Impression

A competent, unremarkable implementation of a standard mobile pattern. It works, it's accessible enough, it animates nicely. The biggest opportunity is tightening the details: replace the hardcoded `80` with computed positioning so the component is truly resilient to design-system changes, and fix the initial reduce-motion flash. The component doesn't embarrass itself, but it doesn't elevate the product either.

## What's Working

1. **Reduce-motion respect.** `AccessibilityInfo.isReduceMotionEnabled()` is checked on mount and subscribed to for changes. When enabled, all animations are skipped — values jump directly to their final state. This is the bar every component should clear, and this one does.

2. **Gesture-discoverable close.** Tapping the overlay dismisses the menu. The overlay covers the full screen with `pointerEvents="auto"`, so the user doesn't need to aim for a small close target. The `StyleSheet.absoluteFill` on the TouchableOpacity guarantees it.

3. **Staggered motion feels considered.** Options animate in with per-item delay (50ms) and out with reverse-index delay (30ms), creating a subtle cascade. The product register recommends 150–250ms for transitions; the menu uses 150–200ms, which lands within range without feeling rushed or slow.

## Priority Issues

### [P1] Hardcoded `bottom: 80` for options position

**What**: Line 243: `bottom: 80` is a raw number, not a theme token or computed value.

**Why it matters**: The options container should stack directly above the FAB with a defined gap. `80` is a magic number that assumes the FAB height (56) + a gap (24). If `Spacing.px11` changes, or the FAB resizes, the menu will float away from its anchor.

**Fix**: Derive from the FAB's dimensions: `bottom: Spacing.px11 + Spacing.px5 + gap` or compute dynamically. At minimum, use `Spacing.px11 + Spacing.px6` (56 + 24 = 80) to express the intent.

### [P1] Initial reduce-motion flash

**What**: `useState(false)` for `reduceMotion`, then `useEffect` fetches the real value asynchronously. If the user has reduce-motion enabled, the first openMenu call will animate before the detection resolves.

**Why it matters**: Users who need reduced motion get the full animation on first interaction. This is a genuine accessibility bug — the component is supposed to respect this setting but doesn't on the first frame.

**Fix**: Initialize `reduceMotion` to `true` (safer default), or use the synchronous `AccessibilityInfo.isReduceMotionEnabled()` result at module init.

### [P2] Overlay TouchableOpacity missing accessibility label

**What**: The full-screen dismiss overlay (line 139–143) has no `accessibilityLabel`.

**Why it matters**: Screen reader users will encounter an unlabeled interactive element covering the screen. They may not know it dismisses the menu.

**Fix**: Add `accessibilityLabel="Fechar menu"`.

### [P2] Redundant `marginBottom` on `optionWrapper` + `gap` on `optionsContainer`

**What**: `optionsContainer` has `gap: Spacing.px3` (12) and each `optionWrapper` has `marginBottom: Spacing.px1` (4). The last item gets an extra 4px below it.

**Why it matters**: Inconsistent spacing between the last option and the FAB button. The gap already handles inter-option spacing; the marginBottom adds non-uniform space.

**Fix**: Remove `marginBottom` from `optionWrapper`. Let `gap` on the container handle all inter-option spacing.

### [P3] Options could overflow the screen

**What**: The `optionsContainer` is a plain `View` with no `maxHeight` or scroll behavior. With 5+ long-label options, the menu could extend past the screen top.

**Why it matters**: Obscured options are unreachable. No feedback that more options exist above the fold.

**Fix**: Add `maxHeight` with a scrollable container, or limit visible options and paginate.

## Persona Red Flags

### Casey (Distracted Mobile User)
- Bottom thumb zone: FAB is bottom-right, options slide up — excellent one-handed reach ✓
- Touch targets: All ≥ 44pt ✓
- No red flags for Casey — this component is well-suited for mobile use.

### Alex (Power User)
- No alternative access: Only one way to open the menu: tap FAB. No long-press, no swipe. For a daily driver app, Alex would appreciate a faster path to common actions — but this is a limitation of the FAB pattern itself, not the implementation.
- Staggered animation: Each of 4 options incurs 50ms delay. Alex opening the menu daily accumulates 1-2 seconds of unnecessary wait per session. On reduce-motion, this vanishes — but Alex may not have it enabled.

### Sam (Screen Reader User)
- Overlay dismiss is unlabeled ✗
- Reduce motion respected ✓
- Options have labels and roles ✓
- No focus management: When the menu opens, focus isn't programmatically moved to the first option. Sam must discover the options by exploring from wherever focus was previously.

## Minor Observations

- The FAB `onPressIn`/`onPressOut` animation (scale 0.96 → 1.0) is nearly imperceptible at 80ms. Consider whether it's worth the ref overhead.
- `optionAnims` inside the useCallback closures is safe (useMemo dependency), but the `options` dependency on `useMemo` and `useCallback` means every options array identity change recreates all animated values. If the parent passes an inline array, this happens every render. Add `useMemo` at the call site.

## Questions to Consider

- Does this need to be a FAB? Or would a bottom sheet or context menu serve the same options with less visual weight?
- What would the "two-tap" version of this look like — tap FAB, immediately tap option without waiting for stagger animation?
- If there's only 1–2 options, should the FAB expand inline rather than in a separate animated layer?
