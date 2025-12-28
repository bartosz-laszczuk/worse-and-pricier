import { Injectable } from '@angular/core';
import { SSEParser, ParsedSSEEvent } from '../utils/sse-parser.util';

/**
 * Configuration for SSE stream connection
 */
export interface SSEStreamConfig {
  url: string;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * Service for reading Server-Sent Events streams using fetch API
 * Provides lower-level streaming functionality without reconnection logic
 */
@Injectable({ providedIn: 'root' })
export class SSEStreamReaderService {
  /**
   * Connect to an SSE endpoint and read events
   * @param config - Stream configuration (URL, headers, abort signal)
   * @param onEvent - Callback for each parsed event
   * @param onError - Callback for errors
   * @param onComplete - Callback when stream ends normally
   */
  async connectAndRead(
    config: SSEStreamConfig,
    onEvent: (event: ParsedSSEEvent) => void,
    onError: (error: Error) => void,
    onComplete: () => void
  ): Promise<void> {
    try {
      const response = await fetch(config.url, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          ...config.headers
        },
        signal: config.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      if (!response.body) {
        throw new Error('Response body is null');
      }

      await this.readStream(response.body, onEvent, onComplete);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Abort is expected, don't treat as error
        return;
      }
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  /**
   * Read from a ReadableStream and parse SSE events
   */
  private async readStream(
    body: ReadableStream<Uint8Array>,
    onEvent: (event: ParsedSSEEvent) => void,
    onComplete: () => void
  ): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    const parser = new SSEParser();

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          onComplete();
          break;
        }

        // Decode chunk and parse events
        const chunk = decoder.decode(value, { stream: true });
        const events = parser.processChunk(chunk);

        // Emit each parsed event
        events.forEach(event => onEvent(event));
      }
    } finally {
      reader.releaseLock();
    }
  }
}
