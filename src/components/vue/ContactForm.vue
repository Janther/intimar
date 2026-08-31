<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { CONTACT_EMAIL } from '../../lib/site';

const props = withDefaults(
  defineProps<{
    subject?: string;
    initialMessage?: string;
    toEmail?: string;
  }>(),
  {
    subject: 'Mensaje desde el sitio de Intimar',
    initialMessage: '',
    toEmail: CONTACT_EMAIL,
  },
);

const name = ref('');
const email = ref('');
const message = ref(props.initialMessage);
const submitted = ref(false);

// No backend on this static build yet, so submissions hand off to the
// visitor's own mail client rather than silently failing.
function handleSubmit() {
  const body = `Nombre: ${name.value}\nCorreo: ${email.value}\n\n${message.value}`;
  const mailto = `mailto:${props.toEmail}?subject=${encodeURIComponent(props.subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  submitted.value = true;
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1">
      <label for="name" class="text-sm font-medium text-ink-800">Nombre</label>
      <InputText id="name" v-model="name" required />
    </div>
    <div class="flex flex-col gap-1">
      <label for="email" class="text-sm font-medium text-ink-800"
        >Correo electrónico</label
      >
      <InputText id="email" v-model="email" type="email" required />
    </div>
    <div class="flex flex-col gap-1">
      <label for="message" class="text-sm font-medium text-ink-800"
        >Mensaje</label
      >
      <Textarea id="message" v-model="message" rows="4" autoResize required />
    </div>
    <Button
      type="submit"
      label="Enviar"
      class="!border-terracotta-500 !bg-terracotta-500 !text-white hover:!bg-terracotta-700"
    />
    <Message v-if="submitted" severity="success" :closable="false">
      Tu aplicación de correo debería estar abierta con tu mensaje listo para
      enviar.
    </Message>
  </form>
</template>
