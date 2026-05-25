---
name: RastroApp
description: Vehicle GPS tracking for Brazilian fleet managers
colors:
  signal-blue: "#1447e6"
  signal-blue-light: "#4a75f0"
  signal-blue-dark: "#0e3ab8"
  midnight-surface: "#0a0a0a"
  dark-slate: "#1a1a1a"
  pitch-void: "#050505"
  white-smoke: "#fafafa"
  mist: "#fafafa80"
  pale-mist: "#fafafa40"
  faint-border: "#ffffff26"
  subtler-border: "#ffffff12"
  success-green: "#00c853"
  warning-amber: "#ffbb33"
  error-red: "#ff4444"
  info-blue: "#33b5e5"
  pressed-state: "#ffffff10"
  focused-state: "#ffffff1a"
  dark-shadow: "#00000060"
  dark-overlay: "#00000080"
typography:
  display:
    fontFamily: System
    fontSize: 32
    fontWeight: 700
  headline:
    fontFamily: System
    fontSize: 28
    fontWeight: 700
  title:
    fontFamily: System
    fontSize: 24
    fontWeight: 700
  body:
    fontFamily: System
    fontSize: 16
    fontWeight: 400
  label:
    fontFamily: System
    fontSize: 12
    fontWeight: 400
rounded:
  sm: 4
  md: 8
  lg: 12
spacing:
  px1: 4
  px2: 8
  px3: 12
  px4: 16
  px5: 20
  px6: 24
  px7: 28
  px8: 32
  px9: 40
  px10: 48
  px11: 56
  px12: 64
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.white-smoke}"
    rounded: "{rounded.md}"
    typography: "{typography.title}"
    padding: 12px 32px
  button-primary-disabled:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.mist}"
    rounded: "{rounded.md}"
    typography: "{typography.title}"
    padding: 12px 32px
  toggle-button:
    backgroundColor: "{colors.midnight-surface}"
    textColor: "{colors.white-smoke}"
    rounded: "{rounded.md}"
    padding: 4px 16px
  toggle-button-active:
    borderColor: "{colors.signal-blue}"
    textColor: "{colors.signal-blue}"
    rounded: "{rounded.md}"
    padding: 4px 16px
  card-surface:
    backgroundColor: "{colors.dark-slate}"
    textColor: "{colors.white-smoke}"
    rounded: "{rounded.md}"
    padding: 8px 8px
  input-field:
    backgroundColor: "{colors.dark-slate}"
    textColor: "{colors.white-smoke}"
    rounded: "{rounded.md}"
    padding: 20px 12px
  error-popup:
    backgroundColor: "{colors.pitch-void}"
    textColor: "{colors.white-smoke}"
    rounded: "{rounded.lg}"
    padding: 24px 24px
---

# Design System: RastroApp

## 1. Overview

**Creative North Star: "The Fleet Console"**

RastroApp is the fleet manager's quiet command post — dark by necessity (outdoor readability, in-vehicle glare reduction), not by fashion. The interface recedes behind the data: vehicle coordinates, speed, time, and route history. Signal Blue appears sparingly as a calm anchor — the accent that says "this is interactive" without demanding attention.

This system explicitly rejects the clichés of GPS tracking tools: no glowing neon trackers, no gauge-cluttered dashboards, no fake-3D maps. It also refuses "hacker terminal" dark mode (neon green on black) and over-gamified UI. The surface is dark, the typography is crisp, the hierarchy is purely data-driven.

**Key Characteristics:**
- Dark-toned layered depth (three background levels), not shadows
- One restrained blue accent (≤10% of any screen)
- System-native typography — no custom fonts, no decorative type
- 8px grid spacing throughout
- Data rows as the primary content unit, not cards

## 2. Colors: The Fleet Console Palette

The palette is a dark, cool-toned system with a single vivid blue accent. Every neutral is subtly tinted toward blue (chroma 0.002–0.005 in OKLCH) so the dark mode feels deliberate, not like inverted defaults.

### Primary
- **Signal Blue** (`#1447e6` / oklch(51% 0.18 265)): The sole accent. Buttons, selected states, active toggles, the pulsing empty-state icon. Never used for body text or backgrounds.

