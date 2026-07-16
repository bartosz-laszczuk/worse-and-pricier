# Feature: Randomization

## Purpose
The core practice loop: draw the user's active questions in random order, one at a time, without
repeating within a session, while letting the user reveal answers and postpone questions. This is
the app's default route (`/dashboard/randomization`).

## Actors
Verified user (the person practicing).

## Behavior
- The user **selects categories** to scope the session (persisted as `selectedCategories`). The
  eligible pool is the user's **active** questions in the selected categories.
- Start/continue a session: the app maintains one `randomizations` document per user with a
  `status` of Ongoing (1) or Finished (2).
- **Draw** a random question from the pool that has not yet been used this session.
- **Reveal answer** toggles `showAnswer` for the current question.
- **Postpone** the current question: it is set aside (`postponedQuestions`) and re-offered before the
  session finishes rather than counting as used.
- **Use up** a question: once drawn and moved on from, it is recorded in `usedQuestions` and is not
  drawn again this session.
- When no eligible questions remain (all used, none postponed), the session becomes **Finished**.
- The user can **reset** a session to start fresh.

## Acceptance criteria
- **Given** a selected category set, **when** a session runs, **then** every drawn question is
  active, belongs to the user, and falls within the selected categories.
- **Given** a drawn question, **when** the user advances, **then** it is recorded in `usedQuestions`
  and never drawn again while the session status is Ongoing.
- **Given** the user postpones the current question, **then** it is not recorded as used and is
  re-offered before the session is marked Finished.
- **Given** the current question, **when** the user toggles reveal, **then** `showAnswer` flips and
  persists on the randomization document.
- **Given** the eligible pool is exhausted (no unused, no outstanding postponed), **then** `status`
  becomes Finished (2).
- **Given** persistence, **then** only `currentQuestionId` (not the full question) is written to the
  `randomizations` document; the client hydrates `currentQuestion` from the question store.
- **Given** two different users, **then** neither can observe the other's session state.

## Data touched
`randomizations`, `selectedCategories`, `usedQuestions`, `postponedQuestions`; reads `questions`.
Shapes and the `RandomizationStatus` enum: [`schema.json`](../schema.json).

## Out of scope
Interview mode (see [interview-mode](interview-mode.md)); question/category CRUD.
