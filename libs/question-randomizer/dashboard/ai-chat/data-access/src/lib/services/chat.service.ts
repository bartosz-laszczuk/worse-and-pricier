import { Injectable, inject } from '@angular/core';
import { Observable, tap, catchError, of, switchMap, finalize } from 'rxjs';
import { ChatStore } from '../store/chat.store';
import { ChatRepository } from '../repositories/chat.repository';
import { AiChatApiRepository } from '../repositories/ai-chat-api.repository';
import { ChatMessage, Conversation, AgentStreamEvent } from '../models/chat.models';
import { Auth } from '@angular/fire/auth';

/**
 * Service for managing chat operations with store integration
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly store = inject(ChatStore);
  private readonly chatRepository = inject(ChatRepository);
  private readonly aiChatApiRepository = inject(AiChatApiRepository);
  private readonly auth = inject(Auth);

  /**
   * Load all conversations for the current user
   */
  loadConversations(): Observable<Conversation[]> {
    const userId = this.auth.currentUser?.uid;

    if (!userId) {
      this.store.logError('User not authenticated');
      return of([]);
    }

    this.store.startLoading();

    return this.chatRepository.getConversations(userId).pipe(
      tap(conversations => this.store.loadConversations(conversations)),
      catchError(error => {
        console.error('Error loading conversations:', error);
        this.store.logError('Failed to load conversations');
        return of([]);
      })
    );
  }

  /**
   * Create a new conversation
   */
  createConversation(title: string): Observable<Conversation | null> {
    const userId = this.auth.currentUser?.uid;

    if (!userId) {
      this.store.logError('User not authenticated');
      return of(null);
    }

    this.store.startLoading();

    return this.chatRepository.createConversation(userId, title).pipe(
      tap(conversation => {
        this.store.addConversation(conversation);
        this.store.setCurrentConversation(conversation.id);
      }),
      catchError(error => {
        console.error('Error creating conversation:', error);
        this.store.logError('Failed to create conversation');
        return of(null);
      })
    );
  }

  /**
   * Select a conversation and load its messages
   */
  selectConversation(conversationId: string): Observable<ChatMessage[]> {
    this.store.setCurrentConversation(conversationId);
    this.store.startLoading();

    return this.chatRepository.getMessages(conversationId).pipe(
      tap(messages => this.store.loadMessages(messages)),
      catchError(error => {
        console.error('Error loading messages:', error);
        this.store.logError('Failed to load messages');
        return of([]);
      })
    );
  }

  /**
   * Send a message to the AI agent
   */
  sendMessage(message: string): Observable<string | null> {
    const conversationId = this.store.currentConversationId();

    if (!conversationId) {
      this.store.logError('No conversation selected');
      return of(null);
    }

    // Stop any ongoing loading to ensure optimistic message shows
    this.store.stopLoading();

    // Create optimistic user message
    const tempUserId = `temp-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempUserId,
      conversationId,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    // Add optimistic message to UI
    this.store.addOptimisticMessage(userMessage);

    // Send to backend
    return this.aiChatApiRepository.sendMessage(conversationId, message).pipe(
      switchMap(response => {
        // Remove optimistic message and add real messages from backend
        this.store.removeOptimisticMessage(tempUserId);

        // Backend saves both user and assistant messages to Firestore
        // So we need to reload messages to get the real IDs
        return this.chatRepository.getMessages(conversationId).pipe(
          tap(messages => {
            this.store.loadMessages(messages);
            this.updateConversationTimestamp(conversationId);
          }),
          switchMap(() => of(response.response))
        );
      }),
      catchError(error => {
        console.error('Error sending message:', error);
        this.store.removeOptimisticMessage(tempUserId);
        this.store.logError('Failed to send message');
        return of(null);
      })
    );
  }

  /**
   * Delete a conversation
   */
  deleteConversation(conversationId: string): Observable<boolean> {
    this.store.startLoading();

    return this.chatRepository.deleteConversation(conversationId).pipe(
      tap(() => this.store.deleteConversation(conversationId)),
      switchMap(() => of(true)),
      catchError(error => {
        console.error('Error deleting conversation:', error);
        this.store.logError('Failed to delete conversation');
        return of(false);
      })
    );
  }

  /**
   * Update conversation timestamp
   */
  private updateConversationTimestamp(conversationId: string): void {
    this.chatRepository.updateConversationTimestamp(conversationId).subscribe({
      next: () => {
        this.store.updateConversation(conversationId, {
          updatedAt: new Date()
        });
      },
      error: error => {
        console.error('Error updating conversation timestamp:', error);
      }
    });
  }

  /**
   * Send a message with real-time streaming support
   * Uses SignalR to stream agent responses in real-time
   */
  sendMessageWithStreaming(message: string): Observable<AgentStreamEvent> {
    const conversationId = this.store.currentConversationId();

    if (!conversationId) {
      this.store.logError('No conversation selected');
      return of({
        type: 'error' as const,
        message: 'No conversation selected',
        timestamp: new Date()
      } as AgentStreamEvent);
    }

    // Stop any ongoing loading
    this.store.stopLoading();

    // Create optimistic user message
    const tempUserId = `temp-user-${Date.now()}`;
    const userMessage: ChatMessage = {
      id: tempUserId,
      conversationId,
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    // Add optimistic message to UI
    this.store.addOptimisticMessage(userMessage);

    // Track if we've added the assistant message
    let assistantMessageAdded = false;
    let assistantContent = '';

    // Stream the response
    return this.aiChatApiRepository.sendMessageWithStreaming(conversationId, message).pipe(
      tap(event => {
        console.log('[ChatService] Stream event:', event);

        // Handle different event types
        switch (event.type) {
          case 'started':
            console.log('[ChatService] Task started, waiting for processing...');
            break;

          case 'thinking':
            console.log('[ChatService] Agent is thinking...');
            break;

          case 'text_chunk':
            // Real-time text streaming (ChatGPT-like)
            console.log('[ChatService] Text chunk:', event.content);
            // TODO: Implement progressive text display in UI
            break;

          case 'tool_call':
            console.log('[ChatService] Calling tool:', event.toolName);
            break;

          case 'tool_result':
            console.log('[ChatService] Tool result:', event.toolResult);
            break;

          case 'completed':
            // Remove optimistic message
            this.store.removeOptimisticMessage(tempUserId);

            // Store the assistant's response content
            assistantContent = event.content || '';

            // Add assistant message optimistically
            if (!assistantMessageAdded) {
              const tempAssistantId = `temp-assistant-${Date.now()}`;
              const assistantMessage: ChatMessage = {
                id: tempAssistantId,
                conversationId,
                role: 'assistant',
                content: assistantContent,
                timestamp: new Date()
              };
              this.store.addOptimisticMessage(assistantMessage);
              assistantMessageAdded = true;

              // Reload messages from Firestore to get real IDs
              this.chatRepository.getMessages(conversationId).subscribe({
                next: messages => {
                  this.store.loadMessages(messages);
                  this.updateConversationTimestamp(conversationId);
                },
                error: error => {
                  console.error('Error reloading messages:', error);
                }
              });
            }
            break;

          case 'error':
            console.error('[ChatService] Stream error:', event.message);
            this.store.removeOptimisticMessage(tempUserId);
            this.store.logError(event.message || 'Failed to process message');
            break;
        }
      }),
      catchError(error => {
        console.error('[ChatService] Streaming error:', error);
        this.store.removeOptimisticMessage(tempUserId);
        this.store.logError('Failed to send message');
        return of({
          type: 'error' as const,
          message: error.message || 'Unknown error',
          timestamp: new Date()
        } as AgentStreamEvent);
      }),
      finalize(() => {
        console.log('[ChatService] Stream completed');
      })
    );
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.store.clearError();
  }
}
