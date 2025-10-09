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

### Design System

```bash
# Build design system libraries
npx nx build @worse-and-pricier/design-system-tokens   # Build design tokens
npx nx build @worse-and-pricier/design-system-styles   # Build global styles
npx nx build @worse-and-pricier/design-system-ui       # Build UI components
npx nx build @worse-and-pricier/design-system          # Build meta-package
npx nx run-many --target=build --projects=@worse-and-pricier/design-system-tokens,@worse-and-pricier/design-system-styles,@worse-and-pricier/design-system-ui,@worse-and-pricier/design-system  # Build all

# Storybook (component documentation)
npx nx storybook @worse-and-pricier/design-system-ui       # Run Storybook dev server
npx nx build-storybook @worse-and-pricier/design-system-ui # Build static Storybook
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

- `design-system/` - **Publishable design system:**
  - `design-system/design-system/` - Meta-package that bundles all design system packages
  - `design-system/tokens/` - Design tokens (colors, typography, spacing) - SCSS + TypeScript
  - `design-system/styles/` - Global styles, theme service, utilities
  - `design-system/ui/` - Reusable UI components with Storybook
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
- `shared/util/` - Workspace-wide utility library (for non-UI code only)

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
- **Styles libraries** can depend on: util libraries (for tokens)
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
// Import pattern: @worse-and-pricier/<scope>-<domain>-<type>
import { Category } from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
import { LoginComponent } from '@worse-and-pricier/question-randomizer-auth-feature';

// Design System imports (Option 1: via meta-package - recommended)
import {
  colors, typography,
  Theme, ThemeService,
  ButtonComponent,
  InputTextComponent,
  OptionItem,
  SortDefinition,
  PageEvent
} from '@worse-and-pricier/design-system';

// Design System imports (Option 2: direct imports - for fine-grained control)
import { colors, typography } from '@worse-and-pricier/design-system-tokens';
import { Theme, ThemeService } from '@worse-and-pricier/design-system-styles';
import {
  ButtonComponent,
  InputTextComponent,
  OptionItem,
  SortDefinition,
  PageEvent
} from '@worse-and-pricier/design-system-ui';
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

**Design System:**

- Design tokens: `libs/design-system/tokens/` - Colors, typography, spacing (SCSS + TypeScript)
- Global styles: `libs/design-system/styles/` - Base styles, theme service (light/dark), utilities
- UI components: `libs/design-system/ui/` - Pre-built components with consistent styling

**Configuration:**

- SCSS preprocessor with include paths configured in `apps/question-randomizer/project.json`
- Component styles: SCSS (configured in `nx.json`)
- Main stylesheet: `libs/design-system/styles/src/lib/styles/main.scss`
- Theme switching: Handled by `ThemeService` from `@worse-and-pricier/design-system-styles`

## Design System

### Overview

The workspace includes a comprehensive, publishable design system under `libs/design-system/`. All four packages are configured with `@nx/angular:package` executor for Angular Package Format (APF) compliance and can be published to NPM.

### Packages

1. **`@worse-and-pricier/design-system`** (`libs/design-system/design-system`) - **Meta-package (RECOMMENDED)**

   - Umbrella package that bundles all three design system packages
   - Simplifies installation for Angular applications
   - Guarantees version compatibility between packages
   - Re-exports everything from tokens, styles, and ui
   - Tags: `type:design-system`, `scope:design-system`
   - Dependencies: `design-system-tokens`, `design-system-styles`, `design-system-ui`

2. **`@worse-and-pricier/design-system-tokens`** (`libs/design-system/tokens`)

   - Design tokens: colors, typography, spacing, mixins, functions
   - Available as both SCSS and TypeScript exports
   - Framework-agnostic (can be used in React, Vue, vanilla JS)
   - Tags: `type:util`, `scope:design-system`
   - No dependencies (foundational layer)

3. **`@worse-and-pricier/design-system-styles`** (`libs/design-system/styles`)

   - Global styles, base resets, typography
   - Light/dark theme support via `ThemeService`
   - Theme models: `Theme` type and `ThemeService` for theme switching
   - Utilities and component styles
   - Tags: `type:styles`, `scope:design-system`
   - Depends on: `design-system-tokens`

4. **`@worse-and-pricier/design-system-ui`** (`libs/design-system-ui`)
   - Complete UI component library with Storybook
   - Components: buttons, controls, table, card, paginator
   - Includes models: `ButtonType`, `OptionItem`, `SortDefinition`, `PageEvent`, etc.
   - Tags: `type:ui`, `scope:design-system`
   - Depends on: `design-system-tokens` (for SCSS compilation only)

### Usage

**TypeScript (Option 1: Meta-package - RECOMMENDED):**

```typescript
// Import everything from meta-package
import {
  // Tokens
  colors, typography, spacing,
  // Theme service
  Theme, ThemeService,
  // UI components
  ButtonComponent, TableComponent, CardComponent,
  // Models
  OptionItem, SortDefinition, PageEvent
} from '@worse-and-pricier/design-system';
```

**TypeScript (Option 2: Direct imports):**

```typescript
// Tokens
import { colors, typography } from '@worse-and-pricier/design-system-tokens';

