# ai-chat-shell

Shell library for the AI Chat domain. Contains the main container component and route configuration for the AI chat interface.

## Library Type

`type:shell` | `scope:dashboard-ai-chat`

## Components

### AiChatShellComponent

Main container component that composes the AI chat interface.

**Selector:** `wap-ai-chat-shell`

**Features:**
- Provides `ChatStore` and `ChatService` at component level
- Composes conversation list and chat interface
- Handles conversation selection and message sending
- Responsive layout with sidebar for conversations

**Architecture:**
- Injects and orchestrates all AI chat services
- Connects UI components to the store via signals
- Manages loading and error states

## Route Configuration

The shell is lazy-loaded at `/dashboard/ai-chat`:

```typescript
// In dashboard-shell.routes.ts
{
  path: 'ai-chat',
  loadComponent: () =>
    import('@worse-and-pricier/question-randomizer-dashboard-ai-chat-shell')
      .then(m => m.AiChatShellComponent)
}
```

## Import Path

```typescript
import { AiChatShellComponent } from '@worse-and-pricier/question-randomizer-dashboard-ai-chat-shell';
```

## Dependencies

- `@worse-and-pricier/question-randomizer-dashboard-ai-chat-data-access` - Store and services
- `@worse-and-pricier/question-randomizer-dashboard-ai-chat-ui` - UI components
- `@worse-and-pricier/design-system` - Design system components

## Running unit tests

```bash
npx nx test question-randomizer-dashboard-ai-chat-shell
```
