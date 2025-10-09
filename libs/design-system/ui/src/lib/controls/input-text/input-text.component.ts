import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  HostBinding,
  inject,
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
import { SvgIconComponent } from 'angular-svg-icon';

/**
 * Text input component with form validation support.
 * Implements Angular's ControlValueAccessor for reactive forms integration.
 *
 * @example
 * ```html
 * <lib-input-text
 *   label="Email"
 *   placeholder="Enter your email"
 *   type="email"
 *   hint="We'll never share your email"
 *   [errorMessages]="{ required: 'Email is required' }"
 *   formControlName="email">
 * </lib-input-text>
 * ```
 */
@Component({
  selector: 'lib-input-text',
  imports: [CommonModule, SvgIconComponent],
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
  /** Label text displayed above the input */
  @Input() label = '';
  /** Placeholder text shown when input is empty */
  @Input() placeholder = '';
  /** HTML input type (text, email, password, etc.) */
  @Input() type = 'text';
  /** Optional hint text displayed below the input */
  @Input() hint?: string;
  /** Additional CSS classes to apply */
  @Input() classes = '';
  /** Optional icon name to display */
  @Input() icon = '';
  /** Custom error messages for validation errors */
  @Input() errorMessages: { [key: string]: string } = {};

  @HostBinding('class.invalid') get isInvalid() {
    return (
      this.control?.invalid && (this.control?.touched || this.control?.dirty)
    );
  }

  private readonly cdr = inject(ChangeDetectorRef);

  value: string | number = '';
  touched = false;
  disabled = false;
  control!: AbstractControl;
  inputId = `input-${crypto.randomUUID()}`;

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.onChange(inputElement.value);
  }

  onChange: (value: string | number) => void = () => {
    /* CVA callback */
  };

  onTouched: () => void = () => {
    /* CVA callback */
  };

  writeValue(value: string | number): void {
    this.value = value;
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string | number) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
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
