# Question Randomizer (frontend)

Angular frontend for the Question Randomizer interview-preparation tool.

- **What it is, who it's for, why** → [`docs/overview.md`](docs/overview.md)
- **How it's built (structure & tech decisions)** → [`docs/architecture.md`](docs/architecture.md)
- **What it does (feature specs)** → [`docs/features/`](docs/features/)
- **Working in this repo as an agent** → [`CLAUDE.md`](CLAUDE.md)

This README is intentionally limited to running the app. Everything descriptive lives in the
spec under [`docs/`](docs/) — see the map in [`CLAUDE.md`](CLAUDE.md).

## Prerequisites

- Node.js 20+
- A Firebase project (Email/Password auth + Firestore). Add config to
  `apps/question-randomizer/src/environments/`.
- For the AI chat feature, the backend API running locally (default `http://localhost:5000/api`).

## Quick start

```bash
npm install
npx nx serve question-randomizer   # http://localhost:4200
```

## Build / test / lint

```bash
npx nx build question-randomizer     # production build → dist/apps/question-randomizer
npx nx test  question-randomizer     # Jest unit tests
npx nx e2e   question-randomizer-e2e # Playwright e2e
npx nx lint  question-randomizer     # ESLint incl. module-boundary rules
```

## Internationalization scripts

```bash
npm run i18n:extract   # extract translation keys
npm run i18n:find      # find translation key usage
```
