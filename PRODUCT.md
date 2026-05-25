# RastroApp

## Register

product

## Users

Portuguese-speaking fleet managers and vehicle owners in Brazil. They use RastroApp daily to monitor vehicle locations, review position history, and verify operational data. They work on mobile devices in the field and at a desk. The primary job: quickly see where a vehicle is, was, and how fast it's moving — with minimal friction.

## Product Purpose

Vehicle GPS tracking and history for Brazilian fleet managers. RastroApp connects to an existing GPS tracking database, authenticates users from a legacy cliente system, and surfaces the last 10 coordinates per vehicle plus searchable position history with polyline routes on Google Maps. Success looks like: a fleet manager opens the app, finds any vehicle's location in under 5 seconds.

## Brand Personality

Modern, clean, fast. The interface conveys professional confidence — no gimmicks, no decoration without purpose. Dark but not theatrical. Blue primary as a calm anchor, not an attention grab. Every screen prioritizes the data that matters: vehicle name, coordinates, speed, time.

## Anti-references

- Dense gauge-filled dashboards common in legacy fleet tools (Traccar, etc.)
- "Hacker terminal" dark mode with neon green on black
- Generic white-label GPS tracking templates
- Map-only interfaces that bury the list/history views
- Gamified or playful UI elements (confetti, rewards, cartoon icons)
- Oversized card grids repeating the same icon+heading+text pattern

## Design Principles

1. **Data first, chrome second.** Every pixel that isn't data is a pixel wasted. Hierarchy leads with coordinates, speed, time, and vehicle identity. Icons and borders support, never compete.
2. **Confident darkness.** Dark mode as a deliberate choice for outdoor/in-vehicle readability, not as a style statement. High contrast, tinted neutrals, no glow effects.
3. **Professional restraint.** The app is a tool, not a showcase. Avoid decorative flourishes, excessive animations, and anything that slows the user's primary task.
4. **Finger-friendly by default.** Touch targets at minimum 44pt. Key actions always within thumb reach. The horizontal account selector and coordinate list prioritize one-handed use.
5. **Predictable navigation.** Every screen fits the mental model: vehicles → coordinates → map/history. No surprises, no deep nesting, no modal-as-first-thought.

## Accessibility & Inclusion

- WCAG AA minimum (contrast >= 4.5:1 for text, >= 3:1 for large text and UI components)
- Touch targets >= 44pt
- Screen reader support for key actions and data
- Support system reduced-motion setting
- Color is never the sole differentiator (speed values, dates, and labels are always shown as text)
