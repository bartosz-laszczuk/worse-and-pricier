import { Meta, StoryObj } from '@storybook/angular';
import { ButtonIconComponent } from './button-icon.component';

const meta: Meta<ButtonIconComponent> = {
  component: ButtonIconComponent,
  title: 'Components/Buttons/Button Icon',
  argTypes: {
    type: {
      control: 'select',
      options: ['default', 'dark', 'light', 'icon'],
      description: 'The visual style of the button',
    },
  },
};

export default meta;
type Story = StoryObj<ButtonIconComponent>;

export const Default: Story = {
  args: {
    type: 'default',
    icon: 'edit',
  },
  render: (args) => ({
    props: args,
    template: `
      <lib-button-icon [type]="type" [icon]="icon" />
    `,
  }),
};

export const Dark: Story = {
  args: {
    type: 'dark',
    icon: 'arrow-left',
  },
  render: (args) => ({
    props: args,
    template: `
      <lib-button-icon [type]="type" [icon]="icon" />
    `,
  }),
};

export const Light: Story = {
  args: {
    type: 'light',
    icon: 'eye',
  },
  render: (args) => ({
    props: args,
    template: `
      <lib-button-icon [type]="type" [icon]="icon" />
    `,
  }),
};
