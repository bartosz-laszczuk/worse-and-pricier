import { Injectable, inject } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { ChatMessage, Conversation } from '../models/chat.models';

/**
 * Repository service for chat-related Firestore operations
 */
@Injectable({ providedIn: 'root' })
export class ChatRepositoryService {
  private readonly firestore = inject(Firestore);
  private readonly conversationsCollection = 'conversations';
  private readonly messagesCollection = 'messages';

  /**
   * Get all conversations for a user
   */
  getConversations(userId: string): Observable<Conversation[]> {
    const conversationsRef = collection(this.firestore, this.conversationsCollection);
    const q = query(
      conversationsRef,
      where('userId', '==', userId),
      orderBy('updatedAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        })) as Conversation[]
      )
    );
  }

  /**
   * Get a single conversation by ID
   */
  getConversation(conversationId: string): Observable<Conversation | null> {
    const docRef = doc(this.firestore, this.conversationsCollection, conversationId);

    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (!docSnap.exists()) {
          return null;
        }
        return {
          id: docSnap.id,
          ...this.convertTimestamps(docSnap.data())
        } as Conversation;
      })
    );
  }

  /**
   * Create a new conversation
   */
  createConversation(userId: string, title: string): Observable<Conversation> {
    const conversationsRef = collection(this.firestore, this.conversationsCollection);
    const now = Timestamp.now();

    const conversationData = {
      userId,
      title,
      createdAt: now,
      updatedAt: now
    };

    return from(addDoc(conversationsRef, conversationData)).pipe(
      map(docRef => ({
        id: docRef.id,
        userId,
        title,
        createdAt: now.toDate(),
        updatedAt: now.toDate()
      }))
    );
  }

  /**
   * Get all messages in a conversation
   */
  getMessages(conversationId: string): Observable<ChatMessage[]> {
    const messagesRef = collection(this.firestore, this.messagesCollection);
    const q = query(
      messagesRef,
      where('conversationId', '==', conversationId),
      orderBy('timestamp', 'asc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot =>
        snapshot.docs.map(doc => ({
          id: doc.id,
          ...this.convertTimestamps(doc.data())
        })) as ChatMessage[]
      )
    );
  }

  /**
   * Add a message to a conversation
   */
  addMessage(
    conversationId: string,
    role: 'user' | 'assistant',
    content: string
  ): Observable<ChatMessage> {
    const messagesRef = collection(this.firestore, this.messagesCollection);
    const now = Timestamp.now();

    const messageData = {
      conversationId,
      role,
      content,
      timestamp: now
    };

    return from(addDoc(messagesRef, messageData)).pipe(
      map(docRef => ({
        id: docRef.id,
        conversationId,
        role,
        content,
        timestamp: now.toDate()
      }))
    );
  }

  /**
   * Update conversation's updatedAt timestamp
   */
  updateConversationTimestamp(conversationId: string): Observable<void> {
    const docRef = doc(this.firestore, this.conversationsCollection, conversationId);

    return from(
      updateDoc(docRef, {
        updatedAt: Timestamp.now()
      })
    );
  }

  /**
   * Delete a conversation and all its messages
   */
  deleteConversation(conversationId: string): Observable<void> {
    const batch = writeBatch(this.firestore);

    // First get all messages in the conversation
    const messagesRef = collection(this.firestore, this.messagesCollection);
    const q = query(messagesRef, where('conversationId', '==', conversationId));

    return from(getDocs(q)).pipe(
      map(snapshot => {
        // Delete all messages
        snapshot.docs.forEach(messageDoc => {
          batch.delete(messageDoc.ref);
        });

        // Delete the conversation
        const conversationRef = doc(this.firestore, this.conversationsCollection, conversationId);
        batch.delete(conversationRef);

        return batch.commit();
      }),
      map(() => undefined)
    );
  }

  /**
   * Convert Firestore Timestamps to JavaScript Dates
   */
  private convertTimestamps(data: Record<string, unknown>): Record<string, unknown> {
    const converted: Record<string, unknown> = {};

    for (const key in data) {
      if (data[key] instanceof Timestamp) {
        converted[key] = (data[key] as Timestamp).toDate();
      } else {
        converted[key] = data[key];
      }
    }

    return converted;
  }
}
