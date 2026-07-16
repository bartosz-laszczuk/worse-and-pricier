# API — consumed contracts

This frontend is a **consumer**, not a producer. It does not own an OpenAPI file. This document
specifies the one HTTP contract it depends on. Direct Firestore data shapes are specified
separately in [`schema.json`](schema.json); the rationale for the two-surface split is in
[`architecture.md`](architecture.md).

## Backend AI Agent API

- **Base URL:** `AppConfig.aiAgentApiUrl` (default `http://localhost:5000/api`).
- **Auth:** every request sends `Authorization: Bearer <Firebase ID token>`. Unauthenticated calls
  must fail before dispatch.
- **Owner:** `question-randomizer-backend`. That repo owns the canonical contract.

### Single-source-of-truth strategy (target)

> ⚠️ **DRIFT / TODO.** The request/response types below are currently **hand-maintained** in
> `libs/question-randomizer/dashboard/ai-chat/data-access/src/lib/models/chat.models.ts`. That is a
> duplication of the backend's contract. Target state: the backend publishes its OpenAPI spec and
> this app **generates** these types from it (with a CI freshness check), so there is exactly one
> source of truth. Until then, treat `chat.models.ts` as a mirror that must be reconciled on every
> backend contract change.

### Endpoints consumed

| Method | Path | Request | Response |
|--------|------|---------|----------|
| POST | `/chat` | `ChatRequest { conversationId, message }` | `ChatResponse { response, conversationId, messageId }` |
| POST | `/conversations` | `CreateConversationRequest { title }` | `Conversation { id, userId, title, createdAt, updatedAt }` |
| GET (SSE) | agent task stream | task text (+ optional `conversationId`) | stream of `AgentStreamEvent` |

### Streaming events (`AgentStreamEvent`)

Server-Sent Events power the ChatGPT-like live response. Event `type` is one of:
`started`, `thinking`, `text_chunk`, `tool_call`, `tool_result`, `completed`, `error`.
Payload fields: `message?`, `content?`, `toolName?`, `toolInput?`, `toolResult?`, `timestamp?`.

Behavioral requirements for consuming the stream are specified in
[`features/ai-chat-assistant.md`](features/ai-chat-assistant.md).
