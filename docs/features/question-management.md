# Feature: Question management

## Purpose
Let a verified user maintain their personal bank of interview questions — the raw material every
other feature draws on.

## Actors
Verified user (owner of the questions).

## Behavior
- **Create / edit / delete** questions. A question has an English answer (`answer`) and a Polish
  answer (`answerPl`), and may be tagged with a category, a qualification, and free-form `tags`.
- Toggle a question's **active** state; only active questions are eligible for randomization.
- **List** view supports sorting, pagination, and filtering (design-system table).
- **Import / export** question sets (bulk) via the question import/export services.
- Answers may contain rich text/HTML.

## Acceptance criteria
- **Given** a verified user, **when** they create a question with required fields
  (`question`, `answer`, `answerPl`, `isActive`), **then** it is persisted to the `questions`
  collection with their `userId`.
- **Given** an existing question, **when** the user clears its tags, **then** the `tags` field is
  removed from the document (not stored as `undefined`/empty).
- **Given** a question referencing a category, **when** that category is later deleted, **then** the
  question's `categoryId` is nulled (see [category-management](category-management.md)); the
  question itself is not deleted.
- **Given** a user's list, **when** it renders, **then** only that user's questions appear
  (`where userId == currentUser`); no other user's questions are visible.
- **Given** an import file, **when** the user imports, **then** valid rows are created in a batch and
  the result reflects created ids/count.

## Data touched
`questions` (primary). References `categories`, `qualifications`. Shapes: [`schema.json`](../schema.json).

## Out of scope
Randomization/selection logic (see [randomization](randomization.md)); category/qualification CRUD
(their own specs).
