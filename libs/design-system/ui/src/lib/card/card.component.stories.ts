import { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  component: CardComponent,
  title: 'Components/Card',
  tags: ['autodocs'],
  argTypes: {
    title: {
      control: 'text',
      description: 'Optional title displayed at the top of the card',
    },
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  args: {
    title: 'Card Title',
  },
  render: (args) => ({
    props: args,
    template: `
      <lib-card [title]="title">
        <p>This is a card component with some content inside.</p>
      </lib-card>
    `,
  }),
};

export const WithMultipleElements: Story = {
  args: {
    title: 'Question Management',
  },
  render: (args) => ({
    props: args,
    template: `
      <lib-card [title]="title">
        <p>Manage your interview questions and categories.</p>
        <button>Get Started</button>
      </lib-card>
    `,
  }),
};

export const WithoutTitle: Story = {
  args: {},
  render: (args) => ({
    props: args,
    template: `
      <lib-card>
        <p>This is a card without a title.</p>
        <p>The header and divider are not rendered when no title is provided.</p>
      </lib-card>
    `,
  }),
};
