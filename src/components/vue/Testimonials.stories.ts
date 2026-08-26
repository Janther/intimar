import type { Meta, StoryObj } from '@storybook/vue3-vite';
import Testimonials from './Testimonials.vue';

const meta: Meta<typeof Testimonials> = {
  title: 'Components/Testimonials',
  component: Testimonials,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Testimonials>;

export const Default: Story = {
  args: {
    testimonials: [
      {
        quote:
          'For the first time in years, my partner and I really slowed down and looked at each other. That weekend changed how we touch, period.',
        name: 'Priya N.',
        event: 'The Art of Presence',
      },
      {
        quote:
          "I came home to parts of my body I'd been avoiding for years. No pressure, just presence.",
        name: 'Daniel W.',
        event: 'Coming Home to the Body',
      },
      {
        quote:
          "Theo's cooking sessions alone were worth the trip. I still make the sourdough at home.",
        name: 'Marisol A.',
        event: 'Kitchen & Craft Immersion',
      },
    ],
  },
};

export const SingleTestimonial: Story = {
  args: {
    testimonials: [
      {
        quote: 'Exactly what I needed.',
        name: 'Daniel W.',
        event: 'Coming Home to the Body',
      },
    ],
  },
};
