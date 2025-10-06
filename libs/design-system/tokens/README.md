# Design System Tokens

Design tokens provide programmatic access to design values (colors, typography, spacing). Part of the `@my-nx-monorepo/design-system` package suite.

## Features

- **Colors:** Primary, secondary, success, warning, danger, and grayscale colors
- **Typography:** Font families, sizes, weights, and line heights
- **Spacing:** Consistent spacing scale
- **Available in TypeScript and SCSS**

## Usage

### TypeScript

```typescript
import { colors, typography, spacing } from '@my-nx-monorepo/design-system-tokens';

// Colors
console.log(colors.primary);           // '#eddf64'
console.log(colors.background.light);  // '#ffffff'

// Typography
console.log(typography.fontFamily.base);  // "'Figtree', sans-serif"
console.log(typography.fontSize.base);    // '16px'

// Spacing
console.log(spacing.base);  // '1rem'
```

### SCSS

```scss
// Import from source during development
@use '../../../../../design-system/tokens/src/lib/scss/variables';
@use '../../../../../design-system/tokens/src/lib/scss/colors';
@use '../../../../../design-system/tokens/src/lib/scss/mixins';
@use '../../../../../design-system/tokens/src/lib/scss/functions';

// Or import from built package (when published)
@use '@my-nx-monorepo/design-system-tokens/scss' as tokens;

.my-component {
  // CSS variables (defined in colors.scss)
  color: var(--primary-color);
  background: var(--background-color);

  // SCSS variables
  border-radius: $border-radius;
  padding: $spacing-base;
}
```

## Exports

### TypeScript
- `colors` - Color palette object
- `typography` - Typography tokens object
- `spacing` - Spacing scale object

### SCSS
- `variables.scss` - Base SCSS variables
- `colors.scss` - CSS custom properties for colors
- `mixins.scss` - Utility mixins
- `functions.scss` - Utility functions

## Building

```bash
npx nx build tokens
```

## Running Tests

```bash
npx nx test tokens
```
