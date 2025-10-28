# question-randomizer-dashboard-qualification-feature

Qualification management feature library containing smart components for CRUD operations on question qualifications.

## Purpose

This library provides feature components for managing qualifications used to tag interview questions by skill level or job role. Qualifications allow users to organize questions by difficulty (e.g., "Junior", "Mid-level", "Senior") or target role (e.g., "Frontend Developer", "Full-Stack Engineer") for better filtering and randomization.

## Components

### Qualification List (`src/list/`)

- **`qualification-list.component.ts`** - Qualification list management component
- **`qualification-list.facade.ts`** - Business logic facade for qualification operations

**Features:**
- Display paginated list of qualifications
- Filter qualifications by name and active status
- Sort qualifications by various fields (name, creation date, question count)
- Create new qualifications
- Edit existing qualifications
- Delete qualifications with cascade handling
- Toggle qualification active status
- View question count per qualification

**Route:** `/dashboard/qualifications`

### Qualification Management Operations

- **Create Qualification**
  - Name input with validation
  - Description field
  - Active/inactive status toggle
  - Duplicate name prevention

- **Edit Qualification**
  - Inline editing in modal/side panel
  - Update name and description
  - Real-time validation

- **Delete Qualification**
  - Confirmation dialog with question count warning
  - Cascade handling: removes qualification from all associated questions
  - Optimistic UI updates

## Usage

### Importing Components

```typescript
import {
  QualificationListComponent
} from '@worse-and-pricier/question-randomizer-dashboard-qualification-feature';
```

### Route Configuration

This component is lazy-loaded in the dashboard shell routes:

```typescript
// libs/question-randomizer/dashboard/shell/src/dashboard-shell.routes.ts
{
  path: 'qualifications',
  loadComponent: () => import('@worse-and-pricier/question-randomizer-dashboard-qualification-feature')
    .then(m => m.QualificationListComponent)
}
```

## Architecture

This library follows the **facade pattern** for separation of concerns:

- **Components** - Handle UI rendering, user interactions, and local UI state
- **Facades** - Contain business logic, coordinate store operations, and manage component state
- **Stores** - Injected from `question-randomizer-dashboard-shared-data-access`

### State Management

The qualification list uses the **QualificationListStore** from `dashboard-shared-data-access`:

```typescript
// Injected in facade
private qualificationStore = inject(QualificationListStore);
private questionStore = inject(QuestionListStore);

// Access computed signals
qualifications = this.qualificationStore.paginatedEntities;
totalQualifications = this.qualificationStore.totalCount;
activeQualifications = this.qualificationStore.activeQualifications;
```

### Dependencies

This feature library depends on:

- **`@worse-and-pricier/question-randomizer-dashboard-shared-data-access`** - Qualification and question stores and services
- **`@worse-and-pricier/question-randomizer-dashboard-shared-util`** - Shared models and utilities
- **`@worse-and-pricier/question-randomizer-dashboard-qualification-ui`** - Qualification presentational components
- **`@worse-and-pricier/design-system-ui`** - UI components (table, pagination, buttons, inputs)

## Module Boundaries

This library has:
- **Type tag:** `type:feature`
- **Scope tag:** `scope:qualification`

**Can depend on:**
- UI libraries (type:ui) within qualification scope
- Dashboard shared libraries (scope:dashboard-shared)
- Util libraries (type:util)

**Cannot depend on:**
- Other dashboard domain features (question, category, randomization, interview, settings)
- Other feature libraries
- Shell libraries

See [`/docs/MODULE_BOUNDARIES.md`](../../../../../docs/MODULE_BOUNDARIES.md) for details.

## Features in Detail

### Filtering
- **By Name:** Text search to filter qualifications by name
- **By Active Status:** Filter active/inactive qualifications

### Sorting
- **Sortable Columns:** Name, Created Date, Updated Date, Question Count
- **Ascending/Descending:** Toggle sort direction

### Pagination
- **Page Size Options:** 10, 25, 50, 100 qualifications per page
- **Navigation:** First, Previous, Next, Last page controls
- **Total Count:** Display total qualification count

### Cascade Deletion
When deleting a qualification:
1. Confirmation dialog shows the number of affected questions
2. Qualification is removed from all associated questions
3. Questions remain but lose the qualification association
4. Store updates propagate to question list automatically

## Use Cases

### Skill Level Organization
```
- Junior Developer
- Mid-level Developer
- Senior Developer
- Staff Engineer
- Principal Engineer
```

### Role-Based Organization
```
- Frontend Developer
- Backend Developer
- Full-Stack Developer
- DevOps Engineer
- Data Engineer
```

### Domain-Specific Organization
```
- Entry Level
- Intermediate
- Advanced
- Expert
```

## Testing

```bash
# Run unit tests
npx nx test question-randomizer-dashboard-qualification-feature
```

## Related Libraries

- **`question-randomizer-dashboard-qualification-ui`** - Qualification presentational components
- **`question-randomizer-dashboard-shared-data-access`** - Shared stores and services
- **`question-randomizer-dashboard-shared-util`** - Shared utilities and models
