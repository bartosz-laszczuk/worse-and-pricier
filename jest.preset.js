const nxPreset = require('@nx/jest/preset').default;
const { randomUUID } = require('crypto');

// Polyfill crypto.randomUUID for Jest environment
if (typeof globalThis.crypto === 'undefined') {
  globalThis.crypto = {};
}
if (typeof globalThis.crypto.randomUUID === 'undefined') {
  globalThis.crypto.randomUUID = randomUUID;
}

const path = require('path');

module.exports = {
  ...nxPreset,
  // Transform ESM packages that Jest can't parse by default
  transformIgnorePatterns: [
    'node_modules/(?!(@jsverse|@angular|@ngrx|rxjs|angular-svg-icon|ngx-quill)/)',
  ],
  // Automatically run shared test setup for all libraries
  setupFilesAfterEnv: [
    ...((nxPreset.setupFilesAfterEnv || []).filter(file => !file.includes('test-setup'))),
    path.join(__dirname, 'libs/question-randomizer/shared/util/src/jest-setup.ts'),
  ],
  // Map TypeScript path aliases for Jest
  moduleNameMapper: {
    '^@worse-and-pricier/question-randomizer-shared-util/jest-setup$': path.join(
      __dirname,
      'libs/question-randomizer/shared/util/src/jest-setup.ts'
    ),
    ...nxPreset.moduleNameMapper,
  },
};
