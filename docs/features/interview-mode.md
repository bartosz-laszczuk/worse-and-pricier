# Feature: Interview mode

## Purpose
A read-only **reference/browse view** (`/dashboard/interview`) of the user's entire question bank
with answers visible, designed for use *during* an interview: quickly search, sort, and page
through all questions and read the answer in the active language. Unlike
[randomization](randomization.md), it does not draw, hide, or track questions — everything is
visible and lookup-oriented.

## Actors
Verified user (typically an interviewer referencing their bank while conducting an interview).

## Behavior
- On entry, load **all** of the user's questions from the shared `QuestionListStore` (a one-time
  read of the in-memory question dictionary; no separate fetch).
- Present them in a table with two columns: **Question** and **Answer**.
- **Answer is language-aware:** show `answerPl` when the active Transloco language is `pl`,
  otherwise `answer`. Switching language re-renders the answers immediately.
- **Search** (debounced ~50 ms) filters client-side:
  - Plain text matches across `question`, `answer`, `answerPl`, and `tags` (OR logic).
  - Category-prefix search syntax is supported: a category phrase filters by `categoryName`, with
    an optional trailing text phrase further filtering the remaining columns (shared
    `parseCategorySearch` behavior).
- **Sort** by column (default `question`, ascending) and **paginate** (default page size 10).
- The view is **read-only** — no create/edit/delete, no reveal/hide toggle (both question and
  answer are always shown), no session or progress state, and nothing is persisted.

## Acceptance criteria
- **Given** a verified user with questions, **when** they open interview mode, **then** the table
  shows their questions with both Question and Answer columns; only their own questions appear.
- **Given** the active language is `pl`, **when** the table renders, **then** each row's Answer
  shows `answerPl`; **when** the user switches to `en`, **then** answers re-render as `answer`
  without a reload.
- **Given** a search term, **when** entered, **then** after the debounce the list is filtered
  client-side across question/answer/answerPl/tags (OR logic) and pagination resets to page 0.
- **Given** a category-prefix search with a trailing text phrase, **then** results are narrowed by
  `categoryName` and then by the text phrase.
- **Given** a sort or page change, **then** the displayed rows update accordingly; the default sort
  is `question` ascending and default page size is 10.
- **Given** interview mode, **then** no data is written and no Firestore document is created or
  updated.

## Data touched
Reads the user's questions in memory via the shared `QuestionListStore` (sourced from the
`questions` collection — see [`schema.json`](../schema.json)). No writes; no interview-specific
collection.

## Out of scope
The randomization drill loop, used/postponed tracking, and answer reveal/hide (see
[randomization](randomization.md)); question CRUD (see [question-management](question-management.md)).
