<script setup lang="ts">
import { withBase } from '../../lib/site';
import Tag from './Tag.vue';
import type { EventSummary } from '../../lib/data';

defineProps<{ event: EventSummary }>();

// Not imported from lib/data.ts: that file's top-level `astro:content`
// import has no client-side resolution, and this component is nested
// inside EventsExplorer.vue's hydrated (client:load) island, so it gets
// bundled for the browser — pulling that import in would break the build.
function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
</script>

<template>
  <a
    :href="withBase(`/events/${event.id}`)"
    class="group flex flex-col overflow-hidden rounded-2xl border border-ink-200 bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-md"
  >
    <div class="aspect-[4/3] overflow-hidden">
      <img
        :src="event.image"
        :width="event.imageWidth"
        :height="event.imageHeight"
        :alt="event.title"
        loading="lazy"
        decoding="async"
        class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      />
    </div>
    <div class="flex flex-1 flex-col gap-2 p-5">
      <div class="flex flex-wrap gap-1.5">
        <Tag v-for="tag in event.tags.slice(0, 3)" :key="tag">{{ tag }}</Tag>
      </div>
      <h3 class="font-serif text-lg text-ink-900">{{ event.title }}</h3>
      <p class="line-clamp-2 text-sm text-ink-700">{{ event.summary }}</p>
      <div
        class="mt-auto flex items-center justify-between pt-3 text-sm text-ink-muted"
      >
        <span>{{ event.location }}</span>
        <span v-if="event.earlyBirdActive" class="flex items-baseline gap-1.5">
          <span class="font-medium text-ink-900">{{
            formatPrice(event.earlyBirdPrice, event.currency)
          }}</span>
          <span class="text-xs text-ink-muted line-through">{{
            formatPrice(event.price, event.currency)
          }}</span>
        </span>
        <span v-else class="font-medium text-ink-900">{{
          formatPrice(event.price, event.currency)
        }}</span>
      </div>
      <p
        v-if="event.earlyBirdActive"
        class="text-xs font-medium text-accent-gold-text"
      >
        Early bird hasta el {{ event.earlyBirdDeadlineLabel }}
      </p>
      <p class="text-xs text-ink-muted">{{ event.startDateLabel }}</p>
    </div>
  </a>
</template>
