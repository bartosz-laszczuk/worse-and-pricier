# question-randomizer-dashboard-category-feature

Category management feature library containing smart components for CRUD operations on question categories.

## Purpose

This library provides feature components for managing categories used to organize interview questions. Categories allow users to group questions by topic (e.g., "JavaScript", "System Design", "Algorithms") for better organization and filtering.

## Components

### Category List (`src/list/`)

- **`category-list.component.ts`** - Category list management component
- **`category-list.facade.ts`** - Business logic facade for category operations

**Features:**
- Display paginated list of categories
- Filter categories by name and active status
- Sort categories by various fields (name, creation date, question count)
- Create new categories
- Edit existing categories
- Delete categories with cascade handling
- Toggle category active status
- View question count per category

**Route:** `/dashboard/categories`

### Category Management Operations

- **Create Category**
  - Name input with validation
  - Description field
  - Active/inactive status toggle
  - Duplicate name prevention

- **Edit Category**
  - Inline editing in modal/side panel
  - Update name and description
  - Real-time validation

- **Delete Category**
  - Confirmation dialog with question count warning
  - Cascade handling: removes category from all associated questions
  - Optimistic UI updates

## Usage

### Importing Components

```typescript
import {
  CategoryListComponent
} from '@worse-and-pricier/question-randomizer-dashboard-category-feature';
```

### Route Configuration

This component is lazy-loaded in the dashboard shell routes:

```typescript
// libs/question-randomizer/dashboard/shell/src/dashboard-shell.routes.ts
{
  path: 'categories',
  loadComponent: () => import('@worse-and-pricier/question-randomizer-dashboard-category-feature')
    .then(m => m.CategoryListComponent)
}
```

## Architecture

This library follows the **facade pattern** for separation of concerns:

- **Components** - Handle UI rendering, user interactions, and local UI state
- **Facades** - Contain business logic, coordinate store operations, and manage component state
- **Stores** - Injected from `question-randomizer-dashboard-shared-data-access`

### State Management

The category list uses the **CategoryListStore** from `dashboard-shared-data-access`:

```typescript
// Injected in facade
private categoryStore = inject(CategoryListStore);
private questionStore = inject(QuestionListStore);

// Access computed signals
categories = this.categoryStore.paginatedEntities;
totalCategories = this.categoryStore.totalCount;
activeCategories = this.categoryStore.activeCategories;
```

### Dependencies

This feature library depends on:

- **`@worse-and-pricier/question-randomizer-dashboard-shared-data-access`** - Category and question stores and services
- **`@worse-and-pricier/question-randomizer-dashboard-shared-util`** - Shared models and utilities
- **`@worse-and-pricier/question-randomizer-dashboard-category-ui`** - Category presentational components
- **`@worse-and-pricier/design-system-ui`** - UI components (table, pagination, buttons, inputs)

## Module Boundaries

This library has:
- **Type tag:** `type:feature`
- **Scope tag:** `scope:category`

**Can depend on:**
- UI libraries (type:ui) within category scope
- Dashboard shared libraries (scope:dashboard-shared)
- Util libraries (type:util)

**Cannot depend on:**
- Other dashboard domain features (question, qualification, randomization, interview, settings)
- Other feature libraries
- Shell libraries

See [`/docs/MODULE_BOUNDARIES.md`](../../../../../docs/MODULE_BOUNDARIES.md) for details.

## Features in Detail

### Filtering
- **By Name:** Text search to filter categories by name
- **By Active Status:** Filter active/inactive categories

### Sorting
- **Sortable Columns:** Name, Created Date, Updated Date, Question Count
- **Ascending/Descending:** Toggle sort direction

### Pagination
- **Page Size Options:** 10, 25, 50, 100 categories per page
- **Navigation:** First, Previous, Next, Last page controls
- **Total Count:** Display total category count

### Cascade Deletion
When deleting a category:
1. Confirmation dialog shows the number of affected questions
2. Category is removed from all associated questions
3. Questions remain but lose the category association
4. Store updates propagate to question list automatically

## Testing

```bash
# Run unit tests
npx nx test question-randomizer-dashboard-category-feature
```

## Related Libraries

- **`question-randomizer-dashboard-category-ui`** - Category presentational components
- **`question-randomizer-dashboard-shared-data-access`** - Shared stores and services
- **`question-randomizer-dashboard-shared-util`** - Shared utilities and models
