# Question Randomizer

An interview preparation tool that helps you practice interview questions through intelligent randomization and category-based organization.

## Overview

Question Randomizer is an Angular-based web application built with Nx that helps users prepare for interviews by:

- **Managing interview questions** organized by categories and qualifications
- **Randomizing questions** based on customizable criteria
- **Tracking practice sessions** with interview mode
- **Organizing knowledge** through a flexible categorization system

The application uses Firebase for authentication and data persistence, ensuring your questions are securely stored and accessible across devices.

## Tech Stack

- **Framework:** Angular 20 (standalone components)
- **Build System:** Nx (monorepo)
- **State Management:** @ngrx/signals (SignalStore)
- **Backend:** Firebase (Authentication + Firestore)
- **Styling:** SCSS with custom design system
- **Testing:** Jest (unit), Playwright (e2e)

## Features

### Authentication
- Email/password authentication with verification
- Protected routes with email verification guards
- Secure session management

### Question Management
- Create, edit, and delete interview questions
- Rich text editor support for detailed question content
- Tag questions with categories and qualifications

### Categories & Qualifications
- Organize questions by custom categories (e.g., "JavaScript", "System Design")
- Tag questions by qualification levels (e.g., "Junior", "Senior")
- Flexible categorization for any interview type

### Randomization
- Randomize questions based on selected criteria
- Filter by categories, qualifications, and active status
- Customizable randomization settings

### Interview Mode
- Practice interview sessions with randomized question sets
- Track your progress through practice sessions
- Review mode for completed sessions

### Settings
- Theme switching (light/dark mode)
- Customize application preferences

## Quick Start

### Prerequisites
- Node.js (20+)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd worse-and-pricier

# Install dependencies
npm install

# Set up Firebase configuration
# Add your Firebase config to apps/question-randomizer/src/environments/
```

### Development

```bash
# Run development server
npx nx serve question-randomizer

# The app will be available at http://localhost:4200
```

### Building

```bash
# Production build
npx nx build question-randomizer

# Build output will be in dist/apps/question-randomizer
```

### Testing

```bash
# Run unit tests
npx nx test question-randomizer

# Run e2e tests
npx nx e2e question-randomizer-e2e

# Lint
npx nx lint question-randomizer
```

## Project Structure

This is an Nx monorepo with domain-driven design:

```
apps/
  └── question-randomizer/          # Main Angular application

libs/
  ├── design-system/                # Publishable design system
  │   ├── tokens/                   # Design tokens
  │   ├── styles/                   # Global styles & themes
  │   └── ui/                       # UI components
  │
  └── question-randomizer/          # Application libraries
      ├── auth/                     # Authentication domain
      ├── dashboard/                # Dashboard domains
      │   ├── questions/            # Question management
      │   ├── categories/           # Category management
      │   ├── qualifications/       # Qualification management
      │   ├── randomization/        # Randomization logic
      │   ├── interview/            # Interview mode
      │   ├── settings/             # Settings
      │   └── shared/               # Shared dashboard code
      └── shared/                   # App-wide shared code
```

Each domain follows a layered architecture with:
- **shell** - Routing and containers
- **feature** - Smart components
- **ui** - Presentational components
- **data-access** - State management and services
- **util** - Utilities and models

## Architecture Highlights

### State Management
- Uses @ngrx/signals (SignalStore) for reactive state management
- Normalized state pattern with entities and IDs
- Shared stores provided at dashboard shell level
- Optimistic client-side updates with Firebase sync

### Module Boundaries
- Strict ESLint rules enforce architectural boundaries
- Dashboard domains are isolated (cannot depend on each other)
- Shared concerns extracted to `dashboard-shared` libraries
- See [`docs/MODULE_BOUNDARIES.md`](docs/MODULE_BOUNDARIES.md) for details

### Design System
- Comprehensive, publishable design system
- Framework-agnostic tokens (colors, typography, spacing)
- Angular UI component library with Storybook documentation
- See [`libs/design-system/README.md`](libs/design-system/README.md) for details

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - Complete project documentation for Claude Code users
- **[Module Boundaries](docs/MODULE_BOUNDARIES.md)** - ESLint rules and architectural constraints
- **[Design System](libs/design-system/README.md)** - Design system documentation
- **[Design System Contributing](docs/DESIGN_SYSTEM_CONTRIBUTING.md)** - Contributing to design system

## Development Workflow

### Creating New Features

1. Identify the correct domain (auth, dashboard subdomain, or shared)
2. Use Nx generators to create libraries: `npx nx g @nx/angular:lib <name>`
3. Follow the type pattern (feature, ui, data-access, util, shell)
4. Use design system components instead of creating custom UI
5. Respect module boundaries (run `npx nx lint` to check)

### Working with Nx

This project uses Nx MCP (Model Context Protocol) for enhanced Claude Code integration:

```bash
# View project structure
npx nx graph

# Run multiple targets
npx nx run-many --target=test --all

# See available commands
npx nx list
```

## Firebase Configuration

The application requires Firebase configuration for authentication and data persistence:

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Email/Password authentication
3. Create a Firestore database
4. Add your Firebase config to `apps/question-randomizer/src/environments/`

## Contributing

Contributions are welcome! Please follow the existing architectural patterns and respect module boundaries.

## License

MIT

---

<a href="https://nx.dev" target="_blank" rel="noreferrer">
  <img src="https://raw.githubusercontent.com/nrwl/nx/master/images/nx-logo.png" width="45" alt="Nx logo">
</a>

Built with [Nx](https://nx.dev)
