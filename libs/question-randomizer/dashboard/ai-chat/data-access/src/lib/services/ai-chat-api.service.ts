import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, switchMap } from 'rxjs';
import { Auth } from '@angular/fire/auth';
import { APP_CONFIG } from '@worse-and-pricier/question-randomizer-shared-util';
import {
  ChatRequest,
  ChatResponse,
  CreateConversationRequest,
  Conversation
} from '../models/chat.models';

/**
 * Service for communicating with the AI Agent backend API
 */
@Injectable({ providedIn: 'root' })
export class AiChatApiService {
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
