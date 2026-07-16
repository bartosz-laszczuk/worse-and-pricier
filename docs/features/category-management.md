# Feature: Category management

## Purpose
Let a verified user organize questions into named categories (e.g. "JavaScript", "System Design")
used for grouping and for scoping randomization sessions.

## Actors
Verified user (owner).

## Behavior
- **Create / edit / delete** categories (a category is just a user-scoped `name`).
- Deleting a category must not orphan questions: every question referencing it has its
  `categoryId` cleared.

## Acceptance criteria
- **Given** a verified user, **when** they create a category, **then** it is persisted to
  `categories` with their `userId`.
- **Given** a category in use by questions, **when** the user deletes it, **then** the category
  document is removed **and** all that user's questions with that `categoryId` are updated to
  `categoryId = null` (batch), leaving the questions intact.
- **Given** any list/read, **then** only the current user's categories are returned.

## Data touched
`categories` (primary); cascades to `questions.categoryId`. Shapes: [`schema.json`](../schema.json).

## Out of scope
Randomization category selection (see [randomization](randomization.md)).
