import { Component, effect, forwardRef, input, output } from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OptionItem, Value } from '@worse-and-pricier/design-system-tokens';

@Component({
  selector: 'lib-input-check-group',
  standalone: true,
  imports: [],
  templateUrl: './input-check-group.component.html',
  styleUrl: './input-check-group.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputCheckGroupComponent),
      multi: true,
    },
  ],
})
export class InputCheckGroupComponent implements ControlValueAccessor {
  public items = input<OptionItem[] | undefined>();
  public value = input<Value[]>([]);
  public selectedChanged = output<Value[]>();
  public checkboxChanged = output<{
    value: Value;
    checked: boolean;
  }>();

  constructor() {
    effect(() => {
      // Sync internalValue with value input when it changes
      const currentValue = this.value();
      if (currentValue && currentValue.length > 0) {
        this.internalValue = currentValue;
      }
    });
  }

  // Internal state for ControlValueAccessor
  public internalValue: Value[] = [];
  public isDisabled = false;

  private propagateChange: (value: Value[]) => void = () => {
    /* CVA callback */
  };

  writeValue(value: Value[]): void {
    this.internalValue = value || this.value() || [];
  }

  registerOnChange(fn: (value: Value[]) => void): void {
    this.propagateChange = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  registerOnTouched(_fn: () => void): void {
    /* CVA callback - not used in this component */
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onChanged(value: Value, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;

    this.checkboxChanged.emit({ value, checked });
    const selected = this.getSelected(value, checked);

    this.internalValue = selected;
    this.propagateChange(selected);
    this.selectedChanged.emit(selected);
  }

  private getSelected(value: Value, checked: boolean): Value[] {
    const selected: Value[] = this.internalValue ? [...this.internalValue] : [];

    if (checked) {
      if (!selected.includes(value)) {
        selected.push(value);
      }
    } else {
      const index = selected.indexOf(value);
      selected.splice(index, 1);
    }

    return selected.length ? selected : [];
  }

  isChecked(value: Value): boolean {
    return this.internalValue && this.internalValue.includes(value);
  }
}
