import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import Tag from './Tag.vue';

const meta: Meta<typeof Tag> = {
  title: 'Components/Tag',
  component: Tag,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
};
export default meta;

type Story = StoryObj<typeof Tag>;

export const Default: Story = {
  render: () => ({
    components: { Tag },
    template: '<Tag>Respiración</Tag>',
  }),
};

export const LongLabel: Story = {
  render: () => ({
    components: { Tag },
    template: '<Tag>Diseño de Retiros Personalizados</Tag>',
  }),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByText('Diseño de Retiros Personalizados'),
    ).toBeVisible();
  },
};

export const Group: Story = {
  render: () => ({
    components: { Tag },
    // Tags always render several at a time, wrapped inline, on
    // EventCard/TeamCard — this is the shape that actually matters.
    template: `
      <div class="flex flex-wrap gap-1.5">
        <Tag>Respiración</Tag>
        <Tag>Corporalidad</Tag>
        <Tag>Trabajo Energético</Tag>
      </div>
    `,
  }),
};
