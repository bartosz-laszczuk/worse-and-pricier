# question-randomizer-dashboard-shared-data-access

Shared data-access library for dashboard domains containing state management (stores), services, repositories, and models.

## Purpose

This library provides cross-cutting data concerns used across multiple dashboard domains (questions, categories, qualifications, randomization, interview, settings). It follows the repository pattern with Firebase Firestore integration and uses @ngrx/signals (SignalStore) for state management.

## Architecture

The library is organized into four main layers:

### 1. Models (`src/models/`)

Domain models and TypeScript interfaces:

- **`category.models.ts`** - Category entity models
- **`qualification.models.ts`** - Qualification entity models
- **`question.models.ts`** - Question entity models
- **`randomization.models.ts`** - Randomization configuration models

### 2. Repositories (`src/repositories/`)

Firebase Firestore data access layer:

- **`category-repository.service.ts`** - CRUD operations for categories
- **`qualification-repository.service.ts`** - CRUD operations for qualifications
- **`question-repository.service.ts`** - CRUD operations for questions
- **`randomization-repository.service.ts`** - Randomization settings persistence
- **`selected-category-list-repository.service.ts`** - Selected categories tracking
- **`used-question-list-repository.service.ts`** - Used questions tracking
- **`postponed-question-list-repository.service.ts`** - Postponed questions tracking

### 3. Services (`src/services/`)

Business logic and facade services:

- **`category-list.service.ts`** - Category list management
- **`qualification-list.service.ts`** - Qualification list management
- **`question-list.service.ts`** - Question list management
- **`question-mapper.service.ts`** - Question data transformation
- **`randomization.service.ts`** - Randomization logic
- **`randomization-mapper.service.ts`** - Randomization data transformation
- **`selected-category-list.service.ts`** - Selected categories management
- **`used-question-list.service.ts`** - Used questions management
- **`postponed-question-list.service.ts`** - Postponed questions management

### 4. Stores (`src/store/`)

@ngrx/signals state management with normalized state pattern:

- **`category-list.store.ts`** - Category state management
- **`qualification-list.store.ts`** - Qualification state management
- **`question-list.store.ts`** - Question state management
- **`randomization.store.ts`** - Randomization state management

Each store follows a normalized state pattern with:
- `entities` - Record<string, T> for O(1) lookups
- `ids` - string[] for maintaining order
- Computed selectors for filtering, sorting, pagination
- Methods for CRUD operations

## Store Provider Pattern

All stores are provided at the **dashboard shell level** (`DashboardShellComponent`), ensuring:

- **Single source of truth** - All dashboard routes share the same store instances
- **Cross-domain updates** - Data changes automatically propagate across domains
- **Optimistic updates** - Client-side updates with Firebase sync
- **Shared cache** - Data loaded once on dashboard entry

See: `libs/question-randomizer/dashboard/shell/src/dashboard-shell.component.ts:33-46`

## Usage

### Importing Models

```typescript
import {
  Category,
  Qualification,
  Question,
  RandomizationSettings
} from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';
```

### Injecting Stores

```typescript
import { inject } from '@angular/core';
import {
  CategoryListStore,
  QualificationListStore,
  QuestionListStore
} from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';

@Component({
  standalone: true,
  // ...
})
export class MyComponent {
  private categoryStore = inject(CategoryListStore);
  private qualificationStore = inject(QualificationListStore);
  private questionStore = inject(QuestionListStore);

  // Access computed signals
  categories = this.categoryStore.entities;
  activeCategories = this.categoryStore.activeCategories;

  // Call store methods
  addCategory(category: Category) {
    this.categoryStore.add(category);
  }
}
```

### Using Services

```typescript
import { inject } from '@angular/core';
import {
  QuestionListService,
  CategoryListService
} from '@worse-and-pricier/question-randomizer-dashboard-shared-data-access';

@Component({
  standalone: true,
  // ...
})
export class MyComponent {
  private questionService = inject(QuestionListService);
  private categoryService = inject(CategoryListService);

  async loadData() {
    await this.questionService.loadAll();
    await this.categoryService.loadAll();
  }
}
```

## Module Boundaries

This library has:
- **Type tag:** `type:data-access`
- **Scope tag:** `scope:dashboard-shared`

**Can be imported by:**
- All dashboard domains (question, category, qualification, randomization, interview, settings)
- Dashboard shell

**Cannot depend on:**
- Feature libraries (type:feature)
- Specific dashboard domains (scope:question, scope:category, etc.)

See [`/docs/MODULE_BOUNDARIES.md`](../../../../docs/MODULE_BOUNDARIES.md) for details.

## Testing

```bash
# Run unit tests
npx nx test question-randomizer-dashboard-shared-data-access
```

## Related Libraries

- **`question-randomizer-dashboard-shared-util`** - Shared utilities and helpers
- **`question-randomizer-dashboard-shared-ui`** - Shared UI components
- **`question-randomizer-shared-data-access`** - App-wide data access (auth, config)
