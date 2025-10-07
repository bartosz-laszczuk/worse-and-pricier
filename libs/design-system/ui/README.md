# Design System UI

Complete UI component library with buttons, controls, tables, cards, and more. Part of the `@worse-and-pricier/design-system` package suite.

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