### Neutral
- **Midnight Surface** (`#0a0a0a` / oklch(7% 0.002 265)): The primary background. Everything sits on this.
- **Dark Slate** (`#1a1a1a` / oklch(15% 0.004 265)): The secondary surface. Cards, inputs, the account selector bar. One step above Midnight Surface for visual containment.
- **Pitch Void** (`#050505` / oklch(3% 0.001 265)): The deepest background. Used for modal popups and overlay content to create clear depth separation.
- **White Smoke** (`#fafafa` / oklch(97% 0.005 265)): Primary text color. High contrast on all dark surfaces.
- **Mist** (`#fafafa80` / oklch(97% 0.005 265) at 50%): Secondary text for hints, labels, and metadata.
- **Pale Mist** (`#fafafa40` / oklch(97% 0.005 265) at 25%): Tertiary text for placeholders.

### Border
- **Faint Border** (`#ffffff26` / white at 15%): The standard 1px boundary for cards, inputs, buttons, and containers.
- **Subtler Border** (`#ffffff12` / white at 7%): Used sparingly on the login card for a gentler edge.

### Semantic
- **Success Green** (`#00c853`), **Warning Amber** (`#ffbb33`), **Error Red** (`#ff4444`), **Info Blue** (`#33b5e5`): Standard status signals. Error Red is the most frequently used (invalid credentials, network failures, expired sessions).

### Interactive
- **Pressed State** (`#ffffff10` / white at 6%): Touch feedback overlay. Applied programmatically, not as a standalone color.
- **Focused State** (`#ffffff1a` / white at 10%): Focus ring replacement for accessibility.

### Named Rules
**The One Accent Rule.** Signal Blue covers ≤10% of any screen. Its rarity is what gives it meaning. If too much of the UI is blue, the accent becomes noise.

**The Dark Intent Rule.** Every neutral is tinted toward blue, even at near-black. Pure grayscale would read as "unstyled dark mode." The blue cast is the difference between deliberate and default.

## 3. Typography

**Display Font:** System (SF Pro on iOS, Roboto on Android)
**Body Font:** System (same family throughout)

**Character:** Single-family system typography with weight contrast as the primary hierarchy tool. No custom fonts, no decorative type. The font family is the OS default so rendering is always razor-sharp and the system respects user font-size preferences natively.

### Hierarchy
- **Display** (Bold, 32px, 1.2 line-height): Screen titles only — "RastroApp" on the login screen. Never used for body content.
- **Headline** (Bold, 28px, 1.2): Section headers. Currently unused; reserved for future feature-group headers.
- **Title** (Bold, 24px, 1.2): Subsection headers, error popup titles, and the vehicle badge label text.
- **Body** (Regular, 16px, 1.5): The workhorse. Coordinate data, input values, button labels (body size, bold weight). Max line length is not constrained in native; the screen width is the limit.
- **Body Small** (Regular, 14px, 1.5): Secondary information, picker labels, date/time range labels.
- **Label** (Regular, 12px, 1.5): Captions, overline text, supplementary metadata.
- **Button** (Bold, 22px, 1.2): Primary action buttons. Bold weight for prominence.

### Named Rules
**The Scale Rule.** Hierarchy is communicated purely through weight (bold vs regular) and size (32 → 28 → 24 → 22 → 16 → 14 → 12). The ratio between adjacent steps is ≥1.25 for the top four levels, narrowing toward the body-and-below tiers.

## 4. Elevation

This system uses **tonal layering** as its primary depth cue, not drop shadows. Three background lightness levels create a clear stacking order: Pitch Void (deepest, modal interiors) → Midnight Surface (base, screen backgrounds) → Dark Slate (raised, cards and inputs). Each step is ~8pp lightness apart in OKLCH, enough to read as a distinct layer without fighting the dark background.

Shadows appear only as a response to interaction. The single shadow token (`rgba(0,0,0,0.38)` at y-offset 4px, blur 12px) is reserved for the error popup modal — its sole job is to separate the modal from the overlay, ensuring the popup feels like it floats above everything.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Cards, account badges, and coordinate rows sit directly on their background with only a 1px faint-border edge. Depth is a function of lightness, not shadow. Shadows signal state change, not resting position.

## 5. Components

### Buttons
- **Shape:** Gently curved corners (8px radius).
- **Primary ("Acessar", "Buscar"):** Signal Blue background, White Smoke text, Title (22px Bold). Vertical padding 12px. No border. No shadow at rest.
- **Disabled:** Same background, Mist text (50% opacity white). No style change beyond text fade.
- **States:** No hover in mobile. On press, the button dims via the OS touch highlight. No custom press animation.

