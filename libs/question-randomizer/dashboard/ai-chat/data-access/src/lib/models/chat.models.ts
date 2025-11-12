/**
 * Chat message model
 */
export interface ChatMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

/**
 * Conversation model
 */
export interface Conversation {
  id: string;
  userId: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Chat request to backend API
 */
export interface ChatRequest {
  conversationId: string;
  message: string;
}

/**
 * Chat response from backend API
 */
export interface ChatResponse {
  response: string;
  conversationId: string;
  messageId: string;
}

/**
 * Create conversation request
 */
export interface CreateConversationRequest {
  title: string;
}
