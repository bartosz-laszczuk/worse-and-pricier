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
import { OptionItem } from '@my-nx-monorepo/shared-util';

@Component({
  selector: 'lib-input-select',
  standalone: true,
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
  public changed = output<any>();
  private readonly cdr = inject(ChangeDetectorRef);

  value?: any;
  isDisabled = false;

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private propagateChange: any = () => {};
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  private propagateTouched: any = () => {};

  writeValue(value: any): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.propagateTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onChangedPureHtmlSelect(event: Event) {
    const value = (event as any)?.target?.value
      ? (event as any).target.value
      : null;

    this.value = value;
    this.propagateChange(value);
    this.changed.emit(value);
  }

  onChanged(event: any): void {
    const value = event.value ? event.value : null;

    this.value = value;
    this.propagateChange(value);
    this.changed.emit(value);
  }

  onBlur(): void {
    this.propagateTouched();
  }
}
