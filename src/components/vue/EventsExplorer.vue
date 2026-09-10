<script setup lang="ts">
import { computed, ref } from 'vue';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
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

// A sighted user sees the grid itself change as they type; a screen-reader
// user gets no equivalent signal unless something announces it — this is
// that announcement. Empty while there's no query so it stays silent on
// first load and doesn't get read out before anyone's searched for
// anything; `role="status"`/aria-live="polite" so it's spoken without
// moving focus off the search field.
const searchStatus = computed(() => {
  if (!query.value.trim()) return '';
  const count = filteredEvents.value.length;
  if (count === 0) return 'Aún no hay retiros que coincidan con tu búsqueda.';
  return count === 1 ? '1 retiro encontrado.' : `${count} retiros encontrados.`;
});
</script>

<template>
  <div>
    <IconField class="mb-8 block w-full sm:max-w-xs">
      <InputIcon class="pi pi-search" aria-hidden="true" />
      <InputText
        v-model="query"
        placeholder="Buscar retiros o ubicaciones"
        aria-label="Buscar retiros o ubicaciones"
        class="w-full"
      />
      <button
        v-if="query"
        type="button"
        class="p-inputicon pi pi-times cursor-pointer border-0 bg-transparent p-0"
        aria-label="Limpiar búsqueda"
        @click="query = ''"
      />
    </IconField>

    <p class="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {{ searchStatus }}
    </p>

    <p
      v-if="filteredEvents.length === 0"
      class="rounded-xl border border-ink-200 bg-surface p-8 text-center text-ink-600"
    >
      Aún no hay retiros que coincidan con tu búsqueda. Prueba con otra palabra
      clave o ubicación, o
      <button
        type="button"
        class="cursor-pointer underline underline-offset-2"
        @click="query = ''"
      >
        mira todos nuestros retiros</button
      >.
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
