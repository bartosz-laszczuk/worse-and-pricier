import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OptionItem, Value } from '@my-nx-monorepo/shared-util';

@Component({
  selector: 'lib-input-check-group',
  imports: [CommonModule],
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
  @Input() items: OptionItem[] | undefined;
  @Input() value: Value[] = [];
  @Output() changed = new EventEmitter<Value[]>();
  public isDisabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private propagateChange: any = () => {};

  writeValue(value: Value[]): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  registerOnTouched(fn: any): void {}

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onChanged(value: Value, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const selected = this.getSelected(value, checked);

    this.value = selected;
    this.propagateChange(selected);
    this.changed.emit(selected);
  }

  private getSelected(value: Value, checked: boolean): Value[] {
    const selected: Value[] = this.value ? [...this.value] : [];

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
    return this.value && this.value.includes(value);
  }
}
