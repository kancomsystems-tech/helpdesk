<template>
  <div>
    <Dialog v-model="model" :options="{ title: 'Add New Client', size: 'sm' }">
      <template #body-content>
        <div class="space-y-4">
          <Input
            v-model="state.customer"
            label="Client Name"
            type="text"
            placeholder="Acme Travel Pvt Ltd"
          />
          <Input
            v-model="state.domain"
            label="Domain"
            type="text"
            placeholder="example.com"
          />
          <div class="space-y-1.5">
            <label class="block text-sm text-ink-gray-7">Serviced By Agent</label>
            <Autocomplete
              :model-value="state.serviced_by_agent"
              :options="agentOptions"
              placeholder="Select agent"
              size="sm"
              @update:model-value="selectServicedByAgent"
            />
          </div>
          <div class="space-y-1.5">
            <label class="block text-sm text-ink-gray-7">Status</label>
            <select v-model="state.status" class="form-select w-full">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <Input
            v-model="state.notes"
            label="Notes"
            type="text"
            placeholder="Internal routing or service notes"
          />
          <div class="float-right flex space-x-2">
            <Button
              label="Add"
              theme="gray"
              variant="solid"
              @click.prevent="addCustomer"
            />
          </div>
        </div>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { Autocomplete } from "@/components";
import { useAgentStore } from "@/stores/agent";
import { Dialog, Input, createResource, toast } from "frappe-ui";
import { computed, onMounted, reactive } from "vue";

const emit = defineEmits(["customerCreated"]);
const model = defineModel<boolean>();

const { agents } = useAgentStore();

const state = reactive({
  customer: "",
  domain: "",
  serviced_by_agent: "",
  status: "Active",
  notes: "",
});

const agentOptions = computed(() =>
  (agents.data || []).map((agent) => ({
    label: agent.agent_name || agent.name,
    value: agent.name,
  }))
);

function selectServicedByAgent(option) {
  state.serviced_by_agent = option?.value || "";
}

onMounted(() => {
  if (!agents.data?.length && !agents.list?.promise) {
    agents.fetch();
  }
});

const customerResource = createResource({
  url: "frappe.client.insert",
  method: "POST",
  onSuccess: () => {
    state.customer = "";
    state.domain = "";
    state.serviced_by_agent = "";
    state.status = "Active";
    state.notes = "";
    toast.success("Client created");
    emit("customerCreated");
  },
  onError: (err) => {
    toast.error(err.messages[0]);
  },
});

function addCustomer() {
  if (!state.customer) {
    toast.error("Client name is required");
    return;
  }
  customerResource.submit({
    doc: {
      doctype: "HD Customer",
      customer_name: state.customer,
      domain: state.domain,
      serviced_by_agent: state.serviced_by_agent,
      status: state.status,
      notes: state.notes,
    },
  });
}
</script>
