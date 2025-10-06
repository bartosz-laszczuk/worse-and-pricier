import { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  component: ButtonComponent,
  title: 'Components/Buttons/Button',
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'dark', 'light', 'icon'],
      description: 'The visual style of the button',
      defaultValue: 'default',
    },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Default: Story = {
  args: {
    type: 'default',
  },
  render: (args) => ({
    props: args,
    template: `<lib-button [type]="type">Default Button</lib-button>`,
  }),
};

export const Dark: Story = {
  args: {
    type: 'dark',
  },
  render: (args) => ({
    props: args,
    template: `<lib-button [type]="type">Dark Button</lib-button>`,
  }),
};

export const Light: Story = {
  args: {
    type: 'light',
  },
  render: (args) => ({
    props: args,
    template: `<lib-button [type]="type">Light Button</lib-button>`,
  }),
};

export const Icon: Story = {
  args: {
    type: 'icon',
  },
  render: (args) => ({
    props: args,
    template: `<lib-button [type]="type">Icon Button</lib-button>`,
  }),
};
