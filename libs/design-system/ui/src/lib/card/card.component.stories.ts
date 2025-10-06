import { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  component: CardComponent,
  title: 'Components/Card',
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <lib-card>
        <h3>Card Title</h3>
        <p>This is a card component with some content inside.</p>
      </lib-card>
    `,
  }),
};

export const WithMultipleElements: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <lib-card>
        <h2>Question Management</h2>
        <p>Manage your interview questions and categories.</p>
        <button>Get Started</button>
      </lib-card>
    `,
  }),
};
