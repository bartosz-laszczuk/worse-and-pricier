# ai-chat-ui

Presentational UI components for the AI Chat domain. Contains dumb components for displaying and interacting with chat conversations.

## Library Type

`type:ui` | `scope:dashboard-ai-chat`

## Components

### ChatMessageComponent

Displays a single chat message with role-based styling.

**Selector:** `wap-chat-message`

**Inputs:**
- `message: Message` - The message to display (required)

**Features:**
- Different styling for user vs assistant messages
- Timestamp display
- Markdown content support

### ChatInputComponent

Text input component for composing and sending messages.

**Selector:** `wap-chat-input`

**Inputs:**
- `disabled: boolean` - Disable input when waiting for response
- `placeholder: string` - Input placeholder text

**Outputs:**
- `messageSent: EventEmitter<string>` - Emits when user submits a message

**Features:**
- Multi-line text area
- Submit on Enter (Shift+Enter for newline)
- Send button

### ConversationListComponent

Displays a list of conversations for selection.

**Selector:** `wap-conversation-list`

**Inputs:**
- `conversations: Conversation[]` - List of conversations to display
- `activeConversationId: string | null` - Currently selected conversation

**Outputs:**
- `conversationSelected: EventEmitter<string>` - Emits conversation id on selection
- `conversationDeleted: EventEmitter<string>` - Emits conversation id on delete
- `newConversation: EventEmitter<void>` - Emits when user clicks new conversation

**Features:**
- Conversation title display
- Active state highlighting
- Delete action
- New conversation button

## Import Path

```typescript
import {
  ChatMessageComponent,
  ChatInputComponent,
  ConversationListComponent
} from '@worse-and-pricier/question-randomizer-dashboard-ai-chat-ui';
```

## Running unit tests

```bash
npx nx test question-randomizer-dashboard-ai-chat-ui
```
