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
 * Agent stream event types
 */
export type AgentStreamEventType =
  | 'started'        // Task execution started
  | 'thinking'       // Agent is analyzing/planning
  | 'text_chunk'     // Streaming response text (ChatGPT-like)
  | 'tool_call'      // Agent calling a tool
  | 'tool_result'    // Tool execution completed
  | 'completed'      // Task finished successfully
  | 'error';         // Task failed with error

/**
 * Agent stream event
 */
export interface AgentStreamEvent {
  type: AgentStreamEventType;
  message?: string;
  content?: string;
  toolName?: string;      // Tool name for tool_call events
  toolInput?: unknown;    // Tool input for tool_call events
  toolResult?: string;    // Tool result for tool_result events
  timestamp?: Date;
}
