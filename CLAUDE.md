# CLAUDE.md

Operating manual for AI agents working in this repository. This file contains **only** agent
directives and a map to the single-source-of-truth documents. It deliberately does **not** restate
product, architecture, or how-to-run content — those live once, in the places below.

## Documentation map (single source of truth)

Each topic has exactly one owner. Read the owner; do not duplicate its content elsewhere.

| Topic | Owner |
|-------|-------|
| What/why/who, success criteria | [`docs/overview.md`](docs/overview.md) |
| Feature behavior & acceptance criteria | [`docs/features/`](docs/features/) |
| Structure & tech decisions | [`docs/architecture.md`](docs/architecture.md) |
| Module boundary rules | [`docs/architecture.md` → Module boundaries](docs/architecture.md#module-boundaries) |
| Firestore data shapes | [`docs/schema.json`](docs/schema.json) |
| Consumed backend API contract | [`docs/api.md`](docs/api.md) |
| Internationalization | [`docs/guides/internationalization.md`](docs/guides/internationalization.md) |
| Testing | [`docs/guides/testing.md`](docs/guides/testing.md) |
| Design system | [`libs/design-system/README.md`](libs/design-system/README.md), [`libs/design-system/CONTRIBUTING.md`](libs/design-system/CONTRIBUTING.md) |
| Run / build / test commands | [`README.md`](README.md) |

## Spec-Driven Development workflow

This repo is run spec-first. The spec drives the code.

- **New feature:** write its `docs/features/<name>.md` (purpose, behavior, Given/When/Then
  acceptance criteria, data touched, out of scope) **before** implementing. Tests verify those
  criteria.
- **Changing existing behavior:** update the owning spec in the same change (or a spec PR first).
  Keep `docs/schema.json` and `docs/api.md` in step with any data/contract change.
- **Baseline caveat:** the specs under `docs/` were reverse-derived from the implementation on
  2026-07-16 to establish an SDD baseline; items marked **⚠️ DRIFT / SPEC GAP** are known
  spec-vs-code discrepancies to reconcile.
- **No duplication rule:** every fact lives in exactly one owner above; everywhere else links to it.

## Nx directives (mandatory)

This workspace has **Nx MCP** enabled. You MUST:

1. Use Nx MCP tools instead of assumptions — never rely on training-data knowledge of Nx.
2. Use Nx MCP **generators** to scaffold libraries/components — never hand-roll or run `npx nx g`
   directly.
3. Query MCP tools for current workspace state before creating or modifying Nx configuration.

## When creating a new feature

1. Write the spec first (see SDD workflow above).
2. Identify the domain (`auth`, a `dashboard` subdomain, or `shared`) — structure in
   [`docs/architecture.md`](docs/architecture.md).
3. Scaffold libraries with Nx MCP generators, following the type pattern.
4. Add TS path aliases in `tsconfig.base.json`.
5. Respect module boundaries ([`docs/architecture.md#module-boundaries`](docs/architecture.md#module-boundaries)); verify with
   `npx nx lint`.
6. Use design-system components and Transloco keys for all user-facing UI/text (owners linked in the
   map).

## MCP integrations

### nx-mcp
Authoritative Nx workspace structure, generators, and configuration guidance. Key tools:
`nx_docs` (always use for Nx questions), `nx_workspace` (architecture/project graph),
`nx_project_details`, `nx_generators`, `nx_available_plugins`, `nx_run_generator`.
Consult `nx_docs`/`nx_workspace` before creating projects/libraries or changing Nx config; never
assume Nx knowledge.

<!-- nx configuration start-->

# Nx Guidance

See nx-mcp tools for Nx workspace guidance (nx_docs, nx_workspace, nx_project_details, etc.)

<!-- nx configuration end-->
