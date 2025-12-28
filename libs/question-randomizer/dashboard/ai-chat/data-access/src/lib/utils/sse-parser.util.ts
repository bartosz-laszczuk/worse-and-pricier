/**
 * Represents a parsed Server-Sent Event
 */
export interface ParsedSSEEvent {
  type: string;
  data: string;
}

/**
 * Utility class for parsing Server-Sent Events (SSE) format
 *
 * SSE format:
 * event: eventType
 * data: {"key": "value"}
 *
 * (empty line indicates end of event)
 */
export class SSEParser {
  private buffer = '';
  private eventType = '';
  private eventData = '';

  /**
   * Process a chunk of text and extract complete SSE events
   * @param chunk - Raw text chunk from stream
   * @returns Array of parsed events (may be empty if no complete events)
   */
  processChunk(chunk: string): ParsedSSEEvent[] {
    this.buffer += chunk;
    const events: ParsedSSEEvent[] = [];

    // Split by newlines
    const lines = this.buffer.split('\n');

    // Keep incomplete line in buffer
    this.buffer = lines.pop() || '';

    for (const line of lines) {
      if (line.startsWith('event:')) {
        this.eventType = line.substring(6).trim();
      } else if (line.startsWith('data:')) {
        this.eventData = line.substring(5).trim();
      } else if (line === '') {
        // Empty line = end of event
        if (this.eventType && this.eventData) {
          events.push({
            type: this.eventType,
            data: this.eventData
          });
        }
        this.eventType = '';
        this.eventData = '';
      }
    }

    return events;
  }

  /**
   * Reset parser state
   */
  reset(): void {
    this.buffer = '';
    this.eventType = '';
    this.eventData = '';
  }
}
