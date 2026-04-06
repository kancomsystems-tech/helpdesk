<template>
  <div
    :class="[
      'flex flex-col justify-between border-l transition-all duration-200',
      isCollapsed ? '!w-12' : '!w-[382px]'
    ]"
  >
    <!-- HEADER -->
    <div
      class="flex h-10.5 items-center border-b px-5 py-2.5 text-lg font-medium text-ink-gray-9 justify-between"
    >
      <span
        class="cursor-copy text-lg font-semibold"
        @click="
          copyToClipboard(ticket.name, `'${ticket.name}' copied to clipboard`)
        "
      >
        #{{ ticket.name }}
      </span>

      <div class="flex items-center gap-1">
        <Button
          variant="ghost"
          icon="chevron-left"
          class="text-gray-600"
          @click="isCollapsed = !isCollapsed"
        />
        <Dropdown
          v-if="showMergeOption"
          placement="right"
          :options="[
            {
              label: __('Merge Ticket'),
              onClick: () => (showMergeModal = true),
              icon: LucideMerge,
              condition: () => !ticket.is_merged,
            },
          ]"
        >
          <Button icon="more-horizontal" class="text-gray-600" variant="ghost" />
        </Dropdown>
      </div>
    </div>

    <!-- BODY -->
    <div v-show="!isCollapsed">
      <TicketAgentContact
        :contact="ticket.contact"
        :ticketId="ticket.name"
        @email:open="(e) => emit('email:open', e)"
      />

      <TicketFeedback
        v-if="ticket.feedback_rating"
        class="py-3 !px-6 !gap-3 text-base text-gray-600"
        :ticket="ticket"
      />

      <TicketAgentDetails :ticket="ticket" />

      <TicketAgentFields :ticket="ticket" @update="update" />

      <TicketMergeModal
        :ticket="ticket"
        v-if="showMergeModal"
        v-model="showMergeModal"
        @update="emit('reload')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Ticket } from "@/types";
import { copyToClipboard } from "@/utils";
import { computed, ref } from "vue";
import LucideMerge from "~icons/lucide/merge";
import { __ } from "@/translation";
import TicketAgentContact from "./TicketAgentContact.vue";
import TicketAgentDetails from "./TicketAgentDetails.vue";
import TicketAgentFields from "./TicketAgentFields.vue";
import TicketMergeModal from "./TicketMergeModal.vue";

interface Props {
  ticket: Ticket;
}

const props = defineProps<Props>();

const emit = defineEmits(["update", "email:open", "reload"]);

function update(val = null) {
  if (val.value && typeof val.value === "object") {
    val.value = val.value.target?.value || null;
  }
  emit("update", val);
}

const isCollapsed = ref(false);
const showMergeModal = ref(false);

const showMergeOption = computed(() => {
  return (
    !props.ticket.is_merged &&
    ["Open", "Paused"].includes(props.ticket.status_category)
  );
});
</script>
