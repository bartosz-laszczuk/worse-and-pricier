import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';

@Component({
  selector: 'lib-input-rich-text-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  templateUrl: './input-rich-text-editor.component.html',
  styleUrl: './input-rich-text-editor.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputRichTextEditorComponent),
      multi: true,
    },
    {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => InputRichTextEditorComponent),
      multi: true,
    },
  ],
})
export class InputRichTextEditorComponent
  implements ControlValueAccessor, Validator
{
  public label = input.required<string>();
  public hint = input<string | undefined>();
  public placeholder = input<string>('Write something...');
  public errorMessages = input<{ [key: string]: string }>({});

  inputId = `rich-text-${crypto.randomUUID()}`;
  private readonly cdr = inject(ChangeDetectorRef);

  value = '';
  touched = false;
  disabled = false;
  control!: AbstractControl;

  onChange: (value: string) => void = () => {
    /* CVA callback */
  };
  onTouched: () => void = () => {
    /* CVA callback */
  };

  writeValue(value: string): void {
    this.value = value || '';
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
    this.cdr.markForCheck();
  }

  validate(control: AbstractControl): ValidationErrors | null {
    this.control = control;
    return control.valid ? null : { invalid: true };
  }

  markAsTouched(): void {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }

  getErrorMessage(): string | null {
    if (!this.control || !this.control.errors) return null;

    const defaultMessages: { [key: string]: string } = {
      required: 'This field is required.',
      minlength: 'The input is too short.',
      maxlength: 'The input is too long.',
    };

    const mergedMessages = { ...defaultMessages, ...this.errorMessages() };

    for (const errorKey in this.control.errors) {
      if (this.control.errors?.[errorKey] && mergedMessages[errorKey]) {
        return mergedMessages[errorKey];
      }
    }

    return 'Invalid input';
  }
}
