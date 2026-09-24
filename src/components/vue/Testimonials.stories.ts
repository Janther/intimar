import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
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
        id: 'priya-n',
        quote:
          'Por primera vez en años, mi pareja y yo realmente bajamos el ritmo y nos miramos. Ese fin de semana cambió la forma en que nos tocamos, punto.',
        name: 'Priya N.',
        event: 'El Arte de la Presencia',
      },
      {
        id: 'daniel-w',
        quote:
          'Volví a partes de mi cuerpo que había estado evitando por años. Sin presión, solo presencia.',
        name: 'Daniel W.',
        event: 'Volver al Cuerpo',
      },
      {
        id: 'marisol-a',
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
        id: 'daniel-w',
        quote: 'Justo lo que necesitaba.',
        name: 'Daniel W.',
        event: 'Volver al Cuerpo',
      },
    ],
  },
};

export const LongQuoteExpandsOnVerMas: Story = {
  args: {
    testimonials: [
      {
        id: 'a-n',
        quote:
          'En un proceso de duelo interno, haber participado en los talleres me ayudó a conectar conmigo misma, a reflexionar sobre los límites sanos, a explorar mis incomodidades internas. Se formó un ambiente muy respetuoso de diálogo y los guías de las experiencias son muy cuidadosos de entregar claramente las instrucciones para participar. Es altamente recomendable para personas que están navegando por momentos difíciles o simplemente quieren explorar cosas nuevas.',
        name: 'A. N.',
        event: 'Intimar 2026',
      },
    ],
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const toggle = canvas.getByRole('button', { name: 'Ver más' });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(toggle);
    await expect(
      canvas.getByRole('button', { name: 'Ver menos' }),
    ).toHaveAttribute('aria-expanded', 'true');
  },
};
