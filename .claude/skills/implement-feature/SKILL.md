---
name: implement-feature
description: Orchestrates the full implement → review → fix loop. Delegates to feature-implementer, then feature-reviewer, and loops until the reviewer returns Ready for merge YES.
disable-model-invocation: true
---

# Implement Feature

You are the orchestrator. Do not write code yourself. Follow this loop:

## Step 1 — Implement

Spawn the `feature-implementer` agent with this exact prompt:

> Implement the following feature: $ARGUMENTS
>
> Before writing anything, read CLAUDE.md and docs/MODULE_BOUNDARIES.md, then read at least one existing file of the same type you are about to create.

Wait for it to finish.

## Step 2 — Review

Spawn the `feature-reviewer` agent with this exact prompt:

> Review the feature that was just implemented: $ARGUMENTS
>
> Follow your full 12-step review process and return your complete structured report including the "Ready for merge: YES / NO" verdict.

## Step 3 — Evaluate

Read the reviewer's report verdict.

**If Ready for merge: YES** — go to Step 4.

**If Ready for merge: NO** — spawn `feature-implementer` again with this prompt:

> Fix all issues found during review of: $ARGUMENTS
>
> Full reviewer report:
>
> [insert the complete reviewer report here]
>
> Fix every VIOLATION, HIGH, and MEDIUM issue. Do not add features beyond what is needed to resolve the reported issues.

Then go back to Step 2.

## Step 4 — Done

Report to the user:
- How many review/fix cycles it took
- A brief summary of what was implemented
- Confirmation that the reviewer returned "Ready for merge: YES"
