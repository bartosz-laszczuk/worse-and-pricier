# Design System Styles

Global styles, base resets, themes (light/dark), utilities, and component styles. Part of the `@worse-and-pricier/design-system` package suite.

## Features

- **Global Styles:** Base resets, typography, and component styles
- **Theme Support:** Light and dark themes with programmatic switching via `ThemeService`
- **Utilities:** Spacing utilities and helper classes
- **Design Tokens:** Uses tokens from `@worse-and-pricier/design-system-tokens`

## Dependencies

This package depends on:
- `@worse-and-pricier/design-system-tokens` - For SCSS variables and functions
- `@angular/core` - For ThemeService (Angular 20+)

## Installation

```bash
npm install @worse-and-pricier/design-system-tokens @worse-and-pricier/design-system-styles
```

## Usage

### Theme Service

```typescript
import { Theme, ThemeService } from '@worse-and-pricier/design-system-styles';

@Component({
  selector: 'app-settings',
  template: `
    <button (click)="toggleTheme()">
      Current theme: {{ themeService.currentTheme() }}
    </button>
  `
})
export class SettingsComponent {
  themeService = inject(ThemeService);

  toggleTheme() {
    const newTheme = this.themeService.currentTheme() === 'light' ? 'dark' : 'light';
    this.themeService.setTheme(newTheme);
  }
}
```

### SCSS Configuration

Add to your Angular project's `project.json`:

```json
{
  "styles": [
    "libs/design-system/styles/src/lib/styles/main.scss",
    "apps/your-app/src/styles.scss"
  ],
  "stylePreprocessorOptions": {
    "includePaths": ["libs/design-system/tokens/src/lib/scss"]
  }
}
```

## Exports

- `Theme` - Type definition for theme values (`'light' | 'dark' | ''`)
- `ThemeService` - Service for managing theme switching and persistence

## Building

```bash
npx nx build styles
```

## Running Tests

```bash
npx nx test styles
```
