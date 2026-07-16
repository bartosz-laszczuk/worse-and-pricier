# Feature: Interview mode

## Purpose
A focused practice/interview surface (`/dashboard/interview`) for working through a randomized set
of questions as a session — geared toward conducting or simulating a real interview rather than the
quick-drill randomization view.

## Actors
Verified user (candidate practicing, or interviewer running a session).

## Behavior
- Present questions from the user's pool for an interview session, tracking progress through the set.
- Reveal answers per question during the session.
- Review state for a completed session.

> ⚠️ **SPEC GAP.** This behavior is reverse-derived from the route and store presence
> (`interview.store.ts`, `InterviewShellComponent`). The precise rules — how the interview set is
> chosen, whether it shares session state with [randomization](randomization.md), and what "review
> mode" persists — must be confirmed against the implementation and pinned down here before this
> feature is treated as fully specified.

## Acceptance criteria (provisional — confirm against implementation)
- **Given** a verified user, **when** they enter interview mode, **then** they are presented
  questions from their own pool only.
- **Given** an in-progress interview, **when** they advance, **then** progress through the set is
  tracked and reflected in the UI.
- **Given** a completed interview, **when** they review it, **then** the questions/answers covered
  are viewable.

## Data touched
Interview store state; reads `questions`. Confirm whether any session data is persisted to Firestore
and, if so, add the collection to [`schema.json`](../schema.json).

## Out of scope
Randomization drill loop (see [randomization](randomization.md)).
