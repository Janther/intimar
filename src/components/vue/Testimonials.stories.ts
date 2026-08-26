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
          'Por primera vez en años, mi pareja y yo realmente bajamos el ritmo y nos miramos. Ese fin de semana cambió la forma en que nos tocamos, punto.',
        name: 'Priya N.',
        event: 'El Arte de la Presencia',
      },
      {
        quote:
          'Volví a partes de mi cuerpo que había estado evitando por años. Sin presión, solo presencia.',
        name: 'Daniel W.',
        event: 'Volver al Cuerpo',
      },
      {
        quote:
          'Cada comida se sentía parte de la práctica, no una pausa de ella. Todavía cocino más despacio por esa semana.',
        name: 'Marisol A.',
        event: 'Inmersión de Cocina y Oficio',
      },
    ],
  },
};

export const SingleTestimonial: Story = {
  args: {
    testimonials: [
      {
        quote: 'Justo lo que necesitaba.',
        name: 'Daniel W.',
        event: 'Volver al Cuerpo',
      },
    ],
  },
};
