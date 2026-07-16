# Feature: Authentication

## Purpose
Gate the application behind Firebase email/password authentication with mandatory email
verification, so that every downstream feature operates on a known, verified `userId`.

## Actors
- **Anonymous visitor** — not signed in.
- **Signed-in-unverified user** — authenticated but email not yet verified.
- **Verified user** — full access to the dashboard.

## Behavior
- A visitor can **register** with email + password; on success a verification email is sent.
- A visitor can **log in** with email + password.
- After login/registration the user is routed through the **email verification** flow until
  verified.
- Route access is controlled by guards: `UnauthCanActivate` (login/registration are for
  unauthenticated users), `AuthCanActivate` (authenticated), `AuthVerifiedCanActivate` (verified —
  protects `/dashboard/*`).

## Acceptance criteria
- **Given** an anonymous visitor, **when** they open any `/dashboard/*` route, **then** they are
  redirected away (not verified ⇒ no dashboard access).
- **Given** valid new credentials, **when** they register, **then** an account is created and a
  verification email is sent, and they land on the verification flow.
- **Given** a signed-in-unverified user, **when** they visit `/auth/email/verify`, **then** they
  can request/confirm verification; **when** verified, `AuthVerifiedCanActivate` allows
  `/dashboard/*`.
- **Given** an already-authenticated user, **when** they open `/auth/login` or `/auth/registration`,
  **then** `UnauthCanActivate` blocks it.
- **Given** invalid credentials, **when** they log in, **then** an error is shown and no session
  is established.

## Data touched
Firebase Auth (identity). No Firestore collection from [`schema.json`](../schema.json) directly;
the resulting `userId` scopes all other features.

## Out of scope
Password reset UX, social/OAuth providers, multi-factor auth.
