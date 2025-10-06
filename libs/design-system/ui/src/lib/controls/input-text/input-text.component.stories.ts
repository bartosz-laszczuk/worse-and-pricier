import { Meta, StoryObj } from '@storybook/angular';
import { InputTextComponent } from './input-text.component';

const meta: Meta<InputTextComponent> = {
  component: InputTextComponent,
  title: 'Components/Controls/Input Text',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<InputTextComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <lib-input-text
        label="Username"
        placeholder="Enter your username"
      />
    `,
  }),
};

export const WithValue: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <lib-input-text
        label="Email"
        placeholder="Enter your email"
        [value]="'user@example.com'"
      />
    `,
  }),
};

export const Required: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <lib-input-text
        label="Password"
        type="password"
        placeholder="Enter your password"
        [required]="true"
      />
    `,
  }),
};
