# API — consumed contracts

This frontend is a **consumer**, not a producer. It does not own an OpenAPI file. The **only**
backend HTTP contract it truly depends on is the AI **agent execution** endpoint (SSE). Everything
else the AI-chat feature needs — conversations and messages — is read/written **directly in
Firestore** (see [`schema.json`](schema.json)), like the rest of the app's data. Rationale for the
data-surface split: [`architecture.md`](architecture.md).

## Backend AI Agent API — the one real dependency

- **Endpoint:** `POST {aiAgentApiUrl}/api/agent/execute` (default base `http://localhost:5000`).
- **Auth:** `Authorization: Bearer <Firebase ID token>`; unauthenticated calls fail before dispatch.
- **Request:** `{ task: string, conversationId?: string | null }`, `Accept: text/event-stream`.
- **Response:** a **Server-Sent Events** stream of `AgentStreamEvent` (see below).
- **Owner:** `question-randomizer-backend` (that repo owns the canonical contract).

Implemented by `AgentStreamService` (`agent-stream.service.ts`); this matches the backend's real
`POST /api/agent/execute`.

### Streaming events (`AgentStreamEvent`)

Event `type` is one of: `started`, `thinking`, `text_chunk`, `tool_call`, `tool_result`,
`completed`, `error`. Payload fields: `message?`, `content?`, `toolName?`, `toolInput?`,
`toolResult?`, `timestamp?`. The stream completes on `completed` or `error`. Behavioral
requirements: [`features/ai-chat-assistant.md`](features/ai-chat-assistant.md).

## Conversations & messages — Firestore-direct (not the backend)

`ChatRepository` (`chat.repository.ts`) reads/writes the `conversations` and `messages` collections
**directly in Firestore** (list/create conversation, list/add message, update timestamp, delete
conversation + its messages). These are specified in [`schema.json`](schema.json), not here.

## ⚠️ Drift / dead code to reconcile

- **`AiChatApiRepository.sendMessage` → `POST {aiAgentApiUrl}/chat`** and
  **`createConversation` → `POST {aiAgentApiUrl}/conversations`** exist in
  `ai-chat-api.repository.ts`, but:
  - the backend exposes **no `/api/chat` endpoint** (only `/api/agent/execute`), so the `/chat` call
    has no counterpart — it appears to be **legacy** superseded by the SSE streaming path;
  - conversation creation actually goes through the **Firestore-direct** `ChatRepository`, not this
    HTTP method.
- **`chat.models.ts`** hand-maintains the request/response types. If any real HTTP contract remains,
  target state is to **generate** types from the backend's OpenAPI with a CI freshness check rather
  than mirror them by hand.
