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
    subject: 'Interés: Volver al Cuerpo',
    initialMessage: 'Me gustaría unirme a Volver al Cuerpo.',
  },
};

export const FilledOut: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByLabelText('Nombre'), 'Jordan Lee');
    await userEvent.type(
      canvas.getByLabelText('Correo electrónico'),
      'jordan@example.com',
    );
    await userEvent.type(
      canvas.getByLabelText('Mensaje'),
      '¿Hay cupo para uno más en octubre?',
    );
    await expect(canvas.getByLabelText('Nombre')).toHaveValue('Jordan Lee');
  },
};
