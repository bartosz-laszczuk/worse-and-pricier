import { Meta, StoryObj, moduleMetadata } from '@storybook/angular';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputCheckGroupComponent } from './input-check-group.component';
import { OptionItem } from '@worse-and-pricier/design-system-tokens';

const meta: Meta<InputCheckGroupComponent> = {
  component: InputCheckGroupComponent,
  title: 'Components/Controls/Input Check Group',
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, InputCheckGroupComponent],
    }),
  ],
  argTypes: {
    items: {
      control: 'object',
      description: 'Array of checkbox options to display',
    },
    value: {
      control: 'object',
      description: 'Array of selected values',
    },
    selectedChanged: {
      action: 'selectedChanged',
      description: 'Emits when the selection changes',
    },
    checkboxChanged: {
      action: 'checkboxChanged',
      description: 'Emits when an individual checkbox changes',
    },
  },
};

export default meta;
type Story = StoryObj<InputCheckGroupComponent>;

const defaultItems: OptionItem[] = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
  { value: 'option3', label: 'Option 3' },
  { value: 'option4', label: 'Option 4' },
];

/**
 * Default checkbox group with basic options.
 */
export const Default: Story = {
  args: {
    items: defaultItems,
    value: [],
  },
};

/**
 * Checkbox group with pre-selected values.
 */
export const WithPreselectedValues: Story = {
  args: {
    items: defaultItems,
    value: ['option1', 'option3'],
  },
};

/**
 * Checkbox group with numerical values.
 */
export const WithNumberValues: Story = {
  args: {
    items: [
      { value: 1, label: 'Level 1' },
      { value: 2, label: 'Level 2' },
      { value: 3, label: 'Level 3' },
      { value: 4, label: 'Level 4' },
      { value: 5, label: 'Level 5' },
    ],
    value: [2, 4],
  },
};

/**
 * Checkbox group integrated with Angular Reactive Forms.
 * Demonstrates two-way binding with form control.
 */
export const WithReactiveForms: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        preferences: new FormControl<string[]>(['option2']),
      }),
    },
    template: `
      <form [formGroup]="form">
        <div style="margin-bottom: 16px;">
          <h4 style="margin-top: 0; margin-bottom: 12px;">Select Your Preferences</h4>
          <lib-input-check-group
            formControlName="preferences"
            [items]="items"
          />
        </div>
        <div style="padding: 12px; background: #f5f5f5; border-radius: 4px;">
          <strong>Form Value:</strong> {{ form.value | json }}<br>
          <strong>Form Valid:</strong> {{ form.valid }}<br>
          <strong>Form Pristine:</strong> {{ form.pristine }}
        </div>
      </form>
    `,
  }),
  args: {
    items: defaultItems,
  },
};

/**
 * Disabled checkbox group.
 * Demonstrates the disabled state when used with reactive forms.
 */
export const Disabled: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        preferences: new FormControl<string[]>(
          { value: ['option1', 'option3'], disabled: true }
        ),
      }),
    },
    template: `
      <form [formGroup]="form">
        <div style="margin-bottom: 16px;">
          <h4 style="margin-top: 0; margin-bottom: 12px;">Disabled Checkbox Group</h4>
          <lib-input-check-group
            formControlName="preferences"
            [items]="items"
          />
        </div>
        <div style="padding: 12px; background: #f5f5f5; border-radius: 4px;">
          <strong>Form Value:</strong> {{ form.value | json }}<br>
          <strong>Disabled:</strong> {{ form.get('preferences')?.disabled }}
        </div>
      </form>
    `,
  }),
  args: {
    items: defaultItems,
  },
};

/**
 * Example with event handling.
 * Shows how to respond to selection changes and individual checkbox changes.
 */
export const WithEventHandling: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        skills: new FormControl<string[]>([]),
      }),
      lastSelectedChange: [] as (string | number | boolean)[],
      lastCheckboxChange: null as { value: string | number | boolean; checked: boolean } | null,
      onSelectedChanged(selected: (string | number | boolean)[]) {
        this['lastSelectedChange'] = selected;
        console.log('Selected changed:', selected);
      },
      onCheckboxChanged(change: { value: string | number | boolean; checked: boolean }) {
        this['lastCheckboxChange'] = change;
        console.log('Checkbox changed:', change);
      },
    },
    template: `
      <form [formGroup]="form">
        <div style="margin-bottom: 16px;">
          <h4 style="margin-top: 0; margin-bottom: 12px;">Select Your Skills</h4>
          <lib-input-check-group
            formControlName="skills"
            [items]="items"
            (selectedChanged)="onSelectedChanged($event)"
            (checkboxChanged)="onCheckboxChanged($event)"
          />
        </div>
        <div style="padding: 12px; background: #f5f5f5; border-radius: 4px; margin-bottom: 12px;">
          <strong>Form Value:</strong> {{ form.value | json }}
        </div>
        <div style="padding: 12px; background: #e3f2fd; border-radius: 4px; margin-bottom: 12px;">
          <strong>Last Selection Change:</strong> {{ lastSelectedChange | json }}
        </div>
        <div style="padding: 12px; background: #fff3e0; border-radius: 4px;">
          <strong>Last Checkbox Change:</strong> {{ lastCheckboxChange | json }}
        </div>
      </form>
    `,
  }),
  args: {
    items: [
      { value: 'javascript', label: 'JavaScript' },
      { value: 'typescript', label: 'TypeScript' },
      { value: 'angular', label: 'Angular' },
      { value: 'react', label: 'React' },
      { value: 'vue', label: 'Vue' },
    ],
  },
};

/**
 * Real-world example: Settings form with multiple sections.
 */
export const SettingsForm: Story = {
  render: (args) => ({
    props: {
      ...args,
      form: new FormGroup({
        notifications: new FormControl<string[]>(['email', 'push']),
        features: new FormControl<string[]>(['darkMode']),
      }),
      notificationItems: [
        { value: 'email', label: 'Email notifications' },
        { value: 'push', label: 'Push notifications' },
        { value: 'sms', label: 'SMS notifications' },
        { value: 'inApp', label: 'In-app notifications' },
      ],
      featureItems: [
        { value: 'darkMode', label: 'Enable dark mode' },
        { value: 'compactView', label: 'Use compact view' },
        { value: 'showTips', label: 'Show helpful tips' },
        { value: 'autoSave', label: 'Auto-save changes' },
      ],
    },
    template: `
      <form [formGroup]="form" style="max-width: 500px;">
        <div style="margin-bottom: 24px;">
          <h3 style="margin-top: 0; margin-bottom: 16px;">Notification Preferences</h3>
          <lib-input-check-group
            formControlName="notifications"
            [items]="notificationItems"
          />
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="margin-top: 0; margin-bottom: 16px;">Feature Preferences</h3>
          <lib-input-check-group
            formControlName="features"
            [items]="featureItems"
          />
        </div>

        <div style="padding: 16px; background: #f5f5f5; border-radius: 4px;">
          <strong>Settings:</strong>
          <pre style="margin-top: 8px;">{{ form.value | json }}</pre>
        </div>
      </form>
    `,
  }),
};
