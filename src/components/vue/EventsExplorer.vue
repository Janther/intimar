<script setup lang="ts">
import { computed, ref } from 'vue';
import InputText from 'primevue/inputtext';
import EventCard from './EventCard.vue';
import type { EventSummary } from '../../lib/data';

const props = defineProps<{ events: EventSummary[] }>();

const query = ref('');

const filteredEvents = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (q.length === 0) return props.events;
  return props.events.filter(
    (event) =>
      event.title.toLowerCase().includes(q) ||
      event.location.toLowerCase().includes(q) ||
      event.summary.toLowerCase().includes(q),
  );
});
</script>

<template>
  <div>
    <span class="p-input-icon-left mb-8 block w-full sm:max-w-xs">
      <InputText
        v-model="query"
        placeholder="Buscar retiros o ubicaciones"
        class="w-full"
      />
    </span>

    <p
      v-if="filteredEvents.length === 0"
      class="rounded-xl border border-ink-200 bg-surface p-8 text-center text-ink-600"
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
