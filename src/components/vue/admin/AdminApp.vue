<script setup lang="ts">
import { computed, onMounted, ref, shallowRef } from 'vue';
import EventEditor from './EventEditor.vue';
import { isAdminConfigured } from '../../../lib/admin/config';
import {
  GitHubClient,
  SessionExpiredError,
  completeLogin,
  logout,
  startLogin,
  type Change,
  type RepoEvent,
} from '../../../lib/admin/github';
import { formatDateRange } from '../../../lib/format';

defineProps<{ hosts: { id: string; name: string }[] }>();

type View =
  | { name: 'list' }
  | { name: 'edit'; event: RepoEvent | null }
  | { name: 'sent'; url: string };

const configured = isAdminConfigured();
const loading = ref(configured);
const error = ref('');
const client = shallowRef<GitHubClient | null>(null);
const user = ref<{
  login: string;
  name: string | null;
  avatar_url: string;
} | null>(null);
const events = ref<RepoEvent[]>([]);
const changes = ref<Change[]>([]);
const view = ref<View>({ name: 'list' });

const existingIds = computed(() => events.value.map((e) => e.data.id));

async function load() {
  if (!client.value || !user.value) return;
  const [ev, ch] = await Promise.all([
    client.value.listEvents(),
    client.value.listMyChanges(user.value.login),
  ]);
  events.value = ev;
  changes.value = ch;
}

function handleError(e: unknown) {
  if (e instanceof SessionExpiredError) {
    signOut();
    error.value = 'Tu sesión expiró. Vuelve a entrar con GitHub.';
  } else {
    error.value = e instanceof Error ? e.message : String(e);
  }
}

function signOut() {
  logout();
  client.value = null;
  user.value = null;
}

onMounted(async () => {
  if (!configured) return;
  try {
    const token = await completeLogin();
    if (token) {
      const gh = new GitHubClient(token);
      if (!(await gh.canEdit())) {
        logout();
        error.value =
          'Tu cuenta no tiene permiso para editar el sitio. Pídele al equipo que te dé acceso de escritura al repositorio.';
        return;
      }
      client.value = gh;
      user.value = await gh.getUser();
      await load();
    }
  } catch (e) {
    handleError(e);
  } finally {
    loading.value = false;
  }
});

async function backToList() {
  view.value = { name: 'list' };
  try {
    await load();
  } catch (e) {
    handleError(e);
  }
}

function dates(e: RepoEvent) {
  return formatDateRange(new Date(e.data.startDate), new Date(e.data.endDate));
}

const statusClass: Record<Change['status'], string> = {
  'En revisión': 'bg-gold-100 text-gold-800',
  Publicado: 'bg-ink-100 text-ink-800',
  Descartado: 'bg-ink-50 text-ink-600 line-through',
};
</script>

<template>
  <div>
    <p v-if="!configured" class="rounded-lg bg-ink-100 p-4 text-ink-800">
      El panel todavía no está configurado (falta la GitHub App y el Worker de
      inicio de sesión).
    </p>

    <p v-else-if="loading" class="text-ink-700">Cargando…</p>

    <div v-else-if="!user" class="flex flex-col items-start gap-4">
      <p class="text-ink-700">
        Entra con tu cuenta de GitHub para crear o editar eventos. Tus cambios
        quedan en revisión antes de publicarse.
      </p>
      <p v-if="error" class="text-sm text-error" role="alert">{{ error }}</p>
      <button
        type="button"
        class="flex items-center gap-2 rounded-md bg-ink-900 px-5 py-2.5 font-medium text-ink-50 hover:bg-ink-800"
        @click="startLogin"
      >
        <span class="pi pi-github" aria-hidden="true" />
        Entrar con GitHub
      </button>
    </div>

    <div v-else>
      <div class="mb-8 flex items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <img :src="user.avatar_url" alt="" class="h-9 w-9 rounded-full" />
          <span class="text-ink-800">Hola, {{ user.name ?? user.login }}</span>
        </div>
        <button
          type="button"
          class="text-sm text-ink-600 underline"
          @click="signOut"
        >
          Salir
        </button>
      </div>

      <p v-if="error" class="mb-6 text-sm text-error" role="alert">
        {{ error }}
      </p>

      <EventEditor
        v-if="view.name === 'edit'"
        :client="client!"
        :login="user.login"
        :hosts="hosts"
        :existing-ids="existingIds"
        :initial="view.event"
        @done="(url) => (view = { name: 'sent', url })"
        @cancel="backToList"
      />

      <div
        v-else-if="view.name === 'sent'"
        class="flex flex-col items-start gap-4"
      >
        <h2 class="font-serif text-2xl text-ink-900">
          ¡Listo! Tu cambio quedó en revisión.
        </h2>
        <p class="text-ink-700">
          Se publicará en el sitio cuando alguien del equipo lo apruebe.
        </p>
        <a
          :href="view.url"
          target="_blank"
          rel="noopener"
          class="text-terracotta-text underline"
        >
          Ver el cambio en GitHub
        </a>
        <button
          type="button"
          class="text-ink-700 underline"
          @click="backToList"
        >
          Volver a los eventos
        </button>
      </div>

      <div v-else class="flex flex-col gap-10">
        <section>
          <div class="mb-4 flex items-center justify-between">
            <h2 class="font-serif text-2xl text-ink-900">Eventos</h2>
            <button
              type="button"
              class="rounded-md bg-terracotta-500 px-4 py-2 font-medium text-white hover:bg-terracotta-700"
              @click="view = { name: 'edit', event: null }"
            >
              Nuevo evento
            </button>
          </div>
          <ul
            class="divide-y divide-ink-200 rounded-lg border border-ink-200 bg-surface"
          >
            <li
              v-for="e in events"
              :key="e.path"
              class="flex items-center justify-between gap-4 px-4 py-3"
            >
              <div>
                <p class="font-medium text-ink-900">{{ e.data.title }}</p>
                <p class="text-sm text-ink-600">
                  {{ dates(e) }} ·
                  {{ e.data.published ? 'Publicado' : 'Oculto' }}
                </p>
              </div>
              <button
                type="button"
                class="text-sm text-terracotta-text underline"
                @click="view = { name: 'edit', event: e }"
              >
                Editar
              </button>
            </li>
          </ul>
        </section>

        <section v-if="changes.length > 0">
          <h2 class="mb-4 font-serif text-2xl text-ink-900">Mis cambios</h2>
          <ul class="flex flex-col gap-2">
            <li
              v-for="c in changes"
              :key="c.url"
              class="flex items-center gap-3"
            >
              <span
                class="rounded px-2 py-0.5 text-xs font-medium"
                :class="statusClass[c.status]"
              >
                {{ c.status }}
              </span>
              <a
                :href="c.url"
                target="_blank"
                rel="noopener"
                class="text-ink-800 underline"
              >
                {{ c.title }}
              </a>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>
