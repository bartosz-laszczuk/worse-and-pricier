# Overview — Question Randomizer (frontend)

## What this is

Question Randomizer is a web application that helps people **prepare for interviews** by
building a personal bank of questions and drilling them through **randomized practice sessions**.
This repository (`worse-and-pricier`) is the **Angular frontend** — the user-facing surface of
the wider Question Randomizer system.

## Who it's for

- **Interview candidates** organizing what they need to study and practicing under
  randomized recall.
- **Interviewers** maintaining a reusable, categorized pool of questions to draw from during
  real interviews (see the *Interview mode* feature).

Each user's data is private to them; all reads and writes are scoped by `userId`.

## The problem it solves

Studying from a static, ordered list produces false confidence — you memorize the *order*, not
the material. Manually shuffling questions, tracking which you've already seen, and deferring the
ones you want to revisit is tedious. Question Randomizer automates that loop:

- Capture questions with answers (bilingual: English + Polish), categories, qualifications, and tags.
- Run a randomization session that draws unseen questions, lets you postpone some, and tracks
  what's been used — so practice mirrors the unpredictability of a real interview.
- Optionally manage the whole data set conversationally through an **AI chat assistant**.

## Scope of *this* repository

In scope:
- All UI, routing, client-side state, theming, and internationalization.
- **Direct** Firestore access for questions, categories, qualifications, and randomization state.
- **Consuming** the backend AI Agent HTTP API for the AI chat feature.

Out of scope (owned elsewhere):
- The AI agent, its tools, and background processing → `question-randomizer-backend`.
- System-wide architecture and the canonical data model → the `question-randomizer` coordination repo.

## Success criteria (product-level)

- A signed-in, email-verified user can create/edit/delete questions, categories, and qualifications.
- A user can run a randomization session that never repeats a used question within the session
  and honors postponed questions.
- A user can drive data management through natural-language chat.
- All user-facing text is available in English and Polish.
- No user can read or mutate another user's data.

## Tech stack

The structure and technology decisions are owned by [`architecture.md`](architecture.md).
This document deliberately does not restate them.
