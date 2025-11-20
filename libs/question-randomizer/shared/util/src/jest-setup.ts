import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
import { randomUUID } from 'crypto';

/**
 * Shared Jest setup for all libraries in the workspace.
 * This file contains common polyfills and configuration needed for Angular testing.
 *
 * This file is automatically loaded by jest.preset.js for ALL libraries in the workspace.
 * No manual configuration required when creating new libraries.
 */

// Polyfill fetch and Response for Firebase (Node.js doesn't have these by default)
class MockResponse {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.Response = MockResponse as any;
global.fetch = jest.fn(() =>
  Promise.resolve(new MockResponse({}, { status: 200, headers: {} }))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Setup Angular testing environment with strict error checking
setupZoneTestEnv({
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});

// Polyfill crypto.randomUUID for Jest environment
// IMPORTANT: This must be done AFTER setupZoneTestEnv as zone setup can reset the global environment
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {} as Crypto;
}
if (typeof globalThis.crypto.randomUUID === 'undefined') {
  globalThis.crypto.randomUUID = randomUUID;
}
