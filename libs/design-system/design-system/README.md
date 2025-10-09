# @worse-and-pricier/design-system

**Complete design system meta-package for Angular applications.**

This is an umbrella package that bundles all three design system packages together for simplified installation and guaranteed version compatibility.

## What's Included

When you install `@worse-and-pricier/design-system`, you automatically get:

- **[@worse-and-pricier/design-system-tokens](../tokens)** - Design tokens (colors, typography, spacing)
- **[@worse-and-pricier/design-system-styles](../styles)** - Global styles, themes, and ThemeService
- **[@worse-and-pricier/design-system-ui](../ui)** - Complete UI component library

## Installation

```bash
npm install @worse-and-pricier/design-system
```

This single command installs all three sub-packages with guaranteed version compatibility.

## When to Use This Package

✅ **Use this meta-package if:**
- You're building an **Angular application**
- You want the **complete design system** (tokens + styles + UI)
- You want **simplified installation** and dependency management
- You want **guaranteed version compatibility** between packages

❌ **Don't use this package if:**
- You're building a **React/Vue/vanilla JS** app (use `@worse-and-pricier/design-system-tokens` instead)
- You only need **tokens or styles** without UI components
- You need **fine-grained control** over individual package versions

## Quick Start

### 1. Install the package

```bash
npm install @worse-and-pricier/design-system
```

### 2. Configure Angular

Add to your `angular.json` or `project.json`:

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

### 3. Use in your components

```typescript
import { Component, inject } from '@angular/core';
import {
  // Import UI components
  ButtonComponent,
  InputTextComponent,
  TableComponent,
  CardComponent,

  // Import services
  ThemeService,

  // Import tokens (if needed programmatically)
  colors,
  spacing,
  typography,

  // Import models
  OptionItem,
  SortDefinition,
  PageEvent
} from '@worse-and-pricier/design-system';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    ButtonComponent,
    InputTextComponent,
    TableComponent,
    CardComponent
  ],
  template: `
    <div [style.background-color]="backgroundColor">
      <lib-card>
        <lib-button type="primary" (click)="toggleTheme()">
          Toggle Theme (Current: {{ themeService.currentTheme() }})
        </lib-button>

        <lib-input-text
          label="Username"
          placeholder="Enter your username"
          [control]="usernameControl"
        />

        <lib-table
          [data]="users"
          [columns]="columns"
          (sort)="onSort($event)"
        />
      </lib-card>
    </div>
  `
})
export class ExampleComponent {
  private themeService = inject(ThemeService);

  // Use design tokens programmatically
  backgroundColor = colors.surface;
  padding = spacing.lg;

  usernameControl = new FormControl('');
  users = [...];
  columns = [...];

  toggleTheme() {
    const current = this.themeService.currentTheme();
    this.themeService.setTheme(current === 'dark' ? 'light' : 'dark');
  }

  onSort(sort: SortDefinition<User>) {
    // Handle sorting
  }
}
```

## Package Architecture

This meta-package provides **two usage patterns**:

### Pattern 1: Import from meta-package (Convenient)
```typescript
import { ButtonComponent, colors, ThemeService } from '@worse-and-pricier/design-system';
```

### Pattern 2: Import from specific packages (Tree-shakable)
```typescript
import { ButtonComponent } from '@worse-and-pricier/design-system-ui';
import { colors } from '@worse-and-pricier/design-system-tokens';
import { ThemeService } from '@worse-and-pricier/design-system-styles';
```

**Both patterns work!** The meta-package re-exports everything from the sub-packages, so you can choose whichever import style you prefer.

## What Gets Installed

When you run `npm install @worse-and-pricier/design-system`, npm automatically installs these dependencies:

```
@worse-and-pricier/design-system
├── @worse-and-pricier/design-system-tokens@^0.0.1
├── @worse-and-pricier/design-system-styles@^0.0.1
└── @worse-and-pricier/design-system-ui@^0.0.1
```

All three packages are guaranteed to be compatible versions.

## Alternative Installation Methods

If you need more control, you can still install packages individually:

```bash
# Token-only (React/Vue/vanilla JS)
npm install @worse-and-pricier/design-system-tokens

# Tokens + Styles (Angular, no UI components)
npm install @worse-and-pricier/design-system-tokens @worse-and-pricier/design-system-styles

# Individual packages (Angular, full control)
npm install @worse-and-pricier/design-system-tokens @worse-and-pricier/design-system-styles @worse-and-pricier/design-system-ui
```

See the [main design system README](../) for detailed documentation on each package.

## Exports

This package re-exports everything from the three sub-packages:

### From @worse-and-pricier/design-system-tokens
- `colors` - Color palette
- `typography` - Typography tokens
- `spacing` - Spacing scale
- `OptionItem`, `Icon`, `Value` - Data models
- `SortDirection`, `SortDefinition`, `PageParameters`, `Filters` - Table models

### From @worse-and-pricier/design-system-styles
- `Theme` - Theme type (`'light' | 'dark' | ''`)
- `ThemeService` - Service for theme management

### From @worse-and-pricier/design-system-ui
- `ButtonComponent`, `ButtonIconComponent`, `ButtonTextIconComponent` - Button components
- `ButtonToggleComponent`, `ButtonToggleGroupComponent`, `ButtonGroupComponent` - Button variants
- `InputTextComponent`, `InputSelectComponent`, `InputCheckComponent` - Form controls
- `InputCheckGroupComponent`, `InputRichTextEditorComponent` - Advanced controls
- `CardComponent`, `TableComponent`, `PaginatorComponent` - Layout components
- `SortableHeaderComponent`, `ColumnDirective` - Table utilities
- `ButtonType` - Button type enum
- `PageEvent`, `IColumn` - Component models

## Documentation

- **Component Documentation:** Run Storybook
  ```bash
  npx nx storybook ui
  ```

- **API Documentation:** See individual package READMEs
  - [Tokens README](../tokens/README.md)
  - [Styles README](../styles/README.md)
  - [UI README](../ui/README.md)

- **Main Design System Documentation:** [Design System README](../README.md)

## Building from Source

```bash
# Build all sub-packages first
npx nx run-many --target=build --projects=tokens,styles,ui

# Then build the meta-package
npx nx build @worse-and-pricier/design-system
```

## Running Tests

```bash
npx nx test @worse-and-pricier/design-system
```

## Why Use a Meta-Package?

**Benefits:**
- ✅ **One command installation** - No need to remember three package names
- ✅ **Version compatibility** - Guaranteed to work together
- ✅ **Simplified dependency management** - One version to track instead of three
- ✅ **Cleaner package.json** - One line instead of three
- ✅ **Industry standard** - Same pattern as `@angular/material`, `antd`, etc.

**Trade-offs:**
- Slightly larger installation size (but you probably need all three anyway)
- One more package in the registry (but simplifies consumer experience)

## License

MIT
