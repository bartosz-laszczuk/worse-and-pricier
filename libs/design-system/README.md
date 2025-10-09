# Design System

A comprehensive, publishable design system for building consistent user interfaces across applications.

## Overview

This design system is organized into **four publishable NPM packages**, all following the Angular Package Format (APF) specification:

- **`@worse-and-pricier/design-system`** - **Meta-package** that bundles all three packages for simplified Angular installation
- **`@worse-and-pricier/design-system-tokens`** - Design tokens (colors, typography, spacing)
- **`@worse-and-pricier/design-system-styles`** - Global styles, theme service (light/dark), and utilities
- **`@worse-and-pricier/design-system-ui`** - UI components and models library

### Quick Start (Recommended for Angular)

For Angular applications, use the meta-package for simplified installation:

```bash
npm install @worse-and-pricier/design-system
```

This single command installs all three sub-packages with guaranteed version compatibility. See the [meta-package README](./design-system/README.md) for details.

## Packages

### 1. Design System Tokens (`libs/design-system/tokens`)

Design tokens provide programmatic access to design values.

**TypeScript Usage:**
```typescript
import { colors, typography, spacing } from '@worse-and-pricier/design-system-tokens';

console.log(colors.primary); // '#eddf64'
console.log(typography.fontFamily.base); // "'Figtree', sans-serif"
```

**SCSS Usage:**
```scss
// Import SCSS tokens (after package is built)
@use 'path/to/dist/libs/design-system/tokens/scss' as tokens;

.my-component {
  color: var(--primary-color);
  border-radius: $border-radius;
}
```

**Build:**
```bash
npx nx build tokens
```

### 2. Design System Styles (`libs/design-system/styles`)

Global styles, base resets, themes (light/dark), utilities, and component styles. Includes `ThemeService` for programmatic theme switching.

**TypeScript Usage:**
```typescript
import { Theme, ThemeService } from '@worse-and-pricier/design-system-styles';

// Inject in component/service
constructor(private themeService = inject(ThemeService)) {}

// Get current theme
const currentTheme = this.themeService.currentTheme(); // Signal<'light' | 'dark' | ''>

// Change theme
this.themeService.setTheme('dark');
```

**Usage in project.json:**
```json
{
  "styles": [
    "node_modules/quill/dist/quill.snow.css",
    "libs/design-system/styles/src/lib/styles/main.scss",
    "apps/question-randomizer/src/styles.scss"
  ],
  "stylePreprocessorOptions": {
    "includePaths": ["libs/design-system/tokens/src/lib/scss"]
  }
}
```

**Build:**
```bash
npx nx build styles
```

### 3. Design System UI (`libs/design-system/ui`)

Complete UI component library with buttons, controls, tables, cards, and more.

**Components:**
- **Buttons:** `ButtonComponent`, `ButtonIconComponent`, `ButtonTextIconComponent`, `ButtonToggleComponent`, `ButtonToggleGroupComponent`, `ButtonGroupComponent`
- **Controls:** `InputTextComponent`, `InputSelectComponent`, `InputCheckComponent`, `InputCheckGroupComponent`, `InputRichTextEditorComponent`
- **Layout:** `CardComponent`, `TableComponent`, `PaginatorComponent`
- **Utilities:** `SortableHeaderComponent`, `ColumnDirective`

**Models:**
- `ButtonType` - Button type enum
- `OptionItem` - Select option model
- `SortDefinition<T>` - Table sorting model
- `PageEvent` - Pagination event model
- `IColumn` - Table column configuration

**Usage:**
```typescript
import {
  ButtonComponent,
  InputTextComponent,
  TableComponent,
  OptionItem,
  SortDefinition,
  PageEvent
} from '@worse-and-pricier/design-system-ui';

@Component({
  standalone: true,
  imports: [ButtonComponent, InputTextComponent, TableComponent],
  template: `
    <lib-button [type]="'primary'">Click Me</lib-button>
    <lib-input-text label="Username" placeholder="Enter username" />
  `
})
export class MyComponent {}
```

**Build:**
```bash
npx nx build ui
```

**Storybook:**
```bash
npx nx storybook ui          # Run Storybook dev server
npx nx build-storybook ui    # Build static Storybook
```

## Development

### Building All Packages

```bash
# Build sub-packages
npx nx run-many --target=build --projects=tokens,styles,ui

# Build meta-package (optional - depends on sub-packages)
npx nx build @worse-and-pricier/design-system

# Or build everything at once
npx nx run-many --target=build --projects=tokens,styles,ui,design-system
```

### Running Tests

```bash
npx nx run-many --target=test --projects=tokens,styles,ui,design-system
```

### Linting

```bash
npx nx run-many --target=lint --projects=tokens,styles,ui,design-system
```

## Publishing

All four libraries are configured as publishable packages. To publish to NPM or a private registry:

1. Build the packages:
```bash
# Build all packages
npx nx run-many --target=build --projects=tokens,styles,ui,design-system
```

2. Publish from dist folders:
```bash
cd dist/libs/design-system/tokens && npm publish
cd dist/libs/design-system/styles && npm publish
cd dist/libs/design-system/ui && npm publish
cd dist/libs/design-system/design-system && npm publish
```

Or use Nx release (recommended):
```bash
npx nx release
```

## Using Published Packages (External Projects)

If you're installing these packages from npm in a **different project**, choose the installation based on your needs:

### Installation Scenarios

**Scenario 1: Complete Angular app (RECOMMENDED) ⭐**
```bash
npm install @worse-and-pricier/design-system
```

Use the **meta-package** for Angular applications. This installs all three sub-packages (tokens, styles, ui) with guaranteed version compatibility. Simplest option for most Angular projects.

