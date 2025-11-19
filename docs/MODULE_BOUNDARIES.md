# Module Boundaries

This document details the module boundary rules enforced by ESLint's `@nx/enforce-module-boundaries` rule. These rules ensure proper separation of concerns, maintainability, and prevent coupling between domains.

**Configuration location:** `eslint.config.mjs:13-127`

## Tag System

Each library in the workspace is tagged with two types of tags:

### Type Tags

Define the **library type** and its allowed dependencies based on architectural layers:

- `type:ui` - Presentational components (dumb components)
- `type:feature` - Smart components that interact with state and services
- `type:data-access` - State management, services, repositories, Firebase integration
- `type:util` - Utility functions, models, types, helpers
- `type:shell` - Route configuration and container components that compose features
- `type:app` - Application entry points
- `type:e2e` - End-to-end tests
- `type:styles` - Global styles and theming
- `type:design-system` - Design system meta-package

### Scope Tags

Define **domain boundaries** (not folder structure):

- `scope:auth` - Authentication domain
- `scope:shared` - App-wide shared code
- `scope:design-system` - Design system infrastructure
- `scope:dashboard` - Dashboard shell/container
- `scope:dashboard-shared` - Shared dashboard utilities (cross-cutting concerns for dashboard domains)
- `scope:question` - Question management domain
- `scope:category` - Category management domain
- `scope:qualification` - Qualification management domain
- `scope:randomization` - Randomization domain
- `scope:interview` - Interview mode domain
- `scope:dashboard-ai-chat` - AI chat assistant domain
- `scope:settings` - Settings domain

## Type-Based Dependency Rules

These rules enforce architectural layering and separation of concerns:

### UI Libraries (`type:ui`)
```javascript
// Can only depend on:
'type:ui', 'type:util', 'type:styles'
```
**Rationale:** UI components should be presentational and reusable. They cannot depend on features or data-access to remain decoupled and testable.

### Feature Libraries (`type:feature`)
```javascript
// Can depend on:
'type:ui', 'type:data-access', 'type:util'
```
**Rationale:** Features orchestrate UI components and interact with data-access layers. They compose the application's smart components.

### Data-Access Libraries (`type:data-access`)
```javascript
// Can depend on:
'type:data-access', 'type:util', 'type:ui'
```
**Rationale:** Data-access manages state, services, and repositories. Can depend on UI for type definitions (e.g., models used in components).

### Shell Libraries (`type:shell`)
```javascript
// Can depend on:
'type:shell', 'type:feature', 'type:ui', 'type:data-access', 'type:util', 'type:styles'
```
**Rationale:** Shells compose and configure routes. They have broad access to integrate features, UI, and data layers.

### Util Libraries (`type:util`)
```javascript
// Can only depend on:
'type:util'
```
**Rationale:** Utilities are foundational and should have no external dependencies to remain reusable and prevent circular dependencies.

### Styles Libraries (`type:styles`)
```javascript
// Can depend on:
'type:util'
```
**Rationale:** Styles can use utility libraries for design tokens but should not depend on UI components.

### Apps (`type:app`)
```javascript
// Can depend on:
'*'  // Everything
```
**Rationale:** Applications are the top-level entry points and can integrate all library types.

### E2E Tests (`type:e2e`)
```javascript
// Can only depend on:
'type:app'
```
**Rationale:** E2E tests test applications as a whole, not individual libraries.

### Design System Meta-Package (`type:design-system`)
```javascript
// Can depend on:
'type:ui', 'type:styles', 'type:util'
```
**Rationale:** Meta-package bundles design system components (UI), styles, and tokens (util).

## Domain Isolation Rules

These rules prevent coupling between dashboard domains, enforcing **horizontal slicing** and bounded contexts:

### Dashboard Domain Isolation

All dashboard domains (`question`, `category`, `qualification`, `randomization`, `interview`, `dashboard-ai-chat`, `settings`) **CANNOT depend on each other**.

**Example from `eslint.config.mjs:65-124`:**
```javascript
{
  sourceTag: 'scope:question',
  notDependOnLibsWithTags: [
    'scope:category',
    'scope:qualification',
    'scope:randomization',
    'scope:interview',
    'scope:settings',
  ],
}
// ... (same pattern for all dashboard domains)
```

**Rationale:**
- Each dashboard domain represents a **distinct bounded context** with its own business logic
- Prevents coupling between domains, making them independently maintainable
- Forces shared concerns to be extracted to `scope:dashboard-shared`
- Enables easier feature extraction, testing, and refactoring

### Shared Dashboard Code

All dashboard domains **CAN depend on** `scope:dashboard-shared`:
- This is where cross-cutting stores, services, and utilities live
- Examples: `category-list.store.ts`, `question-list.store.ts`, shared models

## Enforcement

Module boundaries are enforced via:
```bash
npx nx lint <project-name>
npx nx run-many --target=lint
```

**Build-time enforcement:** `enforceBuildableLibDependency: true` ensures buildable libraries only depend on other buildable libraries.

## Common Violations and Solutions

### ❌ Feature depending on another feature
```typescript
// ❌ WRONG: features cannot depend on other features
import { SomeFeature } from '@worse-and-pricier/question-randomizer-auth-feature';
```
**Solution:** Extract shared logic to a data-access or util library.

### ❌ UI depending on data-access
```typescript
// ❌ WRONG: UI components cannot depend on data-access
import { QuestionService } from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
```
**Solution:** Pass data via component inputs. Keep UI presentational.

### ❌ Dashboard domain cross-dependencies
```typescript
// ❌ WRONG: question domain cannot depend on category domain
import { CategoryFeature } from '@worse-and-pricier/question-randomizer-dashboard-categories-feature';
```
**Solution:** Extract shared logic to `dashboard-shared` libraries.

### ✅ Correct patterns
```typescript
// ✅ CORRECT: feature depending on UI
import { ButtonComponent } from '@worse-and-pricier/design-system-ui';

// ✅ CORRECT: feature depending on data-access
import { QuestionListStore } from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';

// ✅ CORRECT: any library depending on util
import { Category } from '@worse-and-pricier/question-randomizer-dashboard-shared-util';

// ✅ CORRECT: dashboard domain depending on dashboard-shared
import { QuestionService } from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
```

## Resources

- **ESLint Configuration:** `eslint.config.mjs`
- **Nx Documentation:** [Enforce Module Boundaries](https://nx.dev/core-features/enforce-module-boundaries)
- **Project Tags:** Check `project.json` files for library tags
