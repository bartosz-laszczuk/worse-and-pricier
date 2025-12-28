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

/**
 * Agent task request
 */
export interface AgentTaskRequest {
  task: string;
  conversationId?: string;
}

/**
 * Queue task response
 */
export interface QueueTaskResponse {
  taskId: string;
  message: string;
}

/**
 * Agent stream event types
 */
export type AgentStreamEventType = 'started' | 'status_change' | 'completed' | 'error';

/**
 * Agent stream event
 */
export interface AgentStreamEvent {
  type: AgentStreamEventType;
  message?: string;
  content?: string;
  output?: string;
  timestamp: Date;
}
