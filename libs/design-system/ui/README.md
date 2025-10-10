# Design System UI

Complete UI component library with buttons, controls, tables, cards, and more. Part of the `@worse-and-pricier/design-system` package suite.

> **💡 Recommended:** Use the meta-package [`@worse-and-pricier/design-system`](../design-system) which bundles tokens, styles, and UI components together for simplified installation and guaranteed version compatibility.

## Dependencies

This package depends on:
- `@worse-and-pricier/design-system-tokens` - For SCSS compilation (mixins, functions, animations)
- `@angular/core`, `@angular/common`, `@angular/forms` - Angular framework (20+)
- `angular-svg-icon` - For SVG icon support
- `ngx-quill` - For rich text editor component

**Note:** This package does **NOT** depend on `@worse-and-pricier/design-system-styles`. If you need global styles and theme switching, install `styles` separately.

## Installation

```bash
# Minimal installation (UI components only)
npm install @worse-and-pricier/design-system-tokens @worse-and-pricier/design-system-ui

# Full installation (with global styles and theming)
npm install @worse-and-pricier/design-system-tokens @worse-and-pricier/design-system-styles @worse-and-pricier/design-system-ui
```

## Angular Configuration

Add to your `angular.json` or `project.json`:

```json
{
  "stylePreprocessorOptions": {
    "includePaths": [
      "node_modules/@worse-and-pricier/design-system-tokens/scss"
    ]
  }
}
```

This is **required** for UI components to compile SCSS that references token files.

### Icon Assets (Required for ButtonIconComponent)

The `ButtonIconComponent` requires SVG icon files to be available at runtime. These are included in the package under `assets/icons/`.

**Add the following assets configuration to your `angular.json` or `project.json`:**

```json
{
  "architect": {
    "build": {
      "options": {
        "assets": [
          {
            "glob": "**/*",
            "input": "node_modules/@worse-and-pricier/design-system-ui/assets",
            "output": "/assets"
          }
        ]
      }
    }
  }
}
```

This copies icon files to your application's output directory at `/assets/icons/`, making them accessible via `icons/[icon-name].svg`.

**Without this configuration**, `ButtonIconComponent` will fail to load icons with 404 errors.

**Example:**
```typescript
import { ButtonIconComponent } from '@worse-and-pricier/design-system-ui';

@Component({
  standalone: true,
  imports: [ButtonIconComponent],
  template: `
    <lib-button-icon
      icon="arrow-right"
      type="default"
      (click)="handleClick()"
    />
  `
})
export class MyComponent {}
```

**Available icons:**
- `arrow-left`
- `arrow-right`
- `corner-up-right`
- `rotate-ccw`
- `eye`
- `eye-off`
- `edit`

See `assets/icons/` in the package for the complete list.

## Components

### Buttons
- `ButtonComponent` - Standard button with primary/secondary/tertiary/danger types
- `ButtonIconComponent` - Icon-only button
- `ButtonTextIconComponent` - Button with text and icon
- `ButtonToggleComponent` - Toggle button (for button groups)
- `ButtonToggleGroupComponent` - Group of toggle buttons
- `ButtonGroupComponent` - Group of standard buttons

### Controls
- `InputTextComponent` - Text input with label and validation
- `InputSelectComponent` - Select dropdown
- `InputCheckComponent` - Checkbox
- `InputCheckGroupComponent` - Group of checkboxes
- `InputRichTextEditorComponent` - Rich text editor (Quill)

### Layout
- `CardComponent` - Card container
- `TableComponent` - Data table with sorting and pagination
- `PaginatorComponent` - Pagination controls

### Utilities
- `SortableHeaderComponent` - Sortable table header
- `ColumnDirective` - Table column directive

## Models

- `ButtonType` - Button type enum (`'primary' | 'secondary' | 'tertiary' | 'danger'`)
- `OptionItem` - Select option model (`{ label: string; value: string }`)
- `SortDefinition<T>` - Table sorting model
- `PageEvent` - Pagination event model
- `IColumn` - Table column configuration

## Usage

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
    <lib-button [type]="'primary'" (click)="handleClick()">
      Click Me
    </lib-button>

    <lib-input-text
      label="Username"
      placeholder="Enter username"
      [control]="usernameControl"
    />

    <lib-table
      [data]="data"
      [columns]="columns"
      (sort)="onSort($event)"
    />
  `
})
export class MyComponent {
  usernameControl = new FormControl('');
  data = [...];
  columns: IColumn[] = [...];

  handleClick() {
    console.log('Button clicked');
  }

  onSort(sort: SortDefinition<MyType>) {
    // Handle sorting
  }
}
```

## Storybook

View component documentation and examples:

```bash
npx nx storybook ui          # Run Storybook dev server
npx nx build-storybook ui    # Build static Storybook
```

## Building

```bash
npx nx build ui
```

## Running Tests

```bash
npx nx test ui
```
