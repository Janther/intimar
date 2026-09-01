import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import ShareButtons from './ShareButtons.vue';

const meta: Meta<typeof ShareButtons> = {
  title: 'Components/ShareButtons',
  component: ShareButtons,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    title: 'Volver al Cuerpo',
    url: 'https://intimar.life/events/sierra-silent-retreat/',
  },
};
export default meta;

type Story = StoryObj<typeof ShareButtons>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The native-share button only appears post-mount and only when the
    // browser supports it (see the component's onMounted guard) — the
    // headless test browser doesn't, so it's deliberately not asserted
    // on here. Copy-link's confirmation state isn't asserted either:
    // Vitest's browser-mode test iframe doesn't propagate clipboard
    // permissions to the nested frame, so navigator.clipboard.writeText()
    // rejects here regardless of the component's own behavior — clicking
    // it manually in the Storybook UI (a real top-level tab) still
    // demonstrates the copied-confirmation state.
    await expect(
      canvas.getByRole('link', { name: 'Compartir en WhatsApp' }),
    ).toHaveAttribute('href', expect.stringContaining('https://wa.me/?text='));
    await expect(
      canvas.getByRole('link', { name: 'Compartir por correo' }),
    ).toHaveAttribute('href', expect.stringContaining('mailto:?subject='));
  },
};
