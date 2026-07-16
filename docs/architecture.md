# Architecture — worse-and-pricier (frontend)

How this frontend is structured and the technology decisions behind it. Product context is in
[`overview.md`](overview.md); behavior is in [`features/`](features/); data shapes are in
[`schema.json`](schema.json); the consumed backend contract is in [`api.md`](api.md).

## Tech stack

| Concern | Choice |
|---------|--------|
| Framework | Angular 20 (standalone components) |
| Monorepo / build | Nx |
| State | @ngrx/signals (SignalStore), normalized entities |
| Auth & data | Firebase — Authentication + Firestore (`@angular/fire`) |
| AI features | Backend AI Agent HTTP API (see [`api.md`](api.md)) |
| Styling | SCSS + in-repo design system (`libs/design-system/`) |
| i18n | Transloco — English + Polish (details: [`guides/internationalization.md`](guides/internationalization.md)) |
| Testing | Jest (unit), Playwright (e2e) — details: [`guides/testing.md`](guides/testing.md) |

## Two upstream data surfaces (important)

This frontend does **not** talk to a single backend. It has two distinct upstream surfaces, and
which one a feature uses is a deliberate architectural fact:

1. **Firestore, accessed directly** (via `@angular/fire`) for the core domain data —
   questions, categories, qualifications, and randomization state. There is no backend hop; the
   client reads/writes Firestore collections directly, scoped by `userId`. The collections and
   shapes are specified in [`schema.json`](schema.json).
2. **Backend AI Agent HTTP API** (`http://localhost:5000/api` by default, configured via
   `AppConfig.aiAgentApiUrl`) used **only** by the AI chat feature. Requests carry a Firebase ID
   token as a bearer credential. The contract is specified in [`api.md`](api.md).

> ⚠️ **DRIFT NOTE.** The system-level coordination repo states "Frontend talks ONLY to Backend
> API via HTTPS." That is **not** how this app currently works — core CRUD is direct-to-Firestore,
> and only AI chat uses the backend. Either the code or the coordination doc must change; this
> spec records the *current* reality. Flagged for reconciliation.

## Monorepo layout

- `apps/question-randomizer/` — application entry point (bootstrap, environments, routes, i18n assets).
- `apps/question-randomizer-e2e/` — Playwright e2e project.
- `libs/design-system/` — publishable design system: `tokens/`, `styles/`, `ui/`.
- `libs/question-randomizer/` — application libraries, organized by domain then type.

### Domains

`auth`, and under the `dashboard` namespace: `question`, `category`, `qualification`,
`randomization`, `interview`, `ai-chat`, `settings`, plus `dashboard/shared` for cross-cutting
stores/services. `question-randomizer/shared` holds app-wide utilities (e.g. `APP_CONFIG`, auth
guards, user store).

### Library types

`shell` (routes + containers), `feature` (smart components), `ui` (presentational),
`data-access` (stores, services, repositories, Firebase), `util` (models, helpers), `app`, `e2e`,
`styles`. Dependency direction is enforced by ESLint `@nx/enforce-module-boundaries` — the full
rules are the [Module boundaries](#module-boundaries) section below.

## Module boundaries

Enforced by ESLint `@nx/enforce-module-boundaries` (config: `eslint.config.mjs:13-127`).
`npx nx lint` fails the build on violation; `enforceBuildableLibDependency: true` also requires
buildable libs to depend only on buildable libs. Every library carries a **type** tag and a
**scope** tag.

### Tags

- **Type tags:** `type:ui`, `type:feature`, `type:data-access`, `type:util`, `type:shell`,
  `type:app`, `type:e2e`, `type:styles`, `type:design-system`.
- **Scope tags:** `scope:auth`, `scope:shared`, `scope:design-system`, `scope:dashboard`,
  `scope:dashboard-shared`, `scope:question`, `scope:category`, `scope:qualification`,
  `scope:randomization`, `scope:interview`, `scope:dashboard-ai-chat`, `scope:settings`.

### Type-based dependency rules

| Type | May depend on | Rationale |
|------|---------------|-----------|
| `ui` | `ui`, `util`, `styles` | Presentational & reusable; no features/data-access. |
| `feature` | `ui`, `data-access`, `util` | Smart components composing UI + data. |
| `data-access` | `data-access`, `util`, `ui` | State/services/repos; `ui` only for shared types. |
| `shell` | `shell`, `feature`, `ui`, `data-access`, `util`, `styles` | Composes/configures routes. |
| `util` | `util` | Foundational; no external deps (prevents cycles). |
| `styles` | `util` | Tokens only; no UI. |
| `app` | `*` | Top-level entry point. |
| `e2e` | `app` | Tests the app as a whole. |
| `design-system` | `ui`, `styles`, `util` | Meta-package bundling components/styles/tokens. |

### Domain isolation

All dashboard domains (`question`, `category`, `qualification`, `randomization`, `interview`,
`dashboard-ai-chat`, `settings`) **cannot depend on each other** — each is a bounded context.
Shared concerns must be extracted to `scope:dashboard-shared`, which every domain **may** depend on
(e.g. `category-list.store.ts`, `question-list.store.ts`, shared models). Pattern in
`eslint.config.mjs:65-124`.

### Common violations → fixes

- **Feature → another feature:** extract shared logic to a `data-access`/`util` lib.
- **UI → data-access:** pass data via component inputs; keep UI presentational.
- **Dashboard domain → another domain:** extract to `dashboard-shared`.
- **Correct:** any lib → `util`; `feature` → `ui`/`data-access`; dashboard domain → `dashboard-shared`.

## State management

@ngrx/signals SignalStores. Each store uses a normalized shape: `entities: Record<string, T>`,
`ids: string[]`, computed selectors, and CRUD methods. Core stores live in
`libs/question-randomizer/dashboard/shared/data-access/src/store/`
(`category-list`, `qualification-list`, `question-list`, `randomization`); AI chat has its own
store under the `ai-chat` domain.

**Shared-store decision:** the `DashboardShellComponent` provides the core stores once, at the
dashboard shell level, so every dashboard route shares one instance. This gives a single source of
truth across routes, cross-domain cache updates without refetching, and optimistic client updates.
Trade-off: `/settings` gets stores it doesn't need — accepted for simplicity.

## Data-access pattern

`repository` (raw Firestore/HTTP I/O) → `service` (business logic) → `store` (state). `mapper`
services translate between persistence documents and domain models (e.g. the randomization model
stores `currentQuestion` in the client but persists `currentQuestionId`).

## Routing

Lazy-loaded, domain-organized. `/` redirects to `/dashboard/randomization`. `/auth/*` is public
(login, registration, email verify/verified/not-verified). `/dashboard/*` is guarded by
`AuthVerifiedCanActivate` and hosts `questions`, `categories`, `qualifications`, `randomization`
(default), `interview`, `ai-chat`, `settings`. Route tables:
`app.routes.ts`, `auth-shell.routes.ts`, `dashboard-shell.routes.ts`.

## Cross-cutting

- **Design system** — use its components instead of bespoke UI. Docs: `libs/design-system/README.md`;
  contributing: [`../libs/design-system/CONTRIBUTING.md`](../libs/design-system/CONTRIBUTING.md).
- **i18n** — all user-facing text via Transloco keys (en/pl). Details: [`guides/internationalization.md`](guides/internationalization.md).
- **Config** — `APP_CONFIG` injection token (`AppConfig`) carries Firebase config and `aiAgentApiUrl`.
