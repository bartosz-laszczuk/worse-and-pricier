import { Meta, StoryObj } from '@storybook/angular';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputRichTextEditorComponent } from './input-rich-text-editor.component';

const meta: Meta<InputRichTextEditorComponent> = {
  component: InputRichTextEditorComponent,
  title: 'Components/Controls/Input Rich Text Editor',
  tags: ['autodocs'],
  argTypes: {
    label: {
      control: 'text',
      description: 'Label text displayed above the editor',
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text shown when editor is empty',
    },
    hint: {
      control: 'text',
      description: 'Optional hint text displayed below the editor',
    },
    errorMessages: {
      control: 'object',
      description: 'Custom error messages for validation errors',
    },
  },
};

export default meta;
type Story = StoryObj<InputRichTextEditorComponent>;

export const Default: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        content: new FormControl(''),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputRichTextEditorComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-rich-text-editor
          formControlName="content"
          [label]="label"
          [placeholder]="placeholder"
        />
      </form>
    `,
  }),
  args: {
    label: 'Description',
    placeholder: 'Write something...',
  },
};

export const WithHint: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        content: new FormControl(''),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputRichTextEditorComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-rich-text-editor
          formControlName="content"
          [label]="label"
          [placeholder]="placeholder"
          [hint]="hint"
        />
      </form>
    `,
  }),
  args: {
    label: 'Interview Answer',
    placeholder: 'Enter your answer...',
    hint: 'Use the toolbar to format your answer with bold, italic, lists, and more.',
  },
};

export const WithInitialContent: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        content: new FormControl('<h1>Sample Heading</h1><p>This is <strong>bold</strong> and <em>italic</em> text.</p><ul><li>Item 1</li><li>Item 2</li></ul>'),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputRichTextEditorComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-rich-text-editor
          formControlName="content"
          [label]="label"
          [placeholder]="placeholder"
        />
      </form>
    `,
  }),
  args: {
    label: 'Pre-filled Content',
    placeholder: 'Write something...',
  },
};

export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        content: new FormControl({ value: '<p>This editor is disabled.</p>', disabled: true }),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputRichTextEditorComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-rich-text-editor
          formControlName="content"
          [label]="label"
          [placeholder]="placeholder"
        />
      </form>
    `,
  }),
  args: {
    label: 'Disabled Editor',
    placeholder: 'Write something...',
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
        answer: new FormControl('', [Validators.required]),
      }),
    },
    moduleMetadata: {
      imports: [ReactiveFormsModule, InputRichTextEditorComponent],
    },
    template: `
      <form [formGroup]="form">
        <lib-input-rich-text-editor
          formControlName="answer"
          [label]="label"
          [placeholder]="placeholder"
          [hint]="hint"
          [errorMessages]="errorMessages"
        />
        <div style="margin-top: 16px; padding: 12px; background: #f5f5f5; border-radius: 4px;">
          <strong>Form Value:</strong> <pre style="white-space: pre-wrap; word-break: break-word;">{{ form.value.answer || '(empty)' }}</pre>
          <strong>Form Valid:</strong> {{ form.valid }}<br>
          <strong>Form Touched:</strong> {{ form.touched }}
        </div>
      </form>
    `,
  }),
  args: {
    label: 'Interview Question Answer',
    placeholder: 'Enter your answer...',
    hint: 'This field is required. Try leaving it empty and clicking outside to see validation.',
    errorMessages: {
      required: 'Answer is required',
    },
  },
};
