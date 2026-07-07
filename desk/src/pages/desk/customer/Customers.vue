<template>
  <div class="flex flex-col">
    <LayoutHeader>
      <template #left-header>
        <div class="text-lg font-medium text-gray-900">Clients</div>
      </template>
      <template #right-header>
        <Button
          label="Create"
          theme="gray"
          variant="solid"
          @click="isDialogVisible = !isDialogVisible"
        >
          <template #prefix>
            <LucidePlus class="h-4 w-4" />
          </template>
        </Button>
      </template>
    </LayoutHeader>
    <ListViewBuilder
      ref="listViewRef"
      :options="options"
      @row-click="openCustomer"
      @empty-state-action="isDialogVisible = true"
    />
    <NewCustomerDialog
      v-model="isDialogVisible"
      @customer-created="handleCustomer"
    />
    <span v-if="isCustomerDialogVisible">
      <CustomerDialog
        v-model="isCustomerDialogVisible"
        :name="selectedCustomer"
        @customer-updated="handleCustomer(true)"
      />
    </span>
  </div>
</template>
<script setup lang="ts">
import LayoutHeader from "@/components/LayoutHeader.vue";
import ListViewBuilder from "@/components/ListViewBuilder.vue";
import NewCustomerDialog from "@/components/desk/global/NewCustomerDialog.vue";
import { useAgentStore } from "@/stores/agent";
import { Avatar, usePageMeta } from "frappe-ui";
import { computed, h, onMounted, ref } from "vue";
import CustomerDialog from "./CustomerDialog.vue";

const isDialogVisible = ref(false);
const isCustomerDialogVisible = ref(false);
const selectedCustomer = ref(null);
const listViewRef = ref(null);
const { agents } = useAgentStore();
// const emptyMessage = "No Customers Found";

const clientColumns = [
  { label: "Client", key: "customer_name", width: "14rem", type: "Data" },
  { label: "Domain", key: "domain", width: "14rem", type: "Data" },
  {
    label: "Serviced By Agent",
    key: "serviced_by_agent",
    width: "14rem",
    type: "Link",
    options: "HD Agent",
  },
  { label: "Status", key: "status", width: "8rem", type: "Select" },
  { label: "Created On", key: "creation", width: "9rem", type: "Datetime" },
];

const clientRows = [
  "name",
  "customer_name",
  "domain",
  "serviced_by_agent",
  "status",
  "creation",
  "image",
];

const knownAgentAbbreviations = new Set(["ets"]);

const agentNameById = computed(() => {
  return new Map(
    (agents.data || []).map((agent) => [agent.name, agent.agent_name || agent.name])
  );
});

function humanizeAgentId(value: string) {
  const localName = value.split("@")[0] || value;
  return localName
    .split(/[._\s-]+/)
    .filter(Boolean)
    .map((word) => {
      const normalized = word.toLowerCase();
      if (knownAgentAbbreviations.has(normalized)) return normalized.toUpperCase();
      return normalized.charAt(0).toUpperCase() + normalized.slice(1);
    })
    .join(" ");
}

function formatAgentName(value: string) {
  if (!value) return "-";
  return agentNameById.value.get(value) || humanizeAgentId(value) || value;
}

function openCustomer(id: string) {
  selectedCustomer.value = id;
  isCustomerDialogVisible.value = true;
}
function handleCustomer(updated = false) {
  updated
    ? (isCustomerDialogVisible.value = false)
    : (isDialogVisible.value = false);
  listViewRef.value?.reload();
}

const options = computed(() => {
  return {
    doctype: "HD Customer",
    columns: clientColumns,
    rows: clientRows,
    selectable: true,
    showSelectBanner: true,
    columnConfig: {
      customer_name: {
        prefix: ({ row }) => {
          return h(Avatar, {
            shape: "circle",
            image: row.image,
            label: row.customer_name || row.name,
            size: "sm",
          });
        },
      },
      serviced_by_agent: {
        custom: ({ item }) => {
          return h(
            "span",
            {
              class: "truncate flex-1",
              title: item || "",
            },
            formatAgentName(item)
          );
        },
      },
    },
    emptyState: {
      title: "No Clients Found",
    },
  };
});

onMounted(() => {
  if (!agents.data?.length && !agents.list?.promise) {
    agents.fetch();
  }
});

usePageMeta(() => {
  return {
    title: "Clients",
  };
});
</script>