// Theme service and models
import { Theme, ThemeService } from '@worse-and-pricier/design-system-styles';

// UI components and models
import {
  ButtonComponent,
  TableComponent,
  OptionItem,
  SortDefinition,
  PageEvent
} from '@worse-and-pricier/design-system-ui';
```

**SCSS:**

```scss
// Import tokens during development (source)
@use '../../../../../design-system/tokens/src/lib/scss/variables';
@use '../../../../../design-system/tokens/src/lib/scss/colors';

// Or import from built package (when published)
@use '@worse-and-pricier/design-system-tokens/scss' as tokens;
```

**Angular project.json:**

```json
"styles": [
  "node_modules/quill/dist/quill.snow.css",
  "libs/design-system/styles/src/lib/styles/main.scss",
  "apps/question-randomizer/src/styles.scss"
],
"stylePreprocessorOptions": {
  "includePaths": ["libs/design-system/tokens/src/lib/scss"]
}
```

### Documentation

- Component documentation: `npx nx storybook @worse-and-pricier/design-system-ui`
- README: `libs/design-system/README.md`
- Stories: `libs/design-system/ui/src/lib/**/*.stories.ts`

## Development Notes

- **Jest** is used for unit testing
- **Playwright** is used for e2e testing
- **Storybook** is used for design system component documentation
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
7. **Use design-system components** instead of creating custom UI components
8. **Import from `@worse-and-pricier/design-system` meta-package (recommended)** or from individual packages
9. **Use tokens programmatically** when you need dynamic styling (e.g., `colors.primary`)

### When Working with the Design System

1. **Adding new components:**

   - Add to `libs/design-system/ui/src/lib/`
   - Export from `libs/design-system/ui/src/index.ts`
   - Create Storybook stories (`.stories.ts`)
   - Use relative imports within the library to avoid circular dependencies

2. **Adding new tokens:**

   - Add SCSS tokens to `libs/design-system/tokens/src/lib/scss/`
   - Add TypeScript exports to `libs/design-system/tokens/src/lib/`
   - Export from `libs/design-system/tokens/src/index.ts`

3. **Publishing:**

   - Build all packages: `npx nx run-many --target=build --projects=@worse-and-pricier/design-system-tokens,@worse-and-pricier/design-system-styles,@worse-and-pricier/design-system-ui,@worse-and-pricier/design-system`
   - Packages are output to `dist/libs/design-system/`
   - Use `nx release` or publish manually from dist folders
   - **Publish order:** tokens → styles → ui → design-system (dependencies first)

4. **Module boundaries:**
   - Design system packages follow strict ESLint boundaries
   - `design-system` (meta-package) → depends on `tokens`, `styles`, `ui`
   - `tokens` (util) → no dependencies (foundation)
   - `styles` (styles) → depends on `tokens`
   - `ui` (ui) → depends on `tokens` (for SCSS only)
