# Feature: Settings & theming

## Purpose
Let the user control application-level preferences — visual theme and interface language — at
`/dashboard/settings` (and, for language, wherever the language switcher is exposed).

## Actors
Any signed-in user.

## Behavior
- **Theme:** switch between light and dark; the choice is applied immediately and persists across
  sessions (via `ThemeService` from the design system).
- **Language:** switch between English and Polish at runtime; the choice persists in `localStorage`.

## Acceptance criteria
- **Given** the settings surface, **when** the user selects a theme, **then** the UI updates
  immediately and the preference is restored on next load.
- **Given** the language switcher, **when** the user selects Polish, **then** all user-facing text
  re-renders via Transloco `pl` keys without a full reload, and the choice persists.
- **Given** a missing translation key, **then** behavior follows the i18n fallback policy in
  [`internationalization.md`](../guides/internationalization.md) (default language `en`).

## Data touched
Client-side only: `ThemeService` state and `localStorage` (theme + active language). No Firestore
collection.

## Dependencies
Design-system `ThemeService`; Transloco. Mechanics are owned by
[`internationalization.md`](../guides/internationalization.md) and the design-system docs — not restated
here.

## Out of scope
Adding new languages or theme tokens (design-system contribution — see
[`CONTRIBUTING.md`](../../libs/design-system/CONTRIBUTING.md)).
