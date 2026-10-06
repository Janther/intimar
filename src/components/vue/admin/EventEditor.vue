<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import EventCard from '../EventCard.vue';
import {
  ADMIN_CONFIG,
  BRANCH_PREFIX,
  EVENTS_DIR,
  EVENT_IMAGES_DIR,
} from '../../../lib/admin/config';
import {
  emptyEvent,
  serializeEvent,
  slugify,
  toPreviewSummary,
  validateEvent,
  type EventErrors,
  type EventFile,
} from '../../../lib/admin/event-file';
import {
  resizeImageToBase64,
  type FileToCommit,
  type GitHubClient,
  type RepoEvent,
} from '../../../lib/admin/github';

const props = defineProps<{
  client: GitHubClient;
  login: string;
  hosts: { id: string; name: string }[];
  existingIds: string[];
  initial: RepoEvent | null;
}>();
const emit = defineEmits<{ done: [url: string]; cancel: [] }>();

const isNew = props.initial === null;
// A deep copy so cancelling leaves the list untouched. Via JSON because
// props.initial is a Vue reactive proxy, which structuredClone rejects.
const event = reactive<EventFile>(
  props.initial
    ? (JSON.parse(JSON.stringify(props.initial.data)) as EventFile)
    : emptyEvent(),
);
const hasEarlyBird = ref(event.earlyBirdPrice !== undefined);
const tagsText = ref(event.tags.join(', '));
const imageFile = ref<File | null>(null);
const newImageUrl = ref('');
const errors = ref<EventErrors>({});
const saving = ref(false);
const failure = ref('');
// Errors only appear after the first "Enviar" — from then on they update
// as the editor types, so a fixed field stops showing its message.
const attempted = ref(false);

// New events take their id (and URL) from the title; existing ones keep
// theirs so links already shared don't break.
watch(
  () => event.title,
  (title) => {
    if (isNew) event.id = slugify(title);
  },
);
watch(tagsText, (text) => {
  event.tags = text
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);
});
watch(hasEarlyBird, (on) => {
  if (!on) {
    delete event.earlyBirdPrice;
    delete event.earlyBirdDeadline;
  } else if (event.earlyBirdPrice === undefined) {
    event.earlyBirdPrice = 0;
  }
});

function onImage(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0] ?? null;
  imageFile.value = file;
  if (newImageUrl.value) URL.revokeObjectURL(newImageUrl.value);
  newImageUrl.value = file ? URL.createObjectURL(file) : '';
}
onBeforeUnmount(() => {
  if (newImageUrl.value) URL.revokeObjectURL(newImageUrl.value);
});

