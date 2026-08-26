import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import EventCard from './EventCard.vue';

const meta: Meta<typeof EventCard> = {
  title: 'Components/EventCard',
  component: EventCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: {
    event: {
      id: 'sierra-silent-retreat',
      title: 'Volver al Cuerpo',
      summary:
        'Un retiro individual de cuatro días en la montaña para reconectar con tu propio cuerpo a través de la respiración, el movimiento y la quietud sin apuro.',
      location: 'Sierra Nevada, California',
      startDateLabel: '8–12 de octubre de 2026',
      earlyBirdPrice: 1130000,
      earlyBirdActive: true,
      earlyBirdDeadlineLabel: '8 de septiembre',
      price: 1380000,
      currency: 'CLP',
      image:
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
      imageWidth: 1200,
      imageHeight: 800,
      tags: ['viaje en solitario', 'corporalidad', 'respiración'],
    },
  },
};
export default meta;

type Story = StoryObj<typeof EventCard>;

export const EarlyBirdActive: Story = {};

export const EarlyBirdExpired: Story = {
  args: {
    event: {
      ...meta.args!.event,
      earlyBirdActive: false,
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The struck-through early-bird price only makes sense once it's
    // actually active — once it's expired only the regular price shows.
    await expect(canvas.getByText('$1.380.000')).toBeInTheDocument();
    await expect(canvas.queryByText('$1.130.000')).not.toBeInTheDocument();
  },
};