### Toggle Buttons (List/Map switch in history)
- **Shape:** Gently curved corners (8px radius). Faint-border stroke.
- **Default:** Transparent background, White Smoke text and icon.
- **Active:** Faint-border stroke becomes Signal Blue. Text and icon switch to Signal Blue. Bold weight on text.
- **Internal spacing:** 4px vertical, 16px horizontal. Small gap (4px) between icon and label.

### Cards / Containers
- **Corner Style:** Gently curved corners (8px radius).
- **Background:** Dark Slate (the lighter dark surface).
- **Shadow Strategy:** None. Flat by default (see The Flat-By-Default Rule).
- **Border:** 1px Faint Border (`#ffffff26`).
- **Internal Padding:** 8px horizontal, 12px vertical for data rows. 12px horizontal, 24px vertical for the login card.

### Inputs / Fields
- **Style:** Dark Slate background, 1px Faint Border stroke, 8px radius.
- **Text:** White Smoke at Body (16px). Placeholder text at Pale Mist (25% opacity).
- **Vertical Padding:** 20px. Horizontal padding: 12px.
- **Focus:** No custom focus ring. The OS default field highlight handles focus indication.
- **Error / Disabled:** Error state shows a semantic error message below the field (not a border color change). Disabled fields are currently unused.

### Account Badges (Horizontal Selector)
- **Shape:** No container. The badge is just an icon (24px FontAwesome6) + Title (24px) text, centered vertically with a 4px gap.
- **Inactive:** Icon and text at Mist (50% opacity white).
- **Active (selected vehicle):** Icon and text at Signal Blue.
- **User badges** always show at Mist regardless of selection — the selected state only applies to vehicle badges.
- **Spacing:** 12px horizontal margin between badges. The parent ScrollView sits inside a Dark Slate container with 8px curved corners and 8px vertical padding.

### Error Popup
- **Shape:** Rounded corners (12px radius — the system's largest radius).
- **Background:** Pitch Void (deepest dark). 1px Faint Border.
- **Text:** Title header (24px Bold, White Smoke). Body message (16px Regular, Mist). OK button reuses the primary button style.
- **Entrance:** Spring animation (damping 15, stiffness 200) scaling from 0 to 1. The overlay fades in.
- **Width:** 80% of screen. Max horizontal margin 20px.

### History Float Button
- **Position:** Bottom-right corner of the screen. Absolute positioning.
- **Icon:** FontAwesome6 clock-rotate-left at 24px, White Smoke.

### DateTime Picker Trigger
- **Style:** Dark Slate background, 1px Faint Border, 8px radius. 8px vertical padding, 8px horizontal padding.
- **Contents:** Small icon (16px) + Body Small label (14px) in a row, 8px gap.

## 6. Do's and Don'ts

### Do:
- **Do** use Signal Blue sparingly — buttons, selected states, and the empty-state car icon only. Let the data be the focal point.
- **Do** use tonal layering for depth: Midnight Surface (base), Dark Slate (raised), Pitch Void (deepest).
- **Do** keep the 8px grid. All spacing, padding, and gaps derive from the px2–px12 scale.
- **Do** use system fonts. Custom typefaces add download weight and rendering risk with no benefit for a data-first tool.
- **Do** show coordinates, speed, and time as text — color is never the sole differentiator.
- **Do** use the error popup for all error states: consistent spring entrance, dark overlay, clear title+message+OK structure.

### Don't:
- **Don't** use Signal Blue for backgrounds, borders on non-interactive elements, or body text. The One Accent Rule applies.
- **Don't** add drop shadows to cards, account badges, or coordinate rows at rest. They are flat surfaces.
- **Don't** use gauge clusters, widget walls, or dense dashboard layouts. The app has two content modes: a vertical list of data rows and a full-screen map.
- **Don't** use neon green, purple gradients, or glassmorphism effects. The dark mode is refined, not theatrical.
- **Don't** use border-left or border-right greater than 1px as a colored accent stripe on any card, list item, or container.
- **Don't** use modal as the first thought for new interactions. Exhaust inline alternatives first (the current codebase already follows this well).
- **Don't** wrap content in a card unless it needs visual grouping. The login form sits in a card with Subtler Border; the coordinate list does not.
- **Don't** add decorative animations. The empty-state car pulse and the error popup spring are the only two intentional animations in the system.