// Without its own photo an event shows the site's default image, so the
// preview does too.
const currentImageUrl = computed(() => {
  if (newImageUrl.value) return newImageUrl.value;
  const path = event.image
    ? event.image.replace(/^\.\.\//, 'src/data/')
    : `${EVENT_IMAGES_DIR}/default.jpg`;
  return `https://raw.githubusercontent.com/${ADMIN_CONFIG.owner}/${ADMIN_CONFIG.repo}/${ADMIN_CONFIG.baseBranch}/${path}`;
});
const preview = computed(() => toPreviewSummary(event, currentImageUrl.value));

function collectErrors(): EventErrors {
  const found = validateEvent(event);
  if (isNew && props.existingIds.includes(event.id)) {
    found.title = 'Ya existe un evento con este título. Usa otro.';
  }
  return found;
}

watch([event, currentImageUrl], () => {
  if (attempted.value) errors.value = collectErrors();
});

async function submit() {
  failure.value = '';
  attempted.value = true;
  errors.value = collectErrors();
  if (Object.keys(errors.value).length > 0) return;

  saving.value = true;
  try {
    const files: FileToCommit[] = [];
    if (imageFile.value) {
      files.push({
        path: `${EVENT_IMAGES_DIR}/${event.id}.jpg`,
        content: await resizeImageToBase64(imageFile.value),
        encoding: 'base64',
      });
      event.image = `../images/events/${event.id}.jpg`;
    }
    files.push({
      path: `${EVENTS_DIR}/${event.id}.json`,
      content: serializeEvent(event),
      encoding: 'utf-8',
    });
    const url = await props.client.openChange({
      branchName: `${BRANCH_PREFIX}${event.id}-${Date.now()}`,
      title: `${isNew ? 'Nuevo evento' : 'Editar evento'}: ${event.title}`,
      body: `Enviado desde el panel de administración por @${props.login}.`,
      files,
    });
    emit('done', url);
  } catch (e) {
    failure.value = e instanceof Error ? e.message : String(e);
  } finally {
    saving.value = false;
  }
}

const input =
  'mt-1 w-full rounded-md border border-ink-300 bg-surface px-3 py-2 text-ink-900 focus:border-terracotta-500 focus:outline-none';
</script>

<template>
  <form
    class="grid gap-10 lg:grid-cols-[1fr_22rem]"
    novalidate
    @submit.prevent="submit"
  >
    <div class="flex flex-col gap-5">
      <h2 class="font-serif text-2xl text-ink-900">
        {{ isNew ? 'Nuevo evento' : `Editar: ${initial?.data.title}` }}
      </h2>

      <label class="text-sm font-medium text-ink-800">
        Título
        <input v-model="event.title" :class="input" type="text" />
        <span v-if="isNew && event.id" class="mt-1 block text-xs text-ink-600">
          Dirección: /events/{{ event.id }}
        </span>
        <span
          v-if="errors.title || errors.id"
          class="mt-1 block text-xs text-error"
        >
          {{ errors.title ?? errors.id }}
        </span>
      </label>

      <label class="text-sm font-medium text-ink-800">
        Resumen corto (aparece en la tarjeta)
        <textarea v-model="event.summary" :class="input" rows="2" />
        <span v-if="errors.summary" class="mt-1 block text-xs text-error">{{
          errors.summary
        }}</span>
      </label>

      <label class="text-sm font-medium text-ink-800">
        Descripción
        <textarea v-model="event.description" :class="input" rows="10" />
        <span class="mt-1 block text-xs text-ink-600">
          Deja una línea en blanco entre párrafos.
        </span>
        <span v-if="errors.description" class="mt-1 block text-xs text-error">
          {{ errors.description }}
        </span>
      </label>

      <label class="text-sm font-medium text-ink-800">
        Lugar
        <input
          v-model="event.location"
          :class="input"
          type="text"
          placeholder="Bosque Místico, Pirque"
        />
        <span v-if="errors.location" class="mt-1 block text-xs text-error">{{
          errors.location
        }}</span>
      </label>

      <div class="grid gap-5 sm:grid-cols-2">
        <label class="text-sm font-medium text-ink-800">
          Fecha de inicio
          <input v-model="event.startDate" :class="input" type="date" />
          <span v-if="errors.startDate" class="mt-1 block text-xs text-error">{{
            errors.startDate
          }}</span>
        </label>
        <label class="text-sm font-medium text-ink-800">
          Fecha de término
          <input v-model="event.endDate" :class="input" type="date" />
          <span v-if="errors.endDate" class="mt-1 block text-xs text-error">{{
            errors.endDate
          }}</span>
        </label>
      </div>

      <label class="text-sm font-medium text-ink-800">
        Precio (CLP)
        <input
          v-model.number="event.price"
          :class="input"
          type="number"
          min="0"
          step="1000"
        />
        <span v-if="errors.price" class="mt-1 block text-xs text-error">{{
          errors.price
        }}</span>
      </label>

      <label class="flex items-center gap-2 text-sm font-medium text-ink-800">
        <input v-model="hasEarlyBird" type="checkbox" />
        Tiene precio early bird
      </label>
      <div v-if="hasEarlyBird" class="grid gap-5 sm:grid-cols-2">
        <label class="text-sm font-medium text-ink-800">
          Precio early bird (CLP)
          <input
            v-model.number="event.earlyBirdPrice"
            :class="input"
            type="number"
            min="0"
            step="1000"
          />
          <span
            v-if="errors.earlyBirdPrice"
            class="mt-1 block text-xs text-error"
          >
            {{ errors.earlyBirdPrice }}
          </span>
        </label>
        <label class="text-sm font-medium text-ink-800">
          Early bird hasta
          <input v-model="event.earlyBirdDeadline" :class="input" type="date" />
          <span
            v-if="errors.earlyBirdDeadline"
            class="mt-1 block text-xs text-error"
          >
            {{ errors.earlyBirdDeadline }}
          </span>
        </label>
      </div>

      <fieldset class="text-sm font-medium text-ink-800">
        <legend>Facilitadores</legend>
        <div class="mt-2 flex flex-wrap gap-4">
          <label
            v-for="host in hosts"
            :key="host.id"
            class="flex items-center gap-2 font-normal"
          >
            <input v-model="event.hostIds" type="checkbox" :value="host.id" />
            {{ host.name }}
          </label>
        </div>
        <span v-if="errors.hostIds" class="mt-1 block text-xs text-error">{{
          errors.hostIds
        }}</span>
      </fieldset>

      <label class="text-sm font-medium text-ink-800">
        Etiquetas (separadas por comas)
        <input
          v-model="tagsText"
          :class="input"
          type="text"
          placeholder="erotismo consciente, solo o en pareja"
        />
      </label>

      <label class="text-sm font-medium text-ink-800">
        Foto (opcional)
        <input :class="input" type="file" accept="image/*" @change="onImage" />
        <span class="mt-1 block text-xs text-ink-600">
          {{
            event.image || imageFile
              ? 'Sube otra solo si quieres cambiarla.'
              : 'Si no subes una, el evento usa la imagen de Intimar por defecto.'
          }}
        </span>
      </label>

      <div
        class="flex flex-col gap-2 rounded-lg bg-ink-100 p-4 text-sm text-ink-800"
      >
        <label class="flex items-center gap-2">
          <input v-model="event.published" type="checkbox" />
          Publicado (visible en el sitio)
        </label>
        <label class="flex items-center gap-2">
          <input v-model="event.featured" type="checkbox" />
          Destacado en la página de inicio
        </label>
      </div>

      <p
        v-if="failure"
        class="rounded-md bg-terracotta-50 p-3 text-sm text-error"
        role="alert"
      >
        No se pudo enviar: {{ failure }}
      </p>

      <div class="flex gap-3">
        <button
          type="submit"
          :disabled="saving"
          class="rounded-md bg-terracotta-500 px-5 py-2.5 font-medium text-white transition hover:bg-terracotta-700 disabled:opacity-60"
        >
          {{ saving ? 'Enviando…' : 'Enviar a revisión' }}
        </button>
        <button
          type="button"
          class="rounded-md px-4 py-2.5 text-ink-700 hover:text-ink-900"
          @click="emit('cancel')"
        >
          Cancelar
        </button>
      </div>
    </div>

    <aside class="lg:sticky lg:top-28 lg:self-start">
      <p class="mb-2 text-sm font-medium text-ink-600">
        Así se verá la tarjeta
      </p>
      <div class="pointer-events-none">
        <EventCard :event="preview" />
      </div>
    </aside>
  </form>
</template>