See [meta-package README](./design-system/README.md) for complete documentation.

**Scenario 2: Token-only usage (React/Vue/vanilla JS)**
```bash
npm install @worse-and-pricier/design-system-tokens
```

Use when you only need design tokens (colors, spacing, typography) in any framework:
```typescript
import { colors, spacing, typography } from '@worse-and-pricier/design-system-tokens';

const MyComponent = () => (
  <div style={{ color: colors.primary, padding: spacing.md }}>
    Hello World
  </div>
);
```

**Scenario 3: Theming in Angular (tokens + styles)**
```bash
npm install @worse-and-pricier/design-system-tokens @worse-and-pricier/design-system-styles
```

Use when you need global styles and theme switching, but not the UI components.

**Scenario 4: Granular control (individual packages)**
```bash
npm install @worse-and-pricier/design-system-tokens @worse-and-pricier/design-system-styles @worse-and-pricier/design-system-ui
```

Use when you want fine-grained control over individual package versions. Same result as the meta-package, but you manage versions separately.

### Angular Configuration (Required for Scenarios 1, 3 & 4)

Add the following to your **Angular project's `angular.json` or `project.json`**:

```json
{
  "architect": {
    "build": {
      "options": {
        "styles": [
          "node_modules/@worse-and-pricier/design-system-styles/styles/main.scss",
          "src/styles.scss"
        ],
        "stylePreprocessorOptions": {
          "includePaths": [
            "node_modules/@worse-and-pricier/design-system-tokens/scss"
          ]
        }
      }
    }
  }
}
```

### Why is `stylePreprocessorOptions` Required?

Both `styles` and `ui` packages use SCSS imports like `@use 'animations'` or `@use 'colors'` that reference files from the tokens package. The `includePaths` configuration tells Angular's SCSS compiler where to find these files.

**Without this configuration**, you'll see errors like:
```
Error: Can't find stylesheet to import.
@use 'animations';
```

### Full Usage Example (All 3 Packages)

```typescript
import { Component, inject } from '@angular/core';
import {
  ButtonComponent,
  InputTextComponent,
  TableComponent,
  OptionItem
} from '@worse-and-pricier/design-system-ui';
import { ThemeService } from '@worse-and-pricier/design-system-styles';
import { colors } from '@worse-and-pricier/design-system-tokens';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [ButtonComponent, InputTextComponent, TableComponent],
  template: `
    <div [style.background-color]="backgroundColor">
      <lib-button type="primary" (click)="toggleTheme()">
        Toggle Theme
      </lib-button>
    </div>
  `
})
export class ExampleComponent {
  private themeService = inject(ThemeService);

  // Access design tokens programmatically
  backgroundColor = colors.surface;

  toggleTheme() {
    const current = this.themeService.currentTheme();
    this.themeService.setTheme(current === 'dark' ? 'light' : 'dark');
  }
}
```

## Architecture

### Module Boundaries

The design system follows strict module boundaries enforced by ESLint:

- **tokens** (type:util, scope:design-system) - Foundation layer with no dependencies
- **styles** (type:styles, scope:design-system) - Depends on tokens for SCSS variables/functions
- **ui** (type:ui, scope:design-system) - Depends on tokens for SCSS compilation (via styleIncludePaths)

### Dependency Graph

```
        ┌─────────────────┐
        │     tokens      │ (Foundation)
        │  SCSS + TypeScript │
        └────────┬─────────┘
                 │
         ┌───────┴───────┐
         │               │
         ▼               ▼
    ┌─────────┐     ┌─────────┐
    │ styles  │     │   ui    │
    │  (SCSS) │     │ (Angular)│
    └─────────┘     └─────────┘
```

**Key points:**
- `tokens` is framework-agnostic and can be used in any project (React, Vue, vanilla JS)
- `styles` imports tokens via SCSS `@use` statements for global styles and themes
- `ui` imports tokens via `styleIncludePaths` for component SCSS compilation
- `ui` does NOT depend on `styles` at runtime (consumers include styles separately if needed)
- Both `styles` and `ui` are independent consumers of `tokens`

### Why 3 Separate Packages?

This architecture provides maximum flexibility for different use cases:

| Use Case | Install | Bundle Size | Framework Required |
|----------|---------|-------------|--------------------|
| React app needs design tokens only | `tokens` | ~5KB | None |
| Vue app needs colors/spacing | `tokens` | ~5KB | None |
| Angular app needs theming | `tokens` + `styles` | ~50KB | Angular |
| Angular app needs full UI library | `tokens` + `styles` + `ui` | ~200KB | Angular |

**Benefits:**
- ✅ Framework-agnostic foundation (use tokens in any project)
- ✅ Better tree-shaking and bundle optimization
- ✅ Independent versioning (token updates don't force UI updates)
- ✅ Follows industry standards (Material Design, Carbon, Polaris)
- ✅ Future-proof (can add `design-system-react` later without breaking changes)

**Alternative (1 merged package) would:**
- ❌ Force Angular dependency on all consumers (even React apps wanting just colors)
- ❌ Larger bundles for simple use cases
- ❌ Violate separation of concerns
- ❌ Prevent use in non-Angular projects

## Documentation

- **Component Documentation:** Run Storybook (`npx nx storybook ui`)
- **API Documentation:** TypeScript definitions are included in all packages
- **Examples:** See Storybook stories in `libs/design-system/ui/src/lib/**/*.stories.ts`

## Contributing

When adding new components or tokens:

1. Add components to appropriate library
2. Export from library's `index.ts`
3. Create Storybook stories for UI components
4. Update this README if adding new major features
5. Follow existing patterns and naming conventions

## License

MIT
