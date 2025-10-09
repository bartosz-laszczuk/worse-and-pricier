import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
  output,
} from '@angular/core';

import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OptionItem } from '@worse-and-pricier/design-system-tokens';

@Component({
  selector: 'lib-input-select',
  imports: [],
  templateUrl: './input-select.component.html',
  styleUrls: ['./input-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputSelectComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputSelectComponent implements ControlValueAccessor {
  public options = input<OptionItem[] | undefined>();
  public placeholder = input('');
  public changed = output<string | number | boolean | null>();
  private readonly cdr = inject(ChangeDetectorRef);

  value?: string | number | boolean | null;
  isDisabled = false;

  private propagateChange: (value: string | number | boolean | null) => void = () => {
    /* CVA callback */
  };
  private propagateTouched: () => void = () => {
    /* CVA callback */
  };

  writeValue(value: string | number | boolean | null): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number | boolean | null) => void): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.propagateTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onChangedPureHtmlSelect(event: Event) {
    const target = event.target as HTMLSelectElement;
    const value = target.value || null;

    this.value = value;
    this.propagateChange(value);
    this.changed.emit(value);
  }

  onChanged(event: { value?: string | number | boolean }): void {
    const value = event.value ?? null;

    this.value = value;
    this.propagateChange(value);
    this.changed.emit(value);
  }

  onBlur(): void {
    this.propagateTouched();
  }
}
