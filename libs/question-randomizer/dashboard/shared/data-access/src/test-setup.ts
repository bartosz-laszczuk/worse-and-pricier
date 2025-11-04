import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

// Polyfill fetch and Response for Firebase (Node.js doesn't have these by default)
class MockResponse {
  constructor(public body: any, public init?: any) {}
  ok = true;
  status = 200;
  async json() {
    return this.body;
  }
  async text() {
    return JSON.stringify(this.body);
  }
}

global.Response = MockResponse as any;
global.fetch = jest.fn(() =>
  Promise.resolve(
    new MockResponse({}, { status: 200, headers: {} })
  )
) as any;

// Polyfill Headers for Firebase
global.Headers = class Headers {
  private headers: Record<string, string> = {};
  append(name: string, value: string) {
    this.headers[name] = value;
  }
  get(name: string) {
    return this.headers[name];
  }
} as any;

setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
