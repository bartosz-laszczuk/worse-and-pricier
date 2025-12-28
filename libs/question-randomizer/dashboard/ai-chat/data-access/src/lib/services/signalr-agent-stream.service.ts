import { Injectable, inject } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { APP_CONFIG } from '@worse-and-pricier/question-randomizer-shared-util';
import { AgentStreamEvent } from '../models/chat.models';

/**
 * Service for managing SignalR connection to the Agent Hub
 * Uses a singleton connection pattern for efficiency
 */
@Injectable({ providedIn: 'root' })
export class SignalRAgentStreamService {
  private readonly auth = inject(Auth);
  private readonly appConfig = inject(APP_CONFIG);
  private readonly hubUrl: string;
  private connection: HubConnection | null = null;
  private connectionPromise: Promise<HubConnection> | null = null;

  constructor() {
    const baseUrl = this.appConfig.aiAgentApiUrl || 'http://localhost:5000';
    this.hubUrl = `${baseUrl}/agentHub`;
  }

  /**
   * Stream real-time updates for a queued agent task
   */
  streamTaskUpdates(taskId: string): Observable<AgentStreamEvent> {
    return new Observable<AgentStreamEvent>(observer => {
      let isActive = true;

      // Ensure connection then subscribe to stream
      from(this.ensureConnection())
        .subscribe({
          next: (connection) => {
            if (!isActive) return;

            // Subscribe to the server-to-client stream
            connection.stream<AgentStreamEvent>('StreamTaskUpdates', taskId).subscribe({
              next: (event) => {
                if (isActive) {
                  // Parse timestamp from string to Date
                  observer.next({
                    ...event,
                    timestamp: new Date(event.timestamp)
                  });
                }
              },
              error: (error) => {
                console.error('[SignalR] Stream error:', error);
                if (isActive) {
                  observer.error(error);
                }
              },
              complete: () => {
                console.log('[SignalR] Stream completed');
                if (isActive) {
                  observer.complete();
                }
              }
            });
          },
          error: (error) => {
            console.error('[SignalR] Connection error:', error);
            if (isActive) {
              observer.error(error);
            }
          }
        });

      // Cleanup
      return () => {
        isActive = false;
      };
    });
  }

  /**
   * Ensure SignalR connection is established (singleton pattern)
   */
  private async ensureConnection(): Promise<HubConnection> {
    // Return existing connection if already connected
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      return this.connection;
    }

    // Return in-progress connection attempt
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    // Create new connection
    this.connectionPromise = this.createConnection();

    try {
      this.connection = await this.connectionPromise;
      return this.connection;
    } finally {
      this.connectionPromise = null;
    }
  }

  /**
   * Create and start a new SignalR connection
   */
  private async createConnection(): Promise<HubConnection> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const token = await user.getIdToken();

    const connection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: async () => {
          // Get fresh token for each request
          return await this.auth.currentUser?.getIdToken() || token;
        }
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Exponential backoff: 1s, 2s, 4s, 8s, max 10s
          if (retryContext.previousRetryCount >= 5) {
            console.warn('[SignalR] Max reconnection attempts reached');
            return null;
          }
          const delay = Math.min(1000 * Math.pow(2, retryContext.previousRetryCount), 10000);
          console.log(`[SignalR] Reconnecting in ${delay}ms...`);
          return delay;
        }
      })
      .build();

    // Set up lifecycle event handlers
    connection.onreconnecting(() => console.log('[SignalR] Reconnecting...'));
    connection.onreconnected(() => console.log('[SignalR] Reconnected'));
    connection.onclose((error) => {
      console.log('[SignalR] Connection closed', error);
      this.connection = null;
    });

    await connection.start();
    console.log('[SignalR] Connected to agent hub');

    return connection;
  }

  /**
   * Manually disconnect from the hub
   */
  async disconnect(): Promise<void> {
    if (this.connection && this.connection.state === HubConnectionState.Connected) {
      await this.connection.stop();
      console.log('[SignalR] Disconnected');
      this.connection = null;
    }
  }
}
