<script setup lang="ts">
import { ref } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ContactForm from './ContactForm.vue';

const props = defineProps<{ eventTitle: string }>();
const visible = ref(false);
</script>

<template>
  <Button
    label="Quiero Inscribirme"
    icon="pi pi-envelope"
    class="!border-brand-700 !bg-brand-700 !text-brand-50 hover:!bg-brand-800"
    @click="visible = true"
  />
  <Dialog
    v-model:visible="visible"
    modal
    :header="`Únete a ${eventTitle}`"
    class="w-[90vw] max-w-md"
  >
    <p class="mb-4 text-sm text-brand-700">
      Cuéntanos un poco sobre ti y te responderemos con la disponibilidad y los
      próximos pasos.
    </p>
    <ContactForm
      :subject="`Interés: ${eventTitle}`"
      :initial-message="`Me gustaría unirme a ${eventTitle}.`"
    />
  </Dialog>
</template>
