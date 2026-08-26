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
    subject: 'Message from the Intimar website',
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
  const body = `Name: ${name.value}\nEmail: ${email.value}\n\n${message.value}`;
  const mailto = `mailto:${props.toEmail}?subject=${encodeURIComponent(props.subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  submitted.value = true;
}
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1">
      <label for="name" class="text-sm font-medium text-brand-800">Name</label>
      <InputText id="name" v-model="name" required />
    </div>
    <div class="flex flex-col gap-1">
      <label for="email" class="text-sm font-medium text-brand-800"
        >Email</label
      >
      <InputText id="email" v-model="email" type="email" required />
    </div>
    <div class="flex flex-col gap-1">
      <label for="message" class="text-sm font-medium text-brand-800"
        >Message</label
      >
      <Textarea id="message" v-model="message" rows="4" autoResize required />
    </div>
    <Button
      type="submit"
      label="Send"
      class="!border-brand-700 !bg-brand-700 hover:!bg-brand-800"
    />
    <Message v-if="submitted" severity="success" :closable="false">
      Your email app should now be open with your message ready to send.
    </Message>
  </form>
</template>
