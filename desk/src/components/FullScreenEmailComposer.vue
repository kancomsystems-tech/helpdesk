<template>
  <Dialog v-model="open" :options="{ size: '7xl' }">
    <template #body>
      <div class="h-[85vh] flex flex-col">
        <div class="px-6 py-4 border-b flex items-center justify-between">
          <h3 class="text-lg font-medium">Reply</h3>
          <Button label="Close" @click="open = false" />
        </div>

        <div class="flex-1 overflow-hidden">
          <EmailEditor
            ref="emailEditorRef"
            class="h-full"
            :ticketId="ticketId"
            :toEmails="toEmails"
            :ccEmails="ccEmails"
            :bccEmails="bccEmails"
            @submit="handleSubmit"
            @discard="handleDiscard"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import { Dialog, Button } from "frappe-ui";
import EmailEditor from "./EmailEditor.vue";

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  ticketId: { type: String, default: null },
  toEmails: { type: Array, default: () => [] },
  ccEmails: { type: Array, default: () => [] },
  bccEmails: { type: Array, default: () => [] },
});

const emit = defineEmits(["update:modelValue", "submit", "discard"]);

const open = ref(props.modelValue);
const emailEditorRef = ref(null);

watch(
  () => props.modelValue,
  (val) => {
    open.value = val;
  }
);

watch(open, (val) => {
  emit("update:modelValue", val);
});

function handleSubmit() {
  emit("submit");
  open.value = false;
}

function handleDiscard() {
  emit("discard");
  open.value = false;
}
</script>
