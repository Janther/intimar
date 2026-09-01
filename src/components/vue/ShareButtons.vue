<script setup lang="ts">
import { computed, ref, onMounted } from 'vue';

const props = defineProps<{ title: string; url: string }>();

// `navigator.share` doesn't exist during Astro's server render, so seeding
// this from a feature check at setup time would render one branch on the
// server and (on a browser that does support it) a different one on the
// client — a hydration mismatch. Defaulting to false and only flipping it
// in onMounted (client-only, post-hydration) keeps the first client render
// identical to the server-rendered HTML.
const supportsNativeShare = ref(false);
onMounted(() => {
  supportsNativeShare.value = typeof navigator.share === 'function';
});

const copied = ref(false);
let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

async function nativeShare() {
  try {
    await navigator.share({ title: props.title, url: props.url });
  } catch {
    // Visitor closed the share sheet without picking anything.
  }
}

async function copyLink() {
  try {
    await navigator.clipboard.writeText(props.url);
  } catch {
    // Clipboard access denied (permissions policy, insecure context, …) —
    // nothing to recover into, so just skip the "copied" confirmation
    // rather than claim success that didn't happen.
    return;
  }
  copied.value = true;
  clearTimeout(copiedTimeout);
  copiedTimeout = setTimeout(() => {
    copied.value = false;
  }, 2000);
}

const whatsappHref = computed(
  () =>
    `https://wa.me/?text=${encodeURIComponent(`${props.title} — ${props.url}`)}`,
);
const emailHref = computed(
  () =>
    `mailto:?subject=${encodeURIComponent(props.title)}&body=${encodeURIComponent(props.url)}`,
);

const shareButtonClass =
  'flex h-9 w-9 items-center justify-center rounded-full border border-ink-200 text-ink-700 transition hover:border-terracotta-500 hover:text-terracotta-600';
</script>

<template>
  <div class="flex items-center gap-2">
    <span class="text-sm text-ink-muted">Compartir</span>
    <a
      :href="whatsappHref"
      target="_blank"
      rel="noopener noreferrer"
      :class="shareButtonClass"
      aria-label="Compartir en WhatsApp"
    >
      <span class="pi pi-whatsapp" aria-hidden="true" />
    </a>
    <a
      :href="emailHref"
      :class="shareButtonClass"
      aria-label="Compartir por correo"
    >
      <span class="pi pi-envelope" aria-hidden="true" />
    </a>
    <button
      type="button"
      :class="shareButtonClass"
      :aria-label="copied ? 'Enlace copiado' : 'Copiar enlace'"
      @click="copyLink"
    >
      <span :class="copied ? 'pi pi-check' : 'pi pi-link'" aria-hidden="true" />
    </button>
    <button
      v-if="supportsNativeShare"
      type="button"
      :class="shareButtonClass"
      aria-label="Compartir"
      @click="nativeShare"
    >
      <span class="pi pi-share-alt" aria-hidden="true" />
    </button>
  </div>
</template>
