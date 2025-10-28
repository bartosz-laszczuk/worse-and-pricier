# question-randomizer-dashboard-question-feature

Question management feature library containing smart components for CRUD operations on interview questions.

## Purpose

This library provides feature components for managing interview questions within the dashboard. It includes listing, creating, editing, and deleting questions with categories and qualifications tagging.

## Components

### Question List (`src/list/`)

- **`question-list.component.ts`** - Question list management component
- **`question-list.facade.ts`** - Business logic facade for question operations

**Features:**
- Display paginated list of interview questions
- Filter questions by categories, qualifications, and search text
- Sort questions by various fields (title, category, qualification, creation date)
- Create new questions with rich text editor
- Edit existing questions
- Delete questions with confirmation
- Toggle question active status
- View question details in expandable rows

**Route:** `/dashboard/questions`

### Question Management Operations

- **Create Question**
  - Rich text editor for question content
  - Category selection (multi-select)
  - Qualification selection (multi-select)
  - Active/inactive status toggle
  - Form validation

- **Edit Question**
  - Inline editing in modal/side panel
  - Update all question properties
  - Real-time validation

- **Delete Question**
  - Confirmation dialog
  - Cascade deletion handling
  - Optimistic UI updates

## Usage

### Importing Components

```typescript
import {
  QuestionListComponent
} from '@worse-and-pricier/question-randomizer-dashboard-question-feature';
```

### Route Configuration

This component is lazy-loaded in the dashboard shell routes:

```typescript
// libs/question-randomizer/dashboard/shell/src/dashboard-shell.routes.ts
{
  path: 'questions',
  loadComponent: () => import('@worse-and-pricier/question-randomizer-dashboard-question-feature')
    .then(m => m.QuestionListComponent)
}
```

## Architecture

This library follows the **facade pattern** for separation of concerns:

- **Components** - Handle UI rendering, user interactions, and local UI state
- **Facades** - Contain business logic, coordinate store operations, and manage component state
- **Stores** - Injected from `question-randomizer-dashboard-shared-data-access`

### State Management

The question list uses the **QuestionListStore** from `dashboard-shared-data-access`:

```typescript
// Injected in facade
private questionStore = inject(QuestionListStore);
private categoryStore = inject(CategoryListStore);
private qualificationStore = inject(QualificationListStore);

// Access computed signals
questions = this.questionStore.paginatedEntities;
totalQuestions = this.questionStore.totalCount;
activeCategories = this.categoryStore.activeCategories;
```

### Dependencies

This feature library depends on:

- **`@worse-and-pricier/question-randomizer-dashboard-shared-data-access`** - Question, category, qualification stores and services
- **`@worse-and-pricier/question-randomizer-dashboard-shared-util`** - Shared models and utilities
- **`@worse-and-pricier/question-randomizer-dashboard-question-ui`** - Question presentational components
- **`@worse-and-pricier/design-system-ui`** - UI components (table, pagination, buttons, inputs)

## Module Boundaries

This library has:
- **Type tag:** `type:feature`
- **Scope tag:** `scope:question`

**Can depend on:**
- UI libraries (type:ui) within question scope
- Dashboard shared libraries (scope:dashboard-shared)
- Util libraries (type:util)

**Cannot depend on:**
- Other dashboard domain features (category, qualification, randomization, interview, settings)
- Other feature libraries
- Shell libraries

See [`/docs/MODULE_BOUNDARIES.md`](../../../../../docs/MODULE_BOUNDARIES.md) for details.

## Features in Detail

### Filtering
- **By Categories:** Multi-select filter to show questions tagged with specific categories
- **By Qualifications:** Multi-select filter to show questions tagged with specific qualifications
- **By Text Search:** Full-text search across question titles and content
- **By Active Status:** Filter active/inactive questions

### Sorting
- **Sortable Columns:** Title, Category, Qualification, Created Date, Updated Date
- **Ascending/Descending:** Toggle sort direction

### Pagination
- **Page Size Options:** 10, 25, 50, 100 questions per page
- **Navigation:** First, Previous, Next, Last page controls
- **Total Count:** Display total question count

### Rich Text Editing
- **Quill Editor:** Full rich text editing for question content
- **Formatting:** Bold, italic, underline, lists, code blocks
- **HTML Output:** Stored as HTML in Firestore

## Testing

```bash
# Run unit tests
npx nx test question-randomizer-dashboard-question-feature
```

## Related Libraries

- **`question-randomizer-dashboard-question-ui`** - Question presentational components
- **`question-randomizer-dashboard-question-data-access`** - Question-specific data access (if any)
- **`question-randomizer-dashboard-shared-data-access`** - Shared stores and services
- **`question-randomizer-dashboard-shared-util`** - Shared utilities and models
