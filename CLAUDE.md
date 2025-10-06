# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Nx monorepo containing an Angular application called **question-randomizer** - an interview preparation tool that randomizes questions for practice. The application uses Firebase for authentication and data persistence, Angular 20, and @ngrx/signals for state management.

**Note:** This workspace has Nx MCP enabled, which provides direct access to project information, dependency graphs, and Nx commands.

## Commands

### Development
```bash
npx nx serve question-randomizer        # Run dev server (http://localhost:4200)
npx nx build question-randomizer        # Production build
npx nx build question-randomizer --configuration=development  # Development build
```

### Testing
```bash
npx nx test question-randomizer         # Run app tests
npx nx test <project-name>              # Run tests for specific lib
npx nx test <project-name> --watch      # Run tests in watch mode
npx nx test <project-name> --testFile=<file-path>  # Run single test file
npx nx run-many --target=test           # Run all tests
```

### Linting
```bash
npx nx lint question-randomizer         # Lint the app
npx nx lint <project-name>              # Lint specific project
npx nx run-many --target=lint           # Lint all projects
```

### E2E Testing
```bash
npx nx e2e question-randomizer-e2e      # Run Playwright e2e tests
```

### Code Generation
```bash
npx nx g @nx/angular:library <lib-name>             # Generate new library
npx nx g @nx/angular:component <component-name>     # Generate component
```

**Note:** Project information, dependency graphs, and available targets can be queried via Nx MCP tools instead of manual commands.

## Architecture

### Monorepo Structure

The repository follows Nx's recommended structure with domain-driven design:

