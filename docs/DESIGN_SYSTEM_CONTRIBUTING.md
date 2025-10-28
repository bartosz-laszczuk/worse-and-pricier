# Contributing to the Design System

This guide provides instructions for contributing to the design system packages located in `libs/design-system/`.

**For usage documentation, see:** [`/libs/design-system/README.md`](../libs/design-system/README.md)

## Before You Start

The design system consists of four publishable packages:
- `@worse-and-pricier/design-system` - Meta-package (umbrella)
- `@worse-and-pricier/design-system-tokens` - Design tokens (SCSS + TypeScript)
- `@worse-and-pricier/design-system-styles` - Global styles and theme service
- `@worse-and-pricier/design-system-ui` - UI components with Storybook

All packages are configured for Angular Package Format (APF) and can be published to NPM.

## When Working with the Design System

### 1. Adding New Components

**Location:** `libs/design-system/ui/src/lib/`

**Steps:**
1. Create component in appropriate subdirectory (e.g., `buttons/`, `forms/`, `layout/`)
2. Export from `libs/design-system/ui/src/index.ts`
3. Create Storybook stories (`.stories.ts`) for component documentation
4. **Use relative imports within the library** to avoid circular dependencies

**Example:**
```typescript
// ✅ CORRECT: relative imports within design-system-ui
import { ButtonType } from '../models/button-type.model';

// ❌ WRONG: absolute imports create circular dependencies
import { ButtonType } from '@worse-and-pricier/design-system-ui';
```

### 2. Adding New Design Tokens

**SCSS tokens location:** `libs/design-system/tokens/src/lib/scss/`
**TypeScript exports location:** `libs/design-system/tokens/src/lib/`

**Steps:**
1. Add SCSS variables to appropriate file (`_colors.scss`, `_typography.scss`, etc.)
2. Create TypeScript exports for programmatic access
3. Export from `libs/design-system/tokens/src/index.ts`

**Example:**
```scss
// libs/design-system/tokens/src/lib/scss/_colors.scss
$color-primary: #007bff;
```

```typescript
// libs/design-system/tokens/src/lib/colors.ts
export const colors = {
  primary: '#007bff',
};
```

### 3. Testing Changes Locally

**Build packages:**
```bash
# Build single package
npx nx build @worse-and-pricier/design-system-tokens

# Build all design system packages
npx nx run-many --target=build --projects=@worse-and-pricier/design-system-tokens,@worse-and-pricier/design-system-styles,@worse-and-pricier/design-system-ui,@worse-and-pricier/design-system
```

**Preview components in Storybook:**
```bash
npx nx storybook @worse-and-pricier/design-system-ui
```

**Test in application:**
```bash
npx nx serve question-randomizer
```

### 4. Publishing Workflow

**Prerequisites:**
- All packages must be built
- Version numbers updated in `package.json` files
- Changes documented

**Build order (dependencies first):**
```bash
npx nx build @worse-and-pricier/design-system-tokens   # 1. Foundation (no dependencies)
npx nx build @worse-and-pricier/design-system-styles   # 2. Depends on tokens
npx nx build @worse-and-pricier/design-system-ui       # 3. Depends on tokens (SCSS)
npx nx build @worse-and-pricier/design-system          # 4. Meta-package (depends on all)
```

**Publish order (same as build):**
1. `@worse-and-pricier/design-system-tokens`
2. `@worse-and-pricier/design-system-styles`
3. `@worse-and-pricier/design-system-ui`
4. `@worse-and-pricier/design-system`

**Publishing:**
```bash
# Using Nx release (recommended)
npx nx release

# Or manually from dist folders
cd dist/libs/design-system/tokens
npm publish
# ... repeat for other packages
```

### 5. Module Boundary Rules

The design system follows strict ESLint module boundaries:

```javascript
// Meta-package can depend on:
'type:ui', 'type:styles', 'type:util'

// Tokens (util) can depend on:
'type:util'  // Only other utils, no external dependencies

// Styles can depend on:
'type:util'  // For design tokens

// UI can depend on:
'type:ui', 'type:util', 'type:styles'
```

**See:** [`/docs/MODULE_BOUNDARIES.md`](./MODULE_BOUNDARIES.md) for detailed rules.

### 6. Storybook Documentation

Every new component should have Storybook stories:

**Location:** `libs/design-system/ui/src/lib/**/*.stories.ts`

**Example:**
```typescript
import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Components/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  args: {
    label: 'Button',
    type: 'primary',
  },
};
```

**Run Storybook:**
```bash
npx nx storybook @worse-and-pricier/design-system-ui
```

## Best Practices

### Component Development
- Keep components focused and single-purpose
- Use TypeScript interfaces for component inputs
- Provide default values for optional inputs
- Write comprehensive Storybook stories showing all variants

### Design Tokens
- Keep tokens framework-agnostic (can be used in React, Vue, etc.)
- Provide both SCSS and TypeScript exports
- Use semantic naming (e.g., `color-primary`, not `color-blue`)

### Styling
- Use SCSS mixins for reusable styles
- Avoid hard-coded values; use design tokens
- Support both light and dark themes via `ThemeService`

### Documentation
- Update Storybook stories when changing components
- Document breaking changes in component documentation
- Keep README files up to date

## Resources

- **Design System Documentation:** [`/libs/design-system/README.md`](../libs/design-system/README.md)
- **Storybook:** `npx nx storybook @worse-and-pricier/design-system-ui`
- **Module Boundaries:** [`/docs/MODULE_BOUNDARIES.md`](./MODULE_BOUNDARIES.md)
- **Quick Command Reference:** See [CLAUDE.md](../CLAUDE.md#quick-command-reference)
