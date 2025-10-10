import { Meta, StoryObj } from '@storybook/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextComponent } from './input-text.component';

const meta: Meta<InputTextComponent> = {
  component: InputTextComponent,
  title: 'Components/Controls/Input Text',
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed above the input',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when input is empty',
    },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'tel', 'url'],
      description: 'HTML input type',
    },
    hint: {
      control: 'text',
      description: 'Optional hint text displayed below the input',
    },
    classes: {
      control: 'text',
      description: 'Additional CSS classes to apply',
    },
    icon: {
      control: 'text',
      description: 'Optional icon name to display',
    },
    errorMessages: {
      control: 'object',
      description: 'Custom error messages for validation errors',
    },
  },
};

export default meta;
type Story = StoryObj<InputTextComponent>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        field: new FormControl(''),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputTextComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-text
          formControlName="field"
          [label]="label"
          [placeholder]="placeholder"
          [type]="type"
        />
      </form>
    `,
  }),
  args: {
    label: 'Username',
    placeholder: 'Enter your username',
    type: 'text',
  },
};

export const WithHint: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        field: new FormControl(''),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputTextComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-text
          formControlName="field"
          [label]="label"
          [placeholder]="placeholder"
          [type]="type"
          [hint]="hint"
        />
      </form>
    `,
  }),
  args: {
    label: 'Email',
    placeholder: 'Enter your email',
    type: 'email',
    hint: "We'll never share your email with anyone else.",
  },
};

export const Password: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        field: new FormControl(''),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputTextComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-text
          formControlName="field"
          [label]="label"
          [placeholder]="placeholder"
          [type]="type"
        />
      </form>
    `,
  }),
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
  },
};

export const WithIcon: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        field: new FormControl(''),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputTextComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-text
          formControlName="field"
          [label]="label"
          [placeholder]="placeholder"
          [type]="type"
          [icon]="icon"
        />
      </form>
    `,
  }),
  args: {
    label: 'Search',
    placeholder: 'Search...',
    type: 'text',
    icon: 'search',
  },
};

export const WithCustomClasses: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        field: new FormControl(''),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputTextComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-text
          formControlName="field"
          [label]="label"
          [placeholder]="placeholder"
          [type]="type"
          [classes]="classes"
        />
      </form>
    `,
  }),
  args: {
    label: 'Custom Styled Input',
    placeholder: 'Enter text',
    type: 'text',
    classes: 'custom-input-class',
  },
};

/**
 * Example showing the component working with Angular Reactive Forms.
 * Demonstrates validation errors and error messages.
 */
export const WithReactiveForms: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        email: new FormControl('', [Validators.required, Validators.email]),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputTextComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-text
          formControlName="email"
          [label]="label"
          [placeholder]="placeholder"
          [type]="type"
          [hint]="hint"
          [errorMessages]="errorMessages"
        />
        <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 4px;">
          <strong>Form Value:</strong> {{ form.value | json }}<br>
          <strong>Form Valid:</strong> {{ form.valid }}<br>
          <strong>Form Touched:</strong> {{ form.touched }}
        </div>
      </form>
    `,
  }),
  args: {
    label: 'Email Address',
    placeholder: 'Enter your email',
    type: 'email',
    hint: 'Try entering an invalid email to see error messages',
    errorMessages: {
      required: 'Email is required',
      email: 'Please enter a valid email address',
    },
  },
};
