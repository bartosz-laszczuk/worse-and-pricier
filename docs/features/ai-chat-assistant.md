# Feature: AI chat assistant

## Purpose
A conversational interface (`/dashboard/ai-chat`) that lets a user manage their data and ask
questions in natural language, backed by the server-side AI agent. This is the **only** feature that
uses the backend HTTP API rather than direct Firestore access.

## Actors
Verified user.

## Behavior
- Start a **conversation** and exchange messages with the assistant.
- The assistant's reply streams token-by-token (ChatGPT-like) via Server-Sent Events, surfacing
  intermediate agent activity (thinking, tool calls, tool results) before the final answer.
- Every backend call is authenticated with the user's Firebase ID token.

## Acceptance criteria
- **Given** an unauthenticated state, **when** a chat request would be sent, **then** it fails before
  dispatch (no anonymous calls).
- **Given** the user sends a message, **when** the agent responds, **then** the UI renders streamed
  `AgentStreamEvent`s in order: `started` → (`thinking` | `tool_call` → `tool_result` | `text_chunk`)*
  → `completed`, and an `error` event surfaces a visible error state.
- **Given** a `text_chunk` stream, **then** the assistant message is appended incrementally, not only
  on completion.
- **Given** a new conversation, **when** created, **then** it is associated with the user's `userId`
  (server-assigned) and can host subsequent messages.

## Data touched
Backend AI Agent API only — endpoints, request/response types, and stream event shapes are specified
in [`api.md`](../api.md). Conversations/messages are owned and persisted by the backend, **not** by
this repo's [`schema.json`](../schema.json).

## Dependencies
Backend running and reachable at `AppConfig.aiAgentApiUrl`.

## Out of scope
Agent tool implementations and background processing (owned by `question-randomizer-backend`).
