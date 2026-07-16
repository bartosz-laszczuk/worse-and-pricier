# Feature: AI chat assistant

## Purpose
A conversational interface (`/dashboard/ai-chat`) that lets a user manage their data and ask
questions in natural language, backed by the server-side AI agent. It is the **only** feature that
calls the backend HTTP API — but only for **agent execution** (`POST /api/agent/execute`, SSE);
its conversations and messages are stored **directly in Firestore** like the rest of the app.

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
- **Given** a new conversation, **when** created, **then** it is written to Firestore
  (`conversations`) with the user's `userId` and can host subsequent messages.
- **Given** a conversation is deleted, **then** its messages are deleted with it (batch).

## Data touched
- **Agent execution:** backend `POST /api/agent/execute` (SSE) — contract in [`api.md`](../api.md).
- **Conversations & messages:** written **directly to Firestore** by `ChatRepository`
  (`conversations`, `messages`) — shapes in [`schema.json`](../schema.json).

## Dependencies
Backend reachable at `AppConfig.aiAgentApiUrl` (for agent execution only); Firestore (for chat
history).

## Out of scope
Agent tool implementations and background processing (owned by `question-randomizer-backend`).
