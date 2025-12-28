import { SSEParser } from './sse-parser.util';

describe('SSEParser', () => {
  let parser: SSEParser;

  beforeEach(() => {
    parser = new SSEParser();
  });

  it('should parse a complete SSE event', () => {
    const chunk = 'event: message\ndata: {"text":"hello"}\n\n';
    const events = parser.processChunk(chunk);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'message',
      data: '{"text":"hello"}'
    });
  });

  it('should parse multiple SSE events in one chunk', () => {
    const chunk = 'event: start\ndata: {"status":"started"}\n\nevent: end\ndata: {"status":"ended"}\n\n';
    const events = parser.processChunk(chunk);

    expect(events).toHaveLength(2);
    expect(events[0]).toEqual({
      type: 'start',
      data: '{"status":"started"}'
    });
    expect(events[1]).toEqual({
      type: 'end',
      data: '{"status":"ended"}'
    });
  });

  it('should buffer incomplete events across chunks', () => {
    const chunk1 = 'event: message\n';
    const chunk2 = 'data: {"text":"hello"}\n\n';

    const events1 = parser.processChunk(chunk1);
    expect(events1).toHaveLength(0);

    const events2 = parser.processChunk(chunk2);
    expect(events2).toHaveLength(1);
    expect(events2[0]).toEqual({
      type: 'message',
      data: '{"text":"hello"}'
    });
  });

  it('should ignore events without event type', () => {
    const chunk = 'data: {"text":"hello"}\n\n';
    const events = parser.processChunk(chunk);

    expect(events).toHaveLength(0);
  });

  it('should ignore events without data', () => {
    const chunk = 'event: message\n\n';
    const events = parser.processChunk(chunk);

    expect(events).toHaveLength(0);
  });

  it('should reset parser state', () => {
    parser.processChunk('event: message\n');
    parser.reset();

    const chunk = 'data: {"text":"hello"}\n\n';
    const events = parser.processChunk(chunk);

    expect(events).toHaveLength(0);
  });

  it('should handle events with extra whitespace', () => {
    const chunk = 'event:  message  \ndata:  {"text":"hello"}  \n\n';
    const events = parser.processChunk(chunk);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      type: 'message',
      data: '{"text":"hello"}'
    });
  });
});
