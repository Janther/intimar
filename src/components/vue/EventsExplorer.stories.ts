import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import EventsExplorer from './EventsExplorer.vue';

const events = [
  {
    id: 'coastal-vinyasa-week',
    title: 'El Arte de la Presencia',
    summary:
      'Un fin de semana para que parejas bajen el ritmo, se adentren en la respiración y se redescubran a través del contacto consciente y las prácticas de presencia.',
    location: 'Ericeira, Portugal',
    startDateLabel: '14–21 de septiembre de 2026',
    earlyBirdPrice: 1510000,
    earlyBirdActive: true,
    earlyBirdDeadlineLabel: '1 de septiembre',
    price: 1790000,
    currency: 'CLP',
    image:
      'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1200&q=80',
    tags: ['práctica en pareja', 'respiración', 'mirada compartida'],
  },
  {
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
    tags: ['viaje en solitario', 'corporalidad', 'respiración'],
  },
  {
    id: 'somatic-reset-weekend',
    title: 'Fin de Semana de Reset Somático',
    summary:
      'Una intensiva de dos días en contacto consciente, exposición al frío y regulación del sistema nervioso.',
    location: 'Catskills, Nueva York',
    startDateLabel: '6–8 de noviembre de 2026',
    earlyBirdPrice: 490000,
    earlyBirdActive: false,
    earlyBirdDeadlineLabel: '6 de octubre',
    price: 590000,
    currency: 'CLP',
    image:
      'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1200&q=80',
    tags: ['somática', 'contacto consciente', 'sistema nervioso'],
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
    const search = canvas.getByPlaceholderText('Buscar retiros o ubicaciones');
    await userEvent.type(search, 'sierra');
    await expect(canvas.getByText('Volver al Cuerpo')).toBeInTheDocument();
    await expect(
      canvas.queryByText('El Arte de la Presencia'),
    ).not.toBeInTheDocument();
  },
};
