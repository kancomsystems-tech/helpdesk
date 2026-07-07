<template>
  <Dialog :options="options">
    <template #body-main>
      <div class="flex flex-col items-center gap-4 p-6">
        <Avatar
          size="lg"
          :label="customer.doc?.name"
          :image="customer.doc?.image"
          class="cursor-pointer hover:opacity-80"
        />
        <div class="flex gap-2">
          <FileUploader @success="(file) => updateImage(file)">
            <template #default="{ uploading, openFileSelector }">
              <Button
                :label="customer.doc?.image ? 'Change photo' : 'Upload photo'"
                :loading="uploading"
                @click="openFileSelector"
              />
            </template>
          </FileUploader>
          <Button
            v-if="customer.doc?.image"
            label="Remove photo"
            @click="updateImage(null)"
          />
        </div>
        <div class="w-full space-y-4">
          <Input
            v-model="clientName"
            label="Client Name"
            placeholder="Acme Travel Pvt Ltd"
          />
          <Input v-model="domain" label="Domain" placeholder="example.com" />
          <div class="space-y-1.5">
            <label class="block text-sm text-ink-gray-7">Serviced By Agent</label>
            <Autocomplete
              :model-value="servicedByAgent"
              :options="agentOptions"
              placeholder="Select agent"
              size="sm"
              @update:model-value="selectServicedByAgent"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm text-ink-gray-7">Status</label>
            <select v-model="status" class="form-select w-full">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <Input
            v-model="notes"
            label="Notes"
            placeholder="Internal routing or service notes"
          />
        </div>
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { Autocomplete } from "@/components";
import { useAgentStore } from "@/stores/agent";
import {
  Avatar,
  createDocumentResource,
  Dialog,
  FileUploader,
  toast,
} from "frappe-ui";
import { computed, onMounted } from "vue";

const props = defineProps({
  name: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["customer-updated"]);
const { agents } = useAgentStore();

const agentOptions = computed(() =>
  (agents.data || []).map((agent) => ({
    label: agent.agent_name || agent.name,
    value: agent.name,
  }))
);

const clientName = computed({
  get() {
    return customer.doc?.customer_name || customer.doc?.name;
  },
  set(value: string) {
    customer.doc.customer_name = value;
  },
});

const domain = computed({
  get() {
    return customer.doc?.domain;
  },
  set(value: string) {
    customer.doc.domain = value;
  },
});

const servicedByAgent = computed({
  get() {
    return customer.doc?.serviced_by_agent;
  },
  set(value: string) {
    customer.doc.serviced_by_agent = value;
  },
});

const status = computed({
  get() {
    return customer.doc?.status || "Active";
  },
  set(value: string) {
    customer.doc.status = value;
  },
});

const notes = computed({
  get() {
    return customer.doc?.notes;
  },
  set(value: string) {
    customer.doc.notes = value;
  },
});

function selectServicedByAgent(option) {
  servicedByAgent.value = option?.value || "";
}

onMounted(() => {
  if (!agents.data?.length && !agents.list?.promise) {
    agents.fetch();
  }
});

const customer = createDocumentResource({
  doctype: "HD Customer",
  name: props.name,
  auto: true,
  setValue: {
    onSuccess() {
      toast.success("Client updated");
    },
    onError() {
      toast.error("Error updating client");
    },
  },
});

const options = computed(() => ({
  title: customer.doc?.name ? `Edit Client: ${customer.doc.name}` : "Edit Client",
  actions: [
    {
      label: "Save",
      theme: "gray",
      variant: "solid",
      onClick: () => update(),
    },
  ],
}));

async function update() {
  await customer.setValue.submit({
    customer_name: clientName.value,
    domain: domain.value,
    serviced_by_agent: servicedByAgent.value,
    status: status.value,
    notes: notes.value,
  });
  emit("customer-updated");
}

function updateImage(file) {
  customer.setValue.submit({
    image: file?.file_url || null,
  });
  emit("customer-updated");
}
</script>
