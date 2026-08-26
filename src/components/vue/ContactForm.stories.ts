import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import ContactForm from './ContactForm.vue';

const meta: Meta<typeof ContactForm> = {
  title: 'Components/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof ContactForm>;

export const Default: Story = {};

export const PrefilledForEvent: Story = {
  args: {
    subject: 'Interest: Coming Home to the Body',
    initialMessage: "I'd like to join Coming Home to the Body.",
  },
};

export const FilledOut: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Name'), 'Jordan Lee');
    await userEvent.type(canvas.getByLabelText('Email'), 'jordan@example.com');
    await userEvent.type(
      canvas.getByLabelText('Message'),
      'Is there room for one more in October?',
    );
    await expect(canvas.getByLabelText('Name')).toHaveValue('Jordan Lee');
  },
};
