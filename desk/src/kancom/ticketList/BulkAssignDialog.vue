<template>
  <Dialog
    v-model="show"
    :options="{
      title: __('Bulk Assign'),
      size: 'md',
    }"
  >
    <template #body-content>
      <div class="flex flex-col gap-4">
        <p class="text-p-sm text-ink-gray-6">
          {{
            __('Assign {0} selected travel request(s) to an agent.', [
              selectedTickets.length,
            ])
          }}
        </p>
        <SearchComplete
          doctype="HD Agent"
          search-field="agent_name"
          label-field="agent_name"
          value-field="name"
          :custom-filters="{ is_active: ['=', 1] }"
          :reset-input="false"
          @change="handleAgentChange"
        />
        <div v-if="selectedAgent" class="text-p-sm text-ink-gray-6">
          {{ __('Selected agent') }}:
          <span class="font-medium text-ink-gray-8">
            {{ selectedAgentLabel }}
          </span>
        </div>
      </div>
    </template>
    <template #actions>
      <div class="flex justify-end gap-2">
        <Button :label="__('Cancel')" @click="show = false" />
        <Button
          :label="__('Assign')"
          variant="solid"
          :disabled="!selectedAgent || !selectedTickets.length"
          :loading="assigning"
          @click="assignSelectedTickets"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { SearchComplete } from "@/components";
import { __ } from "@/translation";
import { Button, Dialog, call, toast } from "frappe-ui";
import { computed, ref, watch } from "vue";

const show = defineModel<boolean>();

const props = defineProps<{
  selectedTickets: string[];
}>();

const emit = defineEmits<{
  assigned: [];
}>();

const selectedAgent = ref("");
const selectedAgentName = ref("");
const assigning = ref(false);

const selectedAgentLabel = computed(
  () => selectedAgentName.value || selectedAgent.value
);

function handleAgentChange(option: { label?: string; value?: string }) {
  selectedAgent.value = option?.value || "";
  selectedAgentName.value = option?.label || "";
}

async function assignSelectedTickets() {
  if (!selectedAgent.value || !props.selectedTickets.length) return;

  assigning.value = true;
  try {
    await Promise.all(
      props.selectedTickets.map((ticket) =>
        call("frappe.desk.form.assign_to.add", {
          doctype: "HD Ticket",
          name: ticket,
          assign_to: [selectedAgent.value],
        })
      )
    );
    toast.success(
      __("Assigned {0} travel request(s) to {1}", [
        props.selectedTickets.length,
        selectedAgentLabel.value,
      ])
    );
    show.value = false;
    emit("assigned");
  } catch (error) {
    toast.error(__("Could not assign selected travel request(s)"));
  } finally {
    assigning.value = false;
  }
}

watch(show, (value) => {
  if (!value) {
    selectedAgent.value = "";
    selectedAgentName.value = "";
    assigning.value = false;
  }
});
</script>
