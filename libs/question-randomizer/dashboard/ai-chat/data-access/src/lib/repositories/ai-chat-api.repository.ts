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

/**
 * Repository for communicating with the AI Agent backend API
 */
@Injectable({ providedIn: 'root' })
export class AiChatApiRepository {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(Auth);
  private readonly appConfig = inject(APP_CONFIG);
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
   * Uses custom SSE implementation with fetch for full control over headers and reconnection
   */
  streamAgentTask(taskId: string): Observable<AgentStreamEvent> {
    return new Observable<AgentStreamEvent>(observer => {
      const user = this.auth.currentUser;

      if (!user) {
        observer.error(new Error('User not authenticated'));
        return;
      }

      let reconnectAttempts = 0;
      const maxReconnectAttempts = 5;
      let abortController: AbortController | null = null;
      let shouldReconnect = true;

      const connectStream = async () => {
        try {
          reconnectAttempts++;

          if (reconnectAttempts > 1) {
            console.log(`[AgentStream] Reconnecting... (attempt ${reconnectAttempts}/${maxReconnectAttempts})`);
          }

          // Get fresh auth token
          const token = await user.getIdToken();

          // Create new abort controller for this connection
          abortController = new AbortController();

          // Use fetch with custom headers (supports Authorization!)
          const response = await fetch(`${this.apiUrl}/agent/tasks/${taskId}/stream`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Accept': 'text/event-stream',
            },
            signal: abortController.signal
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          if (!response.body) {
            throw new Error('Response body is null');
          }

          // Reset reconnect attempts on successful connection
          reconnectAttempts = 0;
          console.log('[AgentStream] Connected successfully');

          // Read the stream
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (shouldReconnect) {
            const { done, value } = await reader.read();

            if (done) {
              console.log('[AgentStream] Stream ended by server');
              break;
            }

            // Decode the chunk
            buffer += decoder.decode(value, { stream: true });

            // Process complete SSE messages
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            let eventType = '';
            let eventData = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.substring(6).trim();
              } else if (line.startsWith('data:')) {
                eventData = line.substring(5).trim();
              } else if (line === '') {
                // Empty line = end of event
                if (eventType && eventData) {
                  try {
                    const data = JSON.parse(eventData);
                    const event: AgentStreamEvent = {
                      ...data,
                      type: eventType as AgentStreamEvent['type'],
                      timestamp: new Date(data.timestamp)
                    };

                    observer.next(event);

                    // Check for terminal events
                    if (eventType === 'completed') {
                      shouldReconnect = false;
                      observer.complete();
                      return;
                    } else if (eventType === 'error') {
                      shouldReconnect = false;
                      observer.error(new Error(data.message || 'Stream error'));
                      return;
                    }
                  } catch (parseError) {
                    console.warn('[AgentStream] Failed to parse event data:', eventData, parseError);
                  }
                }
                eventType = '';
                eventData = '';
              }
            }
          }
        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('[AgentStream] Stream aborted');
            return;
          }

          console.error('[AgentStream] Connection error:', error);

          // Retry with exponential backoff
          if (shouldReconnect && reconnectAttempts < maxReconnectAttempts) {
            const delay = Math.min(1000 * Math.pow(2, reconnectAttempts - 1), 10000);
            console.log(`[AgentStream] Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return connectStream(); // Recursive reconnect
          } else {
            observer.error(new Error(`Failed to connect after ${maxReconnectAttempts} attempts`));
          }
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
