<script setup lang="ts">
import { computed, ref } from 'vue';
import InputText from 'primevue/inputtext';
import MultiSelect from 'primevue/multiselect';
import EventCard from './EventCard.vue';
import type { EventSummary } from '../../lib/data';

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
      <EventCard
        v-for="event in filteredEvents"
        :key="event.id"
        :event="event"
      />
    </div>
  </div>
</template>
