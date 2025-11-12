import { computed } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { ChatMessage, Conversation } from '../models/chat.models';

type NormalizedChatState = {
  // Conversations
  conversations: Record<string, Conversation> | null;
  conversationIds: string[] | null;

  // Messages for current conversation
  messages: Record<string, ChatMessage> | null;
  messageIds: string[] | null;

  // Current active conversation
  currentConversationId: string | null;

  // UI State
  isLoading: boolean;
  isSending: boolean; // Separate flag for sending messages
  error: string | null;
};

const initialState: NormalizedChatState = {
  conversations: null,
  conversationIds: null,
  messages: null,
  messageIds: null,
  currentConversationId: null,
  isLoading: false,
  isSending: false,
  error: null
};

export const ChatStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),

  withComputed(store => {
    const sortedConversations = computed(() => {
      const conversations = store.conversations();
      const ids = store.conversationIds();

      if (!conversations || !ids) return [];

      return ids
        .map(id => conversations[id])
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    });

    const currentConversationMessages = computed(() => {
      const messages = store.messages();
      const ids = store.messageIds();

      if (!messages || !ids) return [];

      return ids.map(id => messages[id]).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    });

    const currentConversation = computed(() => {
      const conversationId = store.currentConversationId();
      const conversations = store.conversations();

      if (!conversationId || !conversations) return null;

      return conversations[conversationId] || null;
    });

    return {
      sortedConversations,
      currentConversationMessages,
      currentConversation
    };
  }),

  withMethods(store => ({
    // Conversation methods
    loadConversations(conversations: Conversation[]) {
      const normalized = conversations.reduce(
        (acc, conversation) => {
          acc.conversations[conversation.id] = conversation;
          acc.conversationIds.push(conversation.id);
          return acc;
        },
        {
          conversations: {} as Record<string, Conversation>,
          conversationIds: [] as string[]
        }
      );

      patchState(store, {
        conversations: normalized.conversations,
        conversationIds: normalized.conversationIds,
        isLoading: false,
        error: null
      });
    },

    addConversation(conversation: Conversation) {
      patchState(store, state => ({
        conversations: {
          ...(state.conversations ?? {}),
          [conversation.id]: conversation
        },
        conversationIds: [conversation.id, ...(state.conversationIds ?? [])],
        isLoading: false,
        error: null
      }));
    },

    updateConversation(conversationId: string, data: Partial<Conversation>) {
      patchState(store, state => {
        if (!state.conversations || !state.conversations[conversationId]) return state;

        return {
          conversations: {
            ...state.conversations,
            [conversationId]: {
              ...state.conversations[conversationId],
              ...data
            }
          }
        };
      });
    },

    deleteConversation(conversationId: string) {
      patchState(store, state => {
        if (!state.conversations || !state.conversationIds) return state;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [conversationId]: _, ...remainingConversations } = state.conversations;

        return {
          conversations: remainingConversations,
          conversationIds: state.conversationIds.filter(id => id !== conversationId),
          currentConversationId:
            state.currentConversationId === conversationId ? null : state.currentConversationId,
          messages: state.currentConversationId === conversationId ? null : state.messages,
          messageIds: state.currentConversationId === conversationId ? null : state.messageIds
        };
      });
    },

    // Current conversation selection
    setCurrentConversation(conversationId: string | null) {
      patchState(store, {
        currentConversationId: conversationId,
        messages: null,
        messageIds: null
      });
    },

    // Message methods
    loadMessages(messages: ChatMessage[]) {
      const normalized = messages.reduce(
        (acc, message) => {
          acc.messages[message.id] = message;
          acc.messageIds.push(message.id);
          return acc;
        },
        {
          messages: {} as Record<string, ChatMessage>,
          messageIds: [] as string[]
        }
      );

      patchState(store, {
        messages: normalized.messages,
        messageIds: normalized.messageIds,
        isLoading: false,
        error: null
      });
    },

    addMessage(message: ChatMessage) {
      patchState(store, state => ({
        messages: {
          ...(state.messages ?? {}),
          [message.id]: message
        },
        messageIds: [...(state.messageIds ?? []), message.id],
        isSending: false,
        error: null
      }));
    },

    addOptimisticMessage(message: ChatMessage) {
      // Add a message immediately while waiting for backend response
      patchState(store, state => ({
        messages: {
          ...(state.messages ?? {}),
          [message.id]: message
        },
        messageIds: [...(state.messageIds ?? []), message.id],
        isSending: true
      }));
    },

    removeOptimisticMessage(messageId: string) {
      patchState(store, state => {
        if (!state.messages || !state.messageIds) return state;

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [messageId]: _, ...remainingMessages } = state.messages;

        return {
          messages: remainingMessages,
          messageIds: state.messageIds.filter(id => id !== messageId)
        };
      });
    },

    // Loading states
    startLoading() {
      patchState(store, { isLoading: true, error: null });
    },

    startSending() {
      patchState(store, { isSending: true, error: null });
    },

    stopLoading() {
      patchState(store, { isLoading: false });
    },

    stopSending() {
      patchState(store, { isSending: false });
    },

    logError(error: string) {
      patchState(store, {
        isLoading: false,
        isSending: false,
        error
      });
    },

    clearError() {
      patchState(store, { error: null });
    }
  }))
);
