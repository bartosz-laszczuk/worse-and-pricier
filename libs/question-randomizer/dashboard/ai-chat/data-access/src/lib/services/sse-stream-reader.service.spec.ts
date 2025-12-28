import { TestBed } from '@angular/core/testing';
import { SSEStreamReaderService } from './sse-stream-reader.service';

describe('SSEStreamReaderService', () => {
  let service: SSEStreamReaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SSEStreamReaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should connect and read SSE events', async () => {
    const mockEvents: Array<{ type: string; data: string }> = [];
    const mockResponse = createMockSSEResponse('event: test\ndata: hello\n\n');

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await service.connectAndRead(
      { url: 'http://test.com/stream' },
      (event) => mockEvents.push(event),
      () => fail('Should not error'),
      () => {}
    );

    expect(mockEvents).toHaveLength(1);
    expect(mockEvents[0]).toEqual({ type: 'test', data: 'hello' });
  });

  it('should call onComplete when stream ends', async () => {
    const mockResponse = createMockSSEResponse('event: test\ndata: hello\n\n');
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const onComplete = jest.fn();

    await service.connectAndRead(
      { url: 'http://test.com/stream' },
      () => {},
      () => fail('Should not error'),
      onComplete
    );

    expect(onComplete).toHaveBeenCalled();
  });

  it('should call onError on HTTP error', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    const onError = jest.fn();

    await service.connectAndRead(
      { url: 'http://test.com/stream' },
      () => {},
      onError,
      () => {}
    );

    expect(onError).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.stringContaining('HTTP 500')
      })
    );
  });

  it('should handle abort signal', async () => {
    const abortController = new AbortController();
    const mockResponse = createMockSSEResponse('event: test\ndata: hello\n\n');

    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    abortController.abort();

    const onError = jest.fn();

    await service.connectAndRead(
      {
        url: 'http://test.com/stream',
        signal: abortController.signal
      },
      () => {},
      onError,
      () => {}
    );

    // AbortError should not be treated as error
    expect(onError).not.toHaveBeenCalled();
  });

  it('should include custom headers in request', async () => {
    const mockResponse = createMockSSEResponse('');
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    await service.connectAndRead(
      {
        url: 'http://test.com/stream',
        headers: { 'Authorization': 'Bearer token123' }
      },
      () => {},
      () => {},
      () => {}
    );

    expect(global.fetch).toHaveBeenCalledWith(
      'http://test.com/stream',
      expect.objectContaining({
        headers: expect.objectContaining({
          'Accept': 'text/event-stream',
          'Authorization': 'Bearer token123'
        })
      })
    );
  });
});

/**
 * Creates a mock Response object with SSE stream
 */
function createMockSSEResponse(data: string): Response {
  const encoder = new TextEncoder();

  const mockReader = {
    read: jest
      .fn()
      .mockResolvedValueOnce({
        done: false,
        value: encoder.encode(data)
      })
      .mockResolvedValueOnce({
        done: true,
        value: undefined
      }),
    releaseLock: jest.fn()
  };

  const mockBody = {
    getReader: () => mockReader
  };

  return {
    ok: true,
    status: 200,
    body: mockBody
  } as unknown as Response;
}
