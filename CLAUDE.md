# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an Nx monorepo containing an Angular application called **question-randomizer** - an interview preparation tool that randomizes questions for practice. The application uses Firebase for authentication and data persistence, Angular 20, and @ngrx/signals for state management.

**Note:** This workspace has Nx MCP enabled, which provides direct access to project information, dependency graphs, and Nx commands.

## Working with Nx

**IMPORTANT: This workspace uses Nx MCP for all Nx-related operations.**

When working with this workspace, you MUST:

1. **Use Nx MCP tools instead of assumptions** - Never assume Nx knowledge or configuration
2. **Use Nx MCP generators instead of direct commands** - Never run `npx nx g` directly
3. **Always query MCP tools for current workspace state** - Nx versions and features change frequently

See the **[MCP Integrations](#mcp-integrations)** section below for detailed tool descriptions.

## Quick Command Reference

Common commands for development, testing, linting, and building. This reference is primarily for human developers; Claude uses Nx MCP tools for up-to-date workspace information.

```bash
npx nx serve question-randomizer        # Run dev server (http://localhost:4200)
npx nx test question-randomizer         # Run tests
npx nx lint question-randomizer         # Lint the app
npx nx build question-randomizer        # Production build
```

## Architecture

### Monorepo Structure

The repository follows Nx's recommended structure with domain-driven design:

- **apps/question-randomizer** - Main Angular application (entry point)
- **libs/** - Shared libraries organized by domain and type

### Library Organization Pattern

Libraries follow a layered architecture pattern organized by domain:

**Domain structure:**

- `design-system/` - Publishable design system (tokens, styles, UI components) - See **[Design System](#design-system)** section below
- `question-randomizer/auth/` - Authentication domain (login, registration, email verification)
- `question-randomizer/dashboard/` - **Namespace for dashboard-related domains:**
  - `dashboard/questions/` - Question management domain
  - `dashboard/categories/` - Category management domain
  - `dashboard/qualifications/` - Qualification management domain
  - `dashboard/randomization/` - Question randomization domain
  - `dashboard/interview/` - Interview mode domain
  - `dashboard/ai-chat/` - AI chat assistant domain (conversational interface for managing data)
  - `dashboard/settings/` - Settings domain
  - `dashboard/shared/` - Shared dashboard code (cross-cutting stores, services)
- `question-randomizer/shared/` - App-wide shared code (utilities, services used across all app domains)

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
- **scope tag** - Defines the domain boundary (not the folder structure)

**Key rules:**

- UI libraries can only depend on: other UI, util, and styles libraries
- Feature libraries can depend on: UI, data-access, and util libraries
- Dashboard domains (question, category, qualification, randomization, interview, ai-chat, settings) **cannot depend on each other**
- All dashboard domains **can depend on** `dashboard-shared` for cross-cutting concerns

**For detailed module boundary rules, dependency constraints, and examples, see:** **[`/docs/MODULE_BOUNDARIES.md`](docs/MODULE_BOUNDARIES.md)**

**Configuration:** Module boundaries are configured in `eslint.config.mjs` and enforced via `npx nx lint`.

### State Management

The app uses **@ngrx/signals** (NgRx SignalStore) for state management, NOT the traditional Redux pattern.

Key stores are located in `libs/question-randomizer/dashboard/shared/data-access/src/store/`:

- `category-list.store.ts` - Category management with normalized state pattern
- `qualification-list.store.ts` - Qualification management
- `question-list.store.ts` - Question management
- `randomization.store.ts` - Randomization state

Additionally, the AI chat domain has its own store at `libs/question-randomizer/dashboard/ai-chat/data-access/src/lib/store/`:

- `chat.store.ts` - Conversation and message management with normalized state pattern

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
  ├── /ai-chat                  # AI chat assistant
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
```

See **[Design System](#design-system)** section for design system import examples.

### Firebase Integration

Firebase is used for:

- Authentication (email/password with verification)
- Firestore database for questions, categories, qualifications, randomization state, conversations, and messages
- Configuration in `apps/question-randomizer/src/environments/`

Repository pattern with services:

- Repositories handle Firestore operations (in `data-access` libraries)
- Services provide business logic layer
- Mappers transform between Firestore documents and domain models

## Design System

The workspace includes a comprehensive, publishable design system under `libs/design-system/`. The design system provides:

- **Design tokens** (`libs/design-system/tokens/`) - Colors, typography, spacing (SCSS + TypeScript)
- **Global styles** (`libs/design-system/styles/`) - Base styles, theme service (light/dark), utilities
- **UI component library** (`libs/design-system/ui/`) - Pre-built components with Storybook documentation
- **Meta-package** (`@worse-and-pricier/design-system`) that bundles all packages

### Import Examples

```typescript
// Option 1: via meta-package (recommended)
import { colors, typography, Theme, ThemeService, ButtonComponent, InputTextComponent, OptionItem, SortDefinition, PageEvent } from '@worse-and-pricier/design-system';

// Option 2: direct imports (for fine-grained control)
import { colors, typography } from '@worse-and-pricier/design-system-tokens';
import { Theme, ThemeService } from '@worse-and-pricier/design-system-styles';
import { ButtonComponent, InputTextComponent, OptionItem, SortDefinition, PageEvent } from '@worse-and-pricier/design-system-ui';
```

### Styling Configuration

- SCSS preprocessor with include paths configured in `apps/question-randomizer/project.json`
- Component styles: SCSS (configured in `nx.json`)
- Main stylesheet: `libs/design-system/styles/src/lib/styles/main.scss`
- Theme switching: Handled by `ThemeService` from `@worse-and-pricier/design-system-styles`

**For complete documentation:** [`/libs/design-system/README.md`](libs/design-system/README.md)

**For contributing:** [`/docs/DESIGN_SYSTEM_CONTRIBUTING.md`](docs/DESIGN_SYSTEM_CONTRIBUTING.md)

## Internationalization (i18n)

The application supports **multi-language functionality** using [@jsverse/transloco](https://jsverse.github.io/transloco/) with:

- **Supported languages:** English (`en`) and Polish (`pl`)
- **Default language:** English
- **Translation files:** `apps/question-randomizer/src/assets/i18n/en.json` and `pl.json`
- **Language switching:** Runtime language switching with localStorage persistence
- **Translation management:** Automated key extraction and validation

### Quick Usage

```typescript
// In templates (most common)
{{ 'auth.login.title' | transloco }}

// In TypeScript
import { TranslocoService } from '@jsverse/transloco';
const translation = this.translocoService.translate('auth.login.title');
```

**Component requirement:** Import `TranslocoModule` in components using the `transloco` pipe.

### NPM Scripts

```bash
npm run i18n:extract    # Extract translation keys from codebase
npm run i18n:find       # Find translation key usage
```

**For complete documentation:** [`/docs/INTERNATIONALIZATION.md`](docs/INTERNATIONALIZATION.md)

## Development Notes

- **Jest** is used for unit testing
- **Playwright** is used for e2e testing
- **Storybook** is used for design system component documentation
- **ESLint** with Angular ESLint rules
- **Prettier** for code formatting
- Main branch: `main`
- Default dev server: `http://localhost:4200`

### When Creating New Features

1. Identify the correct domain (auth, dashboard subdomain, or shared)
2. Create libraries following the type pattern (feature, ui, data-access, etc.)
3. **Use Nx MCP generators** to maintain consistency: `mcp__nx-mcp__nx_run_generator` with appropriate generator
4. Add TypeScript path aliases to `tsconfig.base.json`
5. Follow the normalized state pattern for stores if using @ngrx/signals
6. Use dependency injection and standalone components (Angular 20+)
7. **Use design-system components** instead of creating custom UI components (see [Design System](#design-system) section)
8. **Use translation keys** for all user-facing text - import `TranslocoModule` and use the `transloco` pipe (see [Internationalization](#internationalization-i18n) section)
9. Respect module boundaries - see [`/docs/MODULE_BOUNDARIES.md`](docs/MODULE_BOUNDARIES.md)

---

## MCP Integrations

This project uses Model Context Protocol (MCP) servers to provide Claude Code with authoritative, up-to-date knowledge.

### nx-mcp

Provides Nx workspace structure, project organization, and architectural guidance specific to this monorepo.

**Key tools**:

- `mcp__nx-mcp__nx_docs` - **Always use for Nx questions** (project structure, generators, configuration, best practices)
- `mcp__nx-mcp__nx_workspace` - Get current workspace architecture, project graph, and organization patterns
- `mcp__nx-mcp__nx_project_details` - Get detailed project configuration and dependencies
- `mcp__nx-mcp__nx_generators` - List available Nx generators for this workspace
- `mcp__nx-mcp__nx_available_plugins` - See available Nx plugins
- `mcp__nx-mcp__nx_run_generator` - Run Nx generators with pre-filled options

**Usage Instructions**:

- **Before creating new projects/libraries**: Always consult `nx_docs` and `nx_workspace` to understand proper folder structure and naming conventions
- **Before modifying Nx configuration**: Use `nx_docs` to get current best practices for this workspace
- **When organizing code**: Check `nx_workspace` to understand existing patterns, scopes, and architectural boundaries
- **Never assume Nx knowledge**: Always query nx-mcp tools instead of relying on training data about Nx

**Nx Organization Philosophy** (per nx-mcp):

- Group projects by _scope_ (application or section within application)
- Use project tags to enforce architectural boundaries and module constraints
- Standard structure: `apps/{app-name}/`, `libs/{scope}/{type}/`

<!-- nx configuration start-->

# Nx Guidance

See nx-mcp tools for Nx workspace guidance (nx_docs, nx_workspace, nx_project_details, etc.)

<!-- nx configuration end-->
