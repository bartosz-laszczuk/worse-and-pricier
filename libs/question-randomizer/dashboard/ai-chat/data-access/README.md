# ai-chat-data-access

Data access library for the AI Chat domain. Contains state management, services, repositories, and models for managing conversations and messages with the AI assistant.

## Library Type

`type:data-access` | `scope:dashboard-ai-chat`

## Public API

### Models

- `Conversation` - Conversation entity with id, title, timestamps
- `Message` - Message entity with id, role (user/assistant), content, timestamps
- `ChatState` - State interface for the chat store

### Store

- `ChatStore` - NgRx SignalStore for managing conversations and messages
  - Normalized state pattern with `entities` and `ids`
  - Computed selectors for active conversation, sorted messages
  - Methods for CRUD operations on conversations and messages

### Services

- `ChatService` - Orchestrates store and repository communication
  - `loadConversations()` - Load user's conversations from Firestore
  - `createConversation()` - Create a new conversation
  - `selectConversation()` - Set active conversation and load messages
  - `sendMessage()` - Send message to AI and handle response
  - `deleteConversation()` - Delete conversation and its messages

### Repositories

- `ChatRepository` - Firestore CRUD operations
  - Manages `conversations` and `messages` collections
  - Handles document mapping between Firestore and domain models

- `AiChatApiRepository` - HTTP client for backend AI agent API
  - `sendMessage()` - Send message to AI agent endpoint
  - `createConversation()` - Create conversation via API

## Import Path

```typescript
import {
  ChatStore,
  ChatService,
  ChatRepository,
  AiChatApiRepository,
  Conversation,
  Message
} from '@worse-and-pricier/question-randomizer-dashboard-ai-chat-data-access';
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌────────────────┐
│ ChatService │────▶│  ChatStore  │     │ ChatRepository │
└─────────────┘     └─────────────┘     └────────────────┘
       │                                        │
       │            ┌──────────────────┐         │
       └───────────▶│AiChatApiRepository│        │
                    └──────────────────┘         ▼
                           │               ┌──────────┐
                           ▼               │ Firestore│
                    ┌────────────┐         └──────────┘
                    │ AI Agent   │
                    │ Backend    │
                    └────────────┘
```

## Running unit tests

```bash
npx nx test question-randomizer-dashboard-ai-chat-data-access
```
