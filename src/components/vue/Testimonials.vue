<script setup lang="ts">
import { onMounted, ref } from 'vue';
import Carousel from 'primevue/carousel';

interface Testimonial {
  id: string;
  quote: string;
  name: string;
  event: string;
}

defineProps<{ testimonials: Testimonial[] }>();

const AUTOPLAY_INTERVAL_MS = 6000;
// Quotes past this length reliably overflow the blockquote's clamped 4
// lines at the carousel's max-w-2xl width, so only those get a "Ver más"
// toggle — a length check avoids measuring scrollHeight client-side just
// to decide whether the button should render.
const QUOTE_TRUNCATE_LENGTH = 220;

// `window.matchMedia` doesn't exist during Astro's server render, so (same
// SSR-safe pattern as ShareButtons.vue) this starts at the value the server
// rendered — autoplay on — and only adjusts in `onMounted` (client-only,
// post-hydration), avoiding a hydration mismatch between server and first
// client render.
const autoplayInterval = ref(AUTOPLAY_INTERVAL_MS);
const isPaused = ref(false);
const carousel = ref<InstanceType<typeof Carousel> | null>(null);

// Keyed by testimonial id rather than a single boolean so expanding one
// quote doesn't affect others, and the state survives navigating the
// carousel away and back.
const expandedIds = ref(new Set<string>());

function needsTruncation(quote: string): boolean {
  return quote.length > QUOTE_TRUNCATE_LENGTH;
}

function toggleExpanded(id: string) {
  const next = new Set(expandedIds.value);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
    // Expanding a quote can make it take well longer than the autoplay
    // interval to read — pause so it doesn't rotate away mid-read.
    if (!isPaused.value) {
      isPaused.value = true;
      autoplayInterval.value = 0;
    }
  }
  expandedIds.value = next;
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Setting the prop to 0 here runs before the Carousel's own first
    // autoplay interval could ever fire (it's a 6s timer started during the
    // same mount pass), so this never visibly auto-advances for a
    // reduced-motion visitor — it just never starts, same as `isPaused`.
    isPaused.value = true;
    autoplayInterval.value = 0;
  }
});

// PrimeVue's Carousel stops its own interval reactively when
// `autoplay-interval` drops to 0 (see its `autoplayInterval` prop watcher),
// but doesn't restart one on its own when the prop goes back up — resuming
// needs an explicit `startAutoplay()` call on the component instance,
// which Vue exposes here via the template ref since Carousel doesn't
// restrict `expose`.
function togglePaused() {
  isPaused.value = !isPaused.value;
  if (isPaused.value) {
    autoplayInterval.value = 0;
  } else {
    autoplayInterval.value = AUTOPLAY_INTERVAL_MS;
    carousel.value?.startAutoplay();
  }
}
</script>

<template>
  <div>
    <Carousel
      ref="carousel"
      :value="testimonials"
      :num-visible="1"
      :num-scroll="1"
      :show-navigators="testimonials.length > 1"
      :show-indicators="testimonials.length > 1"
      circular
      :autoplay-interval="autoplayInterval"
    >
      <template #item="{ data }">
        <figure class="mx-auto max-w-2xl px-4 py-10 text-center">
          <blockquote
            class="font-confession text-lg leading-relaxed text-ink-900 sm:text-xl"
            :class="{
              'line-clamp-4':
                needsTruncation(data.quote) && !expandedIds.has(data.id),
            }"
          >
            “{{ data.quote }}”
          </blockquote>
          <button
            v-if="needsTruncation(data.quote)"
            type="button"
            class="mt-2 text-sm font-medium text-ink-600 underline decoration-ink-300 underline-offset-2 transition hover:text-terracotta-600"
            :aria-expanded="expandedIds.has(data.id)"
            @click="toggleExpanded(data.id)"
          >
            {{ expandedIds.has(data.id) ? 'Ver menos' : 'Ver más' }}
          </button>
          <figcaption class="mt-4 text-sm text-ink-600">
            {{ data.name }} · {{ data.event }}
          </figcaption>
        </figure>
      </template>
    </Carousel>
    <div v-if="testimonials.length > 1" class="flex justify-center pb-6">
      <button
        type="button"
        class="flex items-center gap-2 rounded-full border border-ink-200 px-3 py-1.5 text-xs text-ink-700 transition hover:border-terracotta-500 hover:text-terracotta-600"
        :aria-label="
          isPaused
            ? 'Reanudar el carrusel de testimonios'
            : 'Pausar el carrusel de testimonios'
        "
        :aria-pressed="isPaused"
        @click="togglePaused"
      >
        <span
          :class="isPaused ? 'pi pi-play' : 'pi pi-pause'"
          aria-hidden="true"
        />
        {{ isPaused ? 'Reanudar' : 'Pausar' }}
      </button>
    </div>
  </div>
</template>
