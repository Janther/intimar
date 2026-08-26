import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { userEvent, within } from 'storybook/test';
import InterestDialog from './InterestDialog.vue';

const meta: Meta<typeof InterestDialog> = {
  title: 'Components/InterestDialog',
  component: InterestDialog,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    eventTitle: 'Coming Home to the Body',
  },
};
export default meta;

type Story = StoryObj<typeof InterestDialog>;

export const Closed: Story = {};

export const Open: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole('button', { name: /request to join/i }),
    );
  },
};
