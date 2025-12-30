import { Injectable, inject } from '@angular/core';
import { Observable, Observer } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { APP_CONFIG } from '@worse-and-pricier/question-randomizer-shared-util';
import { AgentStreamEvent } from '../models/chat.models';

/**
 * Service for Server-Sent Events (SSE) streaming from Agent API
 * Replaces SignalR for simpler HTTP-based streaming
 */
@Injectable({ providedIn: 'root' })
export class AgentStreamService {
  private readonly auth = inject(Auth);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly apiUrl: string;

  constructor() {
    const baseUrl = this.appConfig.aiAgentApiUrl || 'http://localhost:5000';
    this.apiUrl = `${baseUrl}/api/agent/execute`;
  }

  /**
   * Execute agent task with real-time SSE streaming
   * @param task - Task description for the AI agent
   * @param conversationId - Optional conversation ID for multi-turn conversations
   * @returns Observable stream of AgentStreamEvent objects
   */
  executeTaskWithStreaming(task: string, conversationId?: string): Observable<AgentStreamEvent> {
    return new Observable((observer: Observer<AgentStreamEvent>) => {
      let reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
      let aborted = false;

      const executeStream = async () => {
        try {
          // Get Firebase auth token
          const user = this.auth.currentUser;
          if (!user) {
            throw new Error('User not authenticated');
          }

          const token = await user.getIdToken();

          // Make POST request with SSE streaming
          const response = await fetch(this.apiUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
              task,
              conversationId: conversationId || null
            })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          if (!response.body) {
            throw new Error('Response body is null');
          }

          // Read SSE stream
          reader = response.body.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

          while (!aborted) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            // Decode chunk and add to buffer
            buffer += decoder.decode(value, { stream: true });

            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || ''; // Keep incomplete line in buffer

            for (const line of lines) {
              // SSE format: "data: {...}"
              if (line.startsWith('data: ')) {
                try {
                  const eventData = JSON.parse(line.slice(6));

                  // Convert timestamp string to Date if present
                  const event: AgentStreamEvent = {
                    ...eventData,
                    timestamp: eventData.timestamp ? new Date(eventData.timestamp) : new Date()
                  };

                  observer.next(event);

                  // Complete stream on completion or error
                  if (event.type === 'completed' || event.type === 'error') {
                    observer.complete();
                    return;
                  }
                } catch (parseError) {
                  console.error('[AgentStream] Failed to parse SSE event:', parseError, line);
                }
              }
            }
          }

          observer.complete();
        } catch (error) {
          if (!aborted) {
            console.error('[AgentStream] Stream error:', error);
            observer.error(error);
          }
        } finally {
          reader?.releaseLock();
        }
      };

      // Start streaming
      executeStream();

      // Cleanup on unsubscribe
      return () => {
        aborted = true;
        reader?.cancel();
        reader?.releaseLock();
      };
    });
  }
}
