import { Meta, StoryObj } from '@storybook/angular';
import { InputCheckComponent } from './input-check.component';

const meta: Meta<InputCheckComponent> = {
  component: InputCheckComponent,
  title: 'Components/Controls/Input Check',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<InputCheckComponent>;

/**
 * Default checkbox component showing the basic appearance.
 */
export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <lib-input-check />
    `,
  }),
};

/**
 * Multiple checkbox instances demonstrating the component layout.
 */
export const Multiple: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <lib-input-check />
        <lib-input-check />
        <lib-input-check />
      </div>
    `,
  }),
};

/**
 * Example showing checkboxes in a vertical stack layout.
 * This demonstrates how the component appears in a form-like context.
 */
export const InFormLayout: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div style="padding: 20px; background: #f5f5f5; border-radius: 8px;">
        <h3 style="margin-top: 0; margin-bottom: 16px;">Preferences</h3>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <lib-input-check />
          <lib-input-check />
          <lib-input-check />
          <lib-input-check />
        </div>
      </div>
    `,
  }),
};
