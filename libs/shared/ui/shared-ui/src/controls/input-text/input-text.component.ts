import {
  ChangeDetectionStrategy,
  Component,
  forwardRef,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';

@Component({
  selector: 'lib-input-text',
  imports: [CommonModule],
  templateUrl: './input-text.component.html',
  styleUrl: './input-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputTextComponent),
      multi: true,
    },
  ],
})
export class InputTextComponent implements ControlValueAccessor, Validator {
  @Input() label!: string;
  @Input() placeholder = '';
  @Input() type = 'text';
  @Input() hint?: string;
  @Input() errorMessages: { [key: string]: string } = {};

  value: any = '';
  touched = false;
  disabled = false;
  control!: AbstractControl; // This will reference the parent form control

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.onChange(inputElement.value);
  }

  onChange = (value: any) => {};

  onTouched = () => {};

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    this.control = control; // Store the control reference for error handling
    return control.valid ? null : { invalid: true };
  }

  markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  getErrorMessage(): string | null {
    if (!this.control || !this.control.errors) return null;

    // Default error messages
    const defaultMessages: { [key: string]: string } = {
      required: 'This field is required.',
      minlength: 'The input is too short.',
      maxlength: 'The input is too long.',
      pattern: 'Invalid format.',
      email: 'Invalid email address.',
    };

    // Merge default and custom error messages
    const mergedMessages = { ...defaultMessages, ...this.errorMessages };

    // Find and return the first relevant error message
    for (const errorKey in this.control.errors) {
      if (this.control.errors?.[errorKey] && mergedMessages[errorKey]) {
        return mergedMessages[errorKey];
      }
    }

    return 'Invalid input';
  }
}
