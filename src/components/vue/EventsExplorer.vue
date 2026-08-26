<script setup lang="ts">
import { computed, ref } from 'vue';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import Tag from 'primevue/tag';

interface EventSummary {
  id: string;
  title: string;
  summary: string;
  location: string;
  startDateLabel: string;
  earlyBirdPrice: number;
  earlyBirdActive: boolean;
  earlyBirdDeadlineLabel: string;
  price: number;
  currency: string;
  image: string;
  tags: string[];
}

const props = defineProps<{ events: EventSummary[] }>();

const query = ref('');
const selectedTags = ref<string[]>([]);

const allTags = computed(() => {
  const tags = new Set<string>();
  for (const event of props.events) {
    for (const tag of event.tags) tags.add(tag);
  }
  return [...tags].sort();
});

const filteredEvents = computed(() => {
  const q = query.value.trim().toLowerCase();
  return props.events.filter((event) => {
    const matchesQuery =
      q.length === 0 ||
      event.title.toLowerCase().includes(q) ||
      event.location.toLowerCase().includes(q) ||
      event.summary.toLowerCase().includes(q);
    const matchesTags =
      selectedTags.value.length === 0 ||
      selectedTags.value.every((tag) => event.tags.includes(tag));
    return matchesQuery && matchesTags;
  });
});

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}
</script>

<template>
  <div>
    <div class="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center">
      <span class="p-input-icon-left w-full sm:max-w-xs">
        <InputText
          v-model="query"
          placeholder="Buscar retiros o ubicaciones"
          class="w-full"
        />
      </span>
      <MultiSelect
        v-model="selectedTags"
        :options="allTags"
        placeholder="Filtrar por enfoque"
        class="w-full sm:w-64"
        display="chip"
      />
    </div>

    <p
      v-if="filteredEvents.length === 0"
      class="rounded-xl border border-brand-200 bg-surface p-8 text-center text-brand-600"
    >
      Aún no hay retiros que coincidan con tu búsqueda.
    </p>

    <div v-else class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <a
        v-for="event in filteredEvents"
        :key="event.id"
        :href="`/events/${event.id}`"
        class="group flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-surface shadow-sm transition hover:-translate-y-1 hover:shadow-md"
      >
        <div class="aspect-[4/3] overflow-hidden">
          <img
            :src="event.image"
            :alt="event.title"
            loading="lazy"
            class="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <div class="flex flex-1 flex-col gap-2 p-5">
          <div class="flex flex-wrap gap-1.5">
            <Tag
              v-for="tag in event.tags.slice(0, 3)"
              :key="tag"
              :value="tag"
              severity="secondary"
            />
          </div>
          <h3 class="font-serif text-lg text-brand-900">{{ event.title }}</h3>
          <p class="line-clamp-2 text-sm text-brand-700">{{ event.summary }}</p>
          <div
            class="mt-auto flex items-center justify-between pt-3 text-sm text-brand-600"
          >
            <span>{{ event.location }}</span>
            <span
              v-if="event.earlyBirdActive"
              class="flex items-baseline gap-1.5"
            >
              <span class="font-medium text-brand-900">{{
                formatPrice(event.earlyBirdPrice, event.currency)
              }}</span>
              <span class="text-xs text-brand-600 line-through">{{
                formatPrice(event.price, event.currency)
              }}</span>
            </span>
            <span v-else class="font-medium text-brand-900">{{
              formatPrice(event.price, event.currency)
            }}</span>
          </div>
          <p
            v-if="event.earlyBirdActive"
            class="text-xs font-medium text-accent-gold-text"
          >
            Early bird hasta el {{ event.earlyBirdDeadlineLabel }}
          </p>
          <p class="text-xs text-brand-500">{{ event.startDateLabel }}</p>
        </div>
      </a>
    </div>
  </div>
</template>
