import { Injectable, inject } from '@angular/core';
import { Observable, from, TimeoutError } from 'rxjs';
import { map, switchMap, timeout } from 'rxjs/operators';
import { Auth } from '@angular/fire/auth';
import { HubConnection, HubConnectionBuilder, HubConnectionState, IStreamResult } from '@microsoft/signalr';
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

  /** Timeout for waiting for next stream event (5 minutes for long-running AI tasks) */
  private readonly STREAM_TIMEOUT_MS = 5 * 60 * 1000;

  constructor() {
    const baseUrl = this.appConfig.aiAgentApiUrl || 'http://localhost:5000';
    this.hubUrl = `${baseUrl}/agentHub`;
  }

  /**
   * Stream real-time updates for a queued agent task
   * @throws TimeoutError if no event received within timeout period
   */
  streamTaskUpdates(taskId: string): Observable<AgentStreamEvent> {
    return from(this.ensureConnection()).pipe(
      switchMap(connection => this.toObservable<AgentStreamEvent>(connection.stream<AgentStreamEvent>('StreamTaskUpdates', taskId))),
      timeout({
        each: this.STREAM_TIMEOUT_MS,
        meta: { taskId }
      }),
      map(event => ({
        ...event,
        timestamp: new Date(event.timestamp)
      }))
    );
  }

  /**
   * Convert SignalR IStreamResult to RxJS Observable
   */
  private toObservable<T>(stream: IStreamResult<T>): Observable<T> {
    return new Observable<T>(observer => {
      const subscription = stream.subscribe({
        next: (value: T) => observer.next(value),
        error: (error) => observer.error(error),
        complete: () => observer.complete()
      });

      return () => subscription.dispose();
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
        },
        timeout: 30000, // 30s connection timeout
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
      .withServerTimeout(6 * 60 * 1000) // 6 minutes (must be > stream timeout)
      .withKeepAliveInterval(30000) // 30s keepalive
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