- **apps/question-randomizer** - Main Angular application (entry point)
- **libs/** - Shared libraries organized by domain and type

### Library Organization Pattern

Libraries follow a layered architecture pattern organized by domain:

**Domain structure:**
- `question-randomizer/auth/` - Authentication domain (login, registration, email verification)
- `question-randomizer/dashboard/` - **Namespace for dashboard-related domains:**
  - `dashboard/questions/` - Question management domain
  - `dashboard/categories/` - Category management domain
  - `dashboard/qualifications/` - Qualification management domain
  - `dashboard/randomization/` - Question randomization domain
  - `dashboard/interview/` - Interview mode domain
  - `dashboard/settings/` - Settings domain
  - `dashboard/shared/` - Shared dashboard code (cross-cutting stores, services)
- `question-randomizer/shared/` - App-wide shared code
- `shared/` - Workspace-wide reusable libraries (ui, util, styles)

**Important:** The `dashboard/` folder is a namespace for grouping related domains, NOT a single monolithic domain. Each subfolder represents a distinct bounded context with its own features and concerns.

### Library Type Meanings

- **shell** - Route configuration and container components that compose features
- **feature** - Smart components that interact with state and services
- **ui** - Presentational components (dumb components)
- **data-access** - State management, services, repositories, Firebase integration
- **util** - Utility functions, models, types, helpers
- **app** - Application entry points
- **e2e** - End-to-end tests
- **styles** - Global styles and theming

### Module Boundaries

The workspace enforces strict module boundaries using ESLint's `@nx/enforce-module-boundaries` rule. Each library is tagged with:
- **type tag** - Defines the library type (ui, feature, data-access, util, shell, app, e2e, styles)
- **scope tag** - Defines the domain/namespace (shared, auth, category, question, etc.)

**Dependency rules:**
- **UI libraries** can only depend on: other UI, util, and styles libraries
- **Feature libraries** can depend on: UI, data-access, and util libraries
- **Data-access libraries** can depend on: other data-access, util, and UI libraries (for types)
- **Shell libraries** can depend on: shell, feature, UI, data-access, util, and styles libraries
- **Util libraries** can only depend on: other util libraries
- **Styles libraries** cannot depend on any libraries (leaf nodes)
- **Apps** can depend on any library type
- **E2E tests** can only depend on apps

**Configuration:** Module boundaries are configured in `eslint.config.mjs` and enforced via `npx nx lint`.

### State Management

The app uses **@ngrx/signals** (NgRx SignalStore) for state management, NOT the traditional Redux pattern.

Key stores are located in `libs/question-randomizer/dashboard/shared/data-access/src/store/`:
- `category-list.store.ts` - Category management with normalized state pattern
- `qualification-list.store.ts` - Qualification management
- `question-list.store.ts` - Question management
- `randomization.store.ts` - Randomization state

Each store follows a normalized state pattern with:
- `entities` - Record<string, T> for O(1) lookups
- `ids` - string[] for maintaining order
- Computed selectors for filtering, sorting, pagination
- Methods for CRUD operations

#### Shared State Architecture

The `DashboardShellComponent` provides all shared stores and services at the shell level. This architectural decision enables:

- **Single source of truth** - All dashboard routes share the same store instances, preventing data inconsistencies
- **Cross-domain updates** - When data changes in one domain (e.g., deleting a category), related data in other domains (e.g., questions) updates automatically without refetching
- **Optimistic client-side updates** - Changes are persisted to backend AND immediately reflected in client stores, minimizing redundant requests
- **Shared cache strategy** - Data is loaded once on dashboard entry and kept synchronized across route navigation

**Note:** While the `/settings` route doesn't require access to question/category/qualification stores, they are still provided at the shell level. This trade-off prioritizes architectural simplicity over the negligible overhead of unused service instances in the DI tree.

**Store provider location:** `libs/question-randomizer/dashboard/shell/src/dashboard-shell.component.ts:33-46`

### Routing Architecture

The app uses Angular's lazy-loaded routes organized by domain:

```
/ → redirects to /dashboard/randomization

/auth
  ├── /login                    # Login page
  ├── /registration             # Registration page
  └── /email/verify             # Email verification flow

/dashboard (protected by AuthVerifiedCanActivate)
  ├── /questions                # Question management
  ├── /categories               # Category management
  ├── /qualifications           # Qualification management
  ├── /randomization            # Main randomization interface (default)
  ├── /interview                # Interview mode
  └── /settings                 # Settings
```

Routes are defined in shell libraries:
- `apps/question-randomizer/src/app/app.routes.ts` - Root routes
- `libs/question-randomizer/auth/shell/src/auth-shell.routes.ts` - Auth routes
- `libs/question-randomizer/dashboard/shell/src/dashboard-shell.routes.ts` - Dashboard routes

### Import Paths

All libraries use TypeScript path aliases defined in `tsconfig.base.json`:

```typescript
// Import pattern: @my-nx-monorepo/<scope>-<domain>-<type>
import { Category } from '@my-nx-monorepo/question-randomizer-dashboard-shared-data-access';
import { LoginComponent } from '@my-nx-monorepo/question-randomizer-auth-feature';
import { OptionItem } from '@my-nx-monorepo/shared-util';
```

### Firebase Integration

Firebase is used for:
- Authentication (email/password with verification)
- Firestore database for questions, categories, qualifications, randomization state
- Configuration in `apps/question-randomizer/src/environments/`

Repository pattern with services:
- Repositories handle Firestore operations (in `data-access` libraries)
- Services provide business logic layer
- Mappers transform between Firestore documents and domain models

### Styling

- Global styles: `libs/shared/styles/src/styles/main.scss`
- SCSS preprocessor with shared include paths
- Component styles: SCSS (configured in `nx.json`)
- Quill editor CSS imported in build config

## Development Notes

- **Jest** is used for unit testing
- **Playwright** is used for e2e testing
- **ESLint** with Angular ESLint rules
- **Prettier** for code formatting
- Default branch: `master` (for Nx Cloud)
- Default dev server: `http://localhost:4200`

### When Creating New Features

1. Identify the correct domain (auth, dashboard subdomain, or shared)
2. Create libraries following the type pattern (feature, ui, data-access, etc.)
3. Use Nx generators to maintain consistency
4. Add TypeScript path aliases to `tsconfig.base.json`
5. Follow the normalized state pattern for stores if using @ngrx/signals
6. Use dependency injection and standalone components (Angular 20+)
