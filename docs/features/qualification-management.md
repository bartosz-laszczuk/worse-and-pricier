# Feature: Qualification management

## Purpose
Let a verified user tag questions by qualification level (e.g. "Junior", "Senior") for
organization and filtering.

## Actors
Verified user (owner).

## Behavior
- **Create / edit / delete** qualifications (a qualification is a user-scoped `name`).
- Deleting a qualification clears it from referencing questions rather than deleting them.

## Acceptance criteria
- **Given** a verified user, **when** they create a qualification, **then** it is persisted to
  `qualifications` with their `userId`.
- **Given** a qualification referenced by questions, **when** the user deletes it, **then** the
  qualification document is removed **and** all that user's questions with that `qualificationId`
  are updated to `qualificationId = null` (batch).
- **Given** any list/read, **then** only the current user's qualifications are returned.

## Data touched
`qualifications` (primary); cascades to `questions.qualificationId`. Shapes: [`schema.json`](../schema.json).

## Out of scope
Question CRUD (see [question-management](question-management.md)).
