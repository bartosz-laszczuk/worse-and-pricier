# question-randomizer-auth-feature

Authentication feature library containing smart components for user authentication flows.

## Purpose

This library provides feature components for authentication and email verification flows using Firebase Authentication. It includes login, registration, and email verification components with facade pattern for business logic separation.

## Components

### Login (`src/login/`)

- **`login.component.ts`** - Login form component
- **`login.facade.ts`** - Business logic facade for login operations

**Features:**
- Email/password authentication
- Form validation (email format, required fields)
- Error handling for invalid credentials
- Navigation to dashboard on successful login
- Link to registration page

**Route:** `/auth/login`

### Registration (`src/registration/`)

- **`registration.component.ts`** - Registration form component
- **`registration.facade.ts`** - Business logic facade for registration operations

**Features:**
- New user registration with email/password
- Form validation (email format, password strength, required fields)
- Automatic email verification sending
- Error handling for duplicate emails
- Navigation to email verification on success
- Link to login page

**Route:** `/auth/registration`

### Email Verification Flow (`src/email/`)

#### Email Verify Component (`src/email/verify/`)

- **`email-verify.component.ts`** - Email verification instruction component

**Features:**
- Instructions for email verification process
- Resend verification email functionality
- Logout option
- Polling for verification status

**Route:** `/auth/email/verify`

#### Email Verified Component (`src/email/verified/`)

- **`email-verified.component.ts`** - Verification success component

**Features:**
- Success message after email verification
- Automatic navigation to dashboard

#### Email Not Verified Component (`src/email/not-verified/`)

- **`email-not-verified.component.ts`** - Verification warning component

**Features:**
- Warning message when accessing protected routes without verification
- Link to email verification page

## Usage

### Importing Components

```typescript
import {
  LoginComponent,
  RegistrationComponent,
  EmailVerifyComponent,
  EmailVerifiedComponent,
  EmailNotVerifiedComponent
} from '@worse-and-pricier/question-randomizer-auth-feature';
```

### Route Configuration

These components are lazy-loaded in the auth shell routes:

```typescript
// apps/question-randomizer/src/app/app.routes.ts
{
  path: 'auth',
  loadChildren: () => import('@worse-and-pricier/question-randomizer-auth-shell')
    .then(m => m.authShellRoutes)
}
```

## Architecture

This library follows the **facade pattern** for separation of concerns:

- **Components** - Handle UI rendering and user interactions
- **Facades** - Contain business logic, state management, and service interactions
- **Services** - Injected from `question-randomizer-auth-data-access`

### Dependencies

This feature library depends on:

- **`@worse-and-pricier/question-randomizer-auth-data-access`** - Auth services and guards
- **`@worse-and-pricier/question-randomizer-auth-util`** - Auth utilities and models
- **`@worse-and-pricier/design-system-ui`** - UI components (buttons, inputs, cards)

## Module Boundaries

This library has:
- **Type tag:** `type:feature`
- **Scope tag:** `scope:auth`

**Can depend on:**
- UI libraries (type:ui)
- Data-access libraries (type:data-access)
- Util libraries (type:util)

**Cannot depend on:**
- Other feature libraries
- Shell libraries
- Dashboard domain libraries

See [`/docs/MODULE_BOUNDARIES.md`](../../../../docs/MODULE_BOUNDARIES.md) for details.

## Authentication Flow

1. **New User:**
   - `/auth/registration` → Create account → Email sent
   - `/auth/email/verify` → Wait for verification
   - Email link clicked → `/auth/email/verified` → Redirect to dashboard

2. **Existing User (Verified):**
   - `/auth/login` → Enter credentials → Redirect to dashboard

3. **Existing User (Not Verified):**
   - `/auth/login` → Enter credentials → `/auth/email/verify`

4. **Protected Route Access (Not Verified):**
   - Attempt to access `/dashboard/*` → Redirect to `/auth/email/not-verified`

## Testing

```bash
# Run unit tests
npx nx test question-randomizer-auth-feature
```

## Related Libraries

- **`question-randomizer-auth-shell`** - Auth routing and shell component
- **`question-randomizer-auth-data-access`** - Auth services, guards, and Firebase integration
- **`question-randomizer-auth-util`** - Auth utilities and models
