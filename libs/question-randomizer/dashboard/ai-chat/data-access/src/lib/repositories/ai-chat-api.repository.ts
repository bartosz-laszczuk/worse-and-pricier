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
import { SSEStreamReaderService } from '../services/sse-stream-reader.service';
import { ReconnectionStrategy } from '../utils/reconnection-strategy.util';

/**
 * Repository for communicating with the AI Agent backend API
 */
@Injectable({ providedIn: 'root' })
export class AiChatApiRepository {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly sseReader = inject(SSEStreamReaderService);
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
   * Uses SSE streaming with automatic reconnection
   */
  streamAgentTask(taskId: string): Observable<AgentStreamEvent> {
    return new Observable<AgentStreamEvent>(observer => {
      const user = this.auth.currentUser;

      if (!user) {
        observer.error(new Error('User not authenticated'));
        return;
      }

      const reconnectionStrategy = new ReconnectionStrategy(5, 1000, 10000);
      let abortController: AbortController | null = null;
      let shouldReconnect = true;

      const connectStream = async (): Promise<void> => {
        if (!reconnectionStrategy.incrementAttempt()) {
          observer.error(new Error(`Failed to connect after ${reconnectionStrategy.getMaxAttempts()} attempts`));
          return;
        }

        if (reconnectionStrategy.getCurrentAttempt() > 1) {
          console.log(`[AgentStream] Reconnecting... (attempt ${reconnectionStrategy.getCurrentAttempt()}/${reconnectionStrategy.getMaxAttempts()})`);
        }

        try {
          // Get fresh auth token
          const token = await user.getIdToken();

          // Create new abort controller for this connection
          abortController = new AbortController();

          // Connect and read stream
          await this.sseReader.connectAndRead(
            {
              url: `${this.apiUrl}/agent/tasks/${taskId}/stream`,
              headers: { 'Authorization': `Bearer ${token}` },
              signal: abortController.signal
            },
            (event) => this.handleSSEEvent(event, observer, () => { shouldReconnect = false; }),
            (error) => this.handleStreamError(error, reconnectionStrategy, shouldReconnect, connectStream, observer),
            () => console.log('[AgentStream] Stream ended by server')
          );

          // Reset reconnection strategy on successful connection
          reconnectionStrategy.reset();
          console.log('[AgentStream] Connected successfully');
        } catch (error) {
          await this.handleStreamError(error, reconnectionStrategy, shouldReconnect, connectStream, observer);
        }
      };

      // Start the stream
      connectStream();

      // Cleanup function
      return () => {
        console.log('[AgentStream] Closing stream');
        shouldReconnect = false;
        if (abortController) {
          abortController.abort();
        }
      };
    });
  }

  /**
   * Handle individual SSE events
   */
  private handleSSEEvent(
    event: { type: string; data: string },
    observer: { next: (value: AgentStreamEvent) => void; complete: () => void; error: (err: Error) => void },
    stopReconnect: () => void
  ): void {
    try {
      const data = JSON.parse(event.data);
      const agentEvent: AgentStreamEvent = {
        ...data,
        type: event.type as AgentStreamEvent['type'],
        timestamp: new Date(data.timestamp)
      };

      observer.next(agentEvent);

      // Check for terminal events
      if (event.type === 'completed') {
        stopReconnect();
        observer.complete();
      } else if (event.type === 'error') {
        stopReconnect();
        observer.error(new Error(data.message || 'Stream error'));
      }
    } catch (parseError) {
      console.warn('[AgentStream] Failed to parse event data:', event.data, parseError);
    }
  }

  /**
   * Handle stream errors with reconnection logic
   */
  private async handleStreamError(
    error: unknown,
    reconnectionStrategy: ReconnectionStrategy,
    shouldReconnect: boolean,
    connectStream: () => Promise<void>,
    observer: { error: (err: Error) => void }
  ): Promise<void> {
    console.error('[AgentStream] Connection error:', error);

    if (!shouldReconnect || reconnectionStrategy.isExhausted()) {
      observer.error(
        error instanceof Error
          ? error
          : new Error(`Failed to connect after ${reconnectionStrategy.getMaxAttempts()} attempts`)
      );
      return;
    }

    const delay = reconnectionStrategy.getNextDelay();
    console.log(`[AgentStream] Retrying in ${delay}ms...`);
    await new Promise(resolve => setTimeout(resolve, delay));
    return connectStream();
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
