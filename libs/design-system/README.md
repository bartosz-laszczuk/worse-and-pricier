# Design System

A comprehensive, publishable design system for building consistent user interfaces across applications.

## Overview

This design system is organized into three publishable NPM packages, all following the Angular Package Format (APF) specification:

- **`@my-nx-monorepo/design-system-tokens`** - Design tokens (colors, typography, spacing)
- **`@my-nx-monorepo/design-system-styles`** - Global styles, theme service (light/dark), and utilities
- **`@my-nx-monorepo/design-system-ui`** - UI components and models library

## Packages

### 1. Design System Tokens (`libs/design-system/tokens`)

Design tokens provide programmatic access to design values.

**TypeScript Usage:**
```typescript
import { colors, typography, spacing } from '@my-nx-monorepo/design-system-tokens';

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
import { Theme, ThemeService } from '@my-nx-monorepo/design-system-styles';

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
} from '@my-nx-monorepo/design-system-ui';

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
npx nx run-many --target=build --projects=tokens,styles,ui
```

### Running Tests

```bash
npx nx run-many --target=test --projects=tokens,styles,ui
```

### Linting

```bash
npx nx run-many --target=lint --projects=tokens,styles,ui
```

## Publishing

All three libraries are configured as publishable packages. To publish to NPM or a private registry:

1. Build the packages:
```bash
npx nx run-many --target=build --projects=tokens,styles,ui
```

2. Publish from dist folders:
```bash
cd dist/libs/design-system/tokens && npm publish
cd dist/libs/design-system/styles && npm publish
cd dist/libs/design-system/ui && npm publish
```

Or use Nx release:
```bash
npx nx release
```

## Architecture

### Module Boundaries

The design system follows strict module boundaries enforced by ESLint:

- **tokens** (type:util, scope:design-system) - No dependencies
- **styles** (type:styles, scope:design-system) - Can depend on tokens
- **ui** (type:ui, scope:design-system) - Contains its own models and can depend on util libraries

### Dependency Graph

```
┌─────────┐
│ tokens  │
└────┬────┘
     │
     ▼
┌─────────┐
│ styles  │
└─────────┘

┌─────────┐
│   ui    │
└─────────┘
```

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
