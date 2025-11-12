import { Injectable, inject } from '@angular/core';
import { Observable, tap, catchError, of, switchMap } from 'rxjs';
import { ChatStore } from '../store/chat.store';
import { ChatRepositoryService } from '../repositories/chat-repository.service';
import { AiChatApiService } from './ai-chat-api.service';
import { ChatMessage, Conversation } from '../models/chat.models';
import { Auth } from '@angular/fire/auth';

/**
 * Service for managing chat operations with store integration
 */
@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly store = inject(ChatStore);
  private readonly repository = inject(ChatRepositoryService);
  private readonly apiService = inject(AiChatApiService);
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

    return this.repository.getConversations(userId).pipe(
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

    return this.repository.createConversation(userId, title).pipe(
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

    return this.repository.getMessages(conversationId).pipe(
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
    return this.apiService.sendMessage(conversationId, message).pipe(
      switchMap(response => {
        // Remove optimistic message and add real messages from backend
        this.store.removeOptimisticMessage(tempUserId);

        // Backend saves both user and assistant messages to Firestore
        // So we need to reload messages to get the real IDs
        return this.repository.getMessages(conversationId).pipe(
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

    return this.repository.deleteConversation(conversationId).pipe(
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
    this.repository.updateConversationTimestamp(conversationId).subscribe({
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
   * Clear error state
   */
  clearError(): void {
    this.store.clearError();
  }
}
