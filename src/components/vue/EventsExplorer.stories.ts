import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import EventsExplorer from './EventsExplorer.vue';

const events = [
  {
    id: 'coastal-vinyasa-week',
    title: 'The Art of Presence',
    summary:
      'A weekend for couples and partners to slow down, drop into breath, and rediscover each other through conscious touch and presence practices.',
    location: 'Ericeira, Portugal',
    startDateLabel: 'September 14–21, 2026',
    earlyBirdPrice: 1590,
    earlyBirdActive: true,
    earlyBirdDeadlineLabel: 'September 1',
    price: 1890,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    tags: ['partner practice', 'breathwork', 'eye gazing'],
  },
  {
    id: 'sierra-silent-retreat',
    title: 'Coming Home to the Body',
    summary:
      'A four-day solo retreat in the mountains for reconnecting with your own body through breath, movement, and unhurried stillness.',
    location: 'Sierra Nevada, California',
    startDateLabel: 'October 8–12, 2026',
    earlyBirdPrice: 1190,
    earlyBirdActive: true,
    earlyBirdDeadlineLabel: 'September 8',
    price: 1450,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
    tags: ['solo journey', 'embodiment', 'breathwork'],
  },
  {
    id: 'somatic-reset-weekend',
    title: 'Somatic Reset Weekend',
    summary:
      'A two-day intensive in conscious touch, cold exposure, and nervous-system regulation.',
    location: 'Catskills, New York',
    startDateLabel: 'November 6–8, 2026',
    earlyBirdPrice: 520,
    earlyBirdActive: false,
    earlyBirdDeadlineLabel: 'October 6',
    price: 620,
    currency: 'USD',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    tags: ['somatics', 'conscious touch', 'nervous system'],
  },
];

const meta: Meta<typeof EventsExplorer> = {
  title: 'Components/EventsExplorer',
  component: EventsExplorer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { events },
};
export default meta;

type Story = StoryObj<typeof EventsExplorer>;

export const Default: Story = {};

export const Empty: Story = {
  args: { events: [] },
};

export const FilteredBySearch: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const search = canvas.getByPlaceholderText('Search retreats or locations');
    await userEvent.type(search, 'sierra');
    await expect(
      canvas.getByText('Coming Home to the Body'),
    ).toBeInTheDocument();
    await expect(
      canvas.queryByText('The Art of Presence'),
    ).not.toBeInTheDocument();
  },
};
