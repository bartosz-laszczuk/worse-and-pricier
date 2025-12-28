import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { APP_CONFIG } from '@worse-and-pricier/question-randomizer-shared-util';
import {
  ChatRequest,
  ChatResponse,
  CreateConversationRequest,
  Conversation,
  AgentTaskRequest,
  QueueTaskResponse,
  AgentStreamEvent
} from '../models/chat.models';
import { SignalRAgentStreamService } from '../services/signalr-agent-stream.service';

/**
 * Repository for communicating with the AI Agent backend API
 */
@Injectable({ providedIn: 'root' })
export class AiChatApiRepository {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly signalRService = inject(SignalRAgentStreamService);
  private readonly apiUrl = this.appConfig.aiAgentApiUrl || 'http://localhost:3001/api';

  /**
   * Send a message to the AI agent
   */
  sendMessage(conversationId: string, message: string): Observable<ChatResponse> {
    const request: ChatRequest = {
      conversationId,
      message
    };

    return this.getAuthHeaders().pipe(
      switchMap(headers => this.http.post<ChatResponse>(`${this.apiUrl}/chat`, request, { headers }))
    );
  }

  /**
   * Create a new conversation
   */
  createConversation(title: string): Observable<Conversation> {
    const request: CreateConversationRequest = { title };

    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post<Conversation>(`${this.apiUrl}/conversations`, request, { headers })
      )
    );
  }

  /**
   * Queue an agent task for background processing
   */
  queueAgentTask(task: string, conversationId?: string): Observable<QueueTaskResponse> {
    const request: AgentTaskRequest = {
      task,
      conversationId
    };

    return this.getAuthHeaders().pipe(
      switchMap(headers =>
        this.http.post<QueueTaskResponse>(`${this.apiUrl}/agent/queue`, request, { headers })
      )
    );
  }

  /**
   * Stream real-time updates for a queued agent task
   * Uses SignalR with automatic reconnection
   */
  streamAgentTask(taskId: string): Observable<AgentStreamEvent> {
    return this.signalRService.streamTaskUpdates(taskId);
  }

  /**
   * Send message with streaming support
   * Queues the task and streams real-time updates
   */
  sendMessageWithStreaming(conversationId: string, message: string): Observable<AgentStreamEvent> {
    return this.queueAgentTask(message, conversationId).pipe(
      switchMap(response => this.streamAgentTask(response.taskId))
    );
  }

  /**
   * Get Firebase authentication headers
   */
  private getAuthHeaders(): Observable<HttpHeaders> {
    const user = this.auth.currentUser;

    if (!user) {
      throw new Error('User not authenticated');
    }

    return from(user.getIdToken()).pipe(
      switchMap(token => {
        const headers = new HttpHeaders({
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        });
        return from([headers]);
      })
    );
  }
}
