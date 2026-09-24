<template>
  <div class="flex flex-col h-full overflow-y-auto px-5 py-4 gap-3">
    <div v-if="messages.loading" class="flex items-center justify-center mt-20">
      <LoadingIndicator :scale="6" class="text-ink-gray-5" />
    </div>

    <div
      v-else-if="messages.error"
      class="flex items-center justify-center mt-20 text-sm text-ink-red-4"
    >
      Could not load WhatsApp messages.
    </div>

    <div
      v-else-if="!items.length"
      class="flex items-center justify-center mt-20 text-sm text-ink-gray-5"
    >
      No WhatsApp messages
    </div>

    <div
      v-else
      v-for="item in items"
      :key="item.name"
      class="flex"
      :class="item.direction === 'Outgoing' ? 'justify-end' : 'justify-start'"
    >
      <div
        class="max-w-[75%] rounded-lg px-3 py-2 text-sm"
        :class="
          item.direction === 'Outgoing'
            ? 'bg-surface-gray-3 text-ink-gray-8'
            : 'bg-surface-white border border-outline-gray-2 text-ink-gray-8'
        "
      >
        <p class="whitespace-pre-wrap break-words">{{ item.message }}</p>
        <a
          v-if="item.media_url"
          :href="item.media_url"
          target="_blank"
          rel="noopener noreferrer"
          class="block mt-1 text-xs text-ink-blue-3 underline"
        >
          {{ item.file_name || "Attachment" }}
        </a>
        <p v-if="item.error_message" class="mt-1 text-xs text-ink-red-4">
          {{ item.error_message }}
        </p>
        <div class="flex items-center gap-2 mt-1 text-xs text-ink-gray-5">
          <span>{{ formatTimestamp(item.creation) }}</span>
          <span v-if="item.status">&middot; {{ item.status }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { globalStore } from "@/stores/globalStore";
import { createResource, LoadingIndicator } from "frappe-ui";
import { computed, onBeforeUnmount, onMounted, watch } from "vue";

interface WhatsAppMessageRow {
  name: string;
  direction: "Incoming" | "Outgoing";
  to: string;
  from: string;
  mime_type?: string;
  media_url?: string;
  file_name?: string;
  message: string;
  status?: string;
  creation: string;
  message_id?: string;
  context_message_id?: string;
  reaction?: string;
  error_message?: string;
}

const props = defineProps<{ ticketId: string }>();

const { $socket } = globalStore();

const messages = createResource({
  url: "whatsapp.whatsapp.api.messages.get_messages",
  params: {
    references: JSON.stringify([["HD Ticket", String(props.ticketId)]]),
  },
  auto: true,
});

const items = computed<WhatsAppMessageRow[]>(() => messages.data || []);

function formatTimestamp(value: string) {
  if (!value) return "";
  return new Date(value).toLocaleString();
}

function handleRealtimeEvent(data: {
  reference_doctype: string;
  reference_docname: string;
}) {
  if (
    data.reference_doctype === "HD Ticket" &&
    String(data.reference_docname) === String(props.ticketId)
  ) {
    messages.reload();
  }
}

onMounted(() => {
  $socket.on("whatsapp_message", handleRealtimeEvent);
});

onBeforeUnmount(() => {
  $socket.off("whatsapp_message", handleRealtimeEvent);
});

watch(
  () => props.ticketId,
  () => {
    messages.update({
      params: {
        references: JSON.stringify([["HD Ticket", String(props.ticketId)]]),
      },
    });
    messages.reload();
  }
);
</script>
