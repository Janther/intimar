<script setup lang="ts">
import Carousel from 'primevue/carousel';

interface Testimonial {
  quote: string;
  name: string;
  event: string;
}

defineProps<{ testimonials: Testimonial[] }>();
</script>

<template>
  <Carousel
    :value="testimonials"
    :num-visible="1"
    :num-scroll="1"
    :show-navigators="testimonials.length > 1"
    :show-indicators="testimonials.length > 1"
    circular
    :autoplay-interval="6000"
  >
    <template #item="{ data }">
      <figure class="mx-auto max-w-2xl px-4 py-10 text-center">
        <blockquote
          class="font-confession text-lg leading-relaxed text-ink-900 sm:text-xl"
        >
          “{{ data.quote }}”
        </blockquote>
        <figcaption class="mt-4 text-sm text-ink-600">
          {{ data.name }} · {{ data.event }}
        </figcaption>
      </figure>
    </template>
  </Carousel>
</template>
