# Testing Guide

This document describes the testing setup and best practices for the workspace.

## Automatic Test Configuration

**All Jest configuration is FULLY AUTOMATIC - no manual setup required when creating new libraries.**

The workspace uses centralized test configuration in `jest.preset.js`:

### 1. jest.preset.js (root)

Automatically provides:
- `crypto.randomUUID` polyfill for Node.js test environment
- `transformIgnorePatterns` for ESM package compatibility (@jsverse, @angular, @ngrx, rxjs, angular-svg-icon, ngx-quill)
- **Automatic execution** of shared test setup for ALL libraries via `setupFilesAfterEnv`

### 2. Shared test-setup

Located at `libs/question-randomizer/shared/util/src/jest-setup.ts`, automatically loaded for all tests:
- Firebase polyfills (fetch, Response, Headers)
- Angular zone setup with strict error checking
- crypto.randomUUID polyfill (applied after zone setup)

### When Creating a New Library

**No action required!**

The generated `jest.config.ts` inherits everything from `jest.preset.js`:
- Individual library `test-setup.ts` files are NOT needed and can be deleted
- All polyfills and configuration are applied automatically

Example of a typical generated `jest.config.ts`:
```typescript
export default {
  displayName: 'my-library',
  preset: '../../../jest.preset.js',  // This line provides everything!
  coverageDirectory: '../../../coverage/libs/my-library',
  transform: {
    '^.+\\.(ts|mjs|js|html)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  snapshotSerializers: [
    'jest-preset-angular/build/serializers/no-ng-attributes',
    'jest-preset-angular/build/serializers/ng-snapshot',
    'jest-preset-angular/build/serializers/html-comment',
  ],
};
```

## Common Test Utilities

The workspace provides common test utilities at `@worse-and-pricier/question-randomizer-shared-util`.

### getCommonTestProviders()

Returns all common Angular providers needed for testing:
- HttpClient (via `provideHttpClient`)
- Angular SVG Icon (via `provideAngularSvgIcon`)
- Router (via `provideRouter`)
- Transloco with mock loader
- Firebase Auth (mocked)
- Firebase Firestore (mocked)
- Firebase Storage (mocked)
- APP_CONFIG token

**Usage example:**

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { MyComponent } from './my.component';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        ...getCommonTestProviders(),
        // Add component-specific providers here
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Testing Complex Components

For components with deep dependency trees (multiple stores, facades, services), consider one of these approaches:

### Option 1: Simplified Class Definition Test

For shell components or feature components with many dependencies, test that the class is defined without full instantiation:

```typescript
import { MyComplexComponent } from './my-complex.component';

describe('MyComplexComponent', () => {
  it('should be defined', () => {
    expect(MyComplexComponent).toBeDefined();
  });
});
```

### Option 2: Full TestBed Setup

For components requiring full integration testing, provide all necessary dependencies:

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { getCommonTestProviders } from '@worse-and-pricier/question-randomizer-shared-util';
import { MyComponent } from './my.component';
import { MyStore } from './my.store';
import { MyService } from './my.service';

describe('MyComponent', () => {
  let component: MyComponent;
  let fixture: ComponentFixture<MyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyComponent],
      providers: [
        ...getCommonTestProviders(),
        MyStore,
        MyService,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MyComponent);
    component = fixture.componentInstance;

    // Set required inputs
    fixture.componentRef.setInput('myInput', 'value');

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
```

## Running Tests

```bash
# Run all tests
npm run test

# Run tests for specific project
npx nx test my-project-name

# Run tests with coverage
npx nx test my-project-name --codeCoverage

# Run tests in watch mode
npx nx test my-project-name --watch
```

## Architecture

- **Jest** is used for unit testing
- **Playwright** is used for e2e testing
- All configuration is centralized in `jest.preset.js`
- Shared test utilities are in `@worse-and-pricier/question-randomizer-shared-util`
