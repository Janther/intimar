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
    label="Request to Join"
    icon="pi pi-envelope"
    class="!border-brand-700 !bg-brand-700 hover:!bg-brand-800"
    @click="visible = true"
  />
  <Dialog
    v-model:visible="visible"
    modal
    :header="`Join ${eventTitle}`"
    class="w-[90vw] max-w-md"
  >
    <p class="mb-4 text-sm text-brand-700">
      Tell us a bit about yourself and we'll follow up with availability and
      next steps.
    </p>
    <ContactForm
      :subject="`Interest: ${eventTitle}`"
      :initial-message="`I'd like to join ${eventTitle}.`"
    />
  </Dialog>
</template>
