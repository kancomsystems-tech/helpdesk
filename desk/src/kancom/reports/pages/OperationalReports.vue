<template>
  <ProductShellPage
    title="Reports"
    description="Permission-scoped operational reporting for travel requests."
  >
    <template #actions>
      <Button
        label="Apply filters"
        variant="solid"
        :loading="report.loading"
        @click="load"
      />
      <Button
        label="Export CSV"
        icon-left="download"
        :disabled="!rows.length"
        @click="exportCsv"
      />
    </template>

    <section class="travelos-card mt-4">
      <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label
          v-for="field in filterFields"
          :key="field.key"
          class="text-xs font-medium text-ink-gray-6"
        >
          {{ field.label }}
          <select
            v-if="field.options"
            v-model="filters[field.key]"
            class="mt-1 h-8 w-full rounded border border-outline-gray-2 bg-surface-white px-2 text-sm text-ink-gray-8"
          >
            <option value="">All</option>
            <option v-for="value in field.options" :key="value" :value="value">
              {{ value }}
            </option>
          </select>
          <input
            v-else
            v-model="filters[field.key]"
            type="date"
            class="mt-1 h-8 w-full rounded border border-outline-gray-2 bg-surface-white px-2 text-sm text-ink-gray-8"
          />
        </label>
      </div>
    </section>

    <p
      v-if="report.error"
      class="mt-4 rounded border border-outline-gray-2 bg-surface-gray-1 p-3 text-sm text-ink-gray-7"
      role="alert"
    >
      Reports could not be loaded. Please try again.
    </p>
    <div v-else class="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
      <section
        v-for="item in summaryCards"
        :key="item.label"
        class="travelos-card travelos-kpi-card"
      >
        <p>{{ item.label }}</p>
        <strong>{{ item.value }}</strong>
      </section>
    </div>

    <section class="travelos-card mt-4 overflow-hidden">
      <div class="travelos-card-heading">
        <h2>Travel Requests</h2>
        <span
          >{{ rows.length }} shown<span v-if="data?.truncated">
            · limited to {{ data.limit }}</span
          ></span
        >
      </div>
      <div class="overflow-x-auto">
        <table class="w-full min-w-[1200px] text-left text-sm">
          <thead
            class="border-b border-outline-gray-2 bg-surface-gray-1 text-xs text-ink-gray-6"
          >
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                class="px-3 py-2 font-medium"
              >
                {{ column.label }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="row in rows"
              :key="row.name"
              class="border-b border-outline-gray-1 text-ink-gray-7 last:border-0"
            >
              <td
                v-for="column in columns"
                :key="column.key"
                class="max-w-64 truncate px-3 py-2"
                :title="format(row[column.key])"
              >
                {{ format(row[column.key]) }}
              </td>
            </tr>
          </tbody>
        </table>
        <p
          v-if="!report.loading && !rows.length"
          class="p-6 text-center text-sm text-ink-gray-5"
        >
          No requests match these filters.
        </p>
      </div>
    </section>
  </ProductShellPage>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import { Button, createResource } from "frappe-ui";
import ProductShellPage from "@/kancom/shell/components/ProductShellPage.vue";

const filters = reactive<Record<string, string>>({
  from_date: "",
  to_date: "",
  team: "",
  owner: "",
  client: "",
  product: "",
  category: "",
  priority: "",
  status: "",
  sla_status: "",
});
const report = createResource({
  url: "kancom_custom.api.operational_reports.get_report",
  auto: true,
});
const data = computed(() => report.data as any);
const rows = computed(() => data.value?.rows || []);
const optionMap = computed(() => data.value?.options || {});
const filterFields = computed(() => [
  { key: "from_date", label: "From date" },
  { key: "to_date", label: "To date" },
  { key: "team", label: "Team", options: optionMap.value.teams || [] },
  {
    key: "owner",
    label: "Agent / Owner",
    options: optionMap.value.owners || [],
  },
  { key: "client", label: "Client", options: optionMap.value.clients || [] },
  { key: "product", label: "Product", options: optionMap.value.products || [] },
  {
    key: "category",
    label: "Category",
    options: optionMap.value.categories || [],
  },
  {
    key: "priority",
    label: "Priority",
    options: optionMap.value.priorities || [],
  },
  { key: "status", label: "Status", options: optionMap.value.statuses || [] },
  {
    key: "sla_status",
    label: "SLA status",
    options: optionMap.value.sla_statuses || [],
  },
]);
const summaryCards = computed(() => [
  { label: "Total Requests", value: data.value?.summary?.total || 0 },
  { label: "Resolved", value: data.value?.summary?.resolved || 0 },
  { label: "Current Open / unresolved", value: data.value?.summary?.open || 0 },
  { label: "SLA Breached", value: data.value?.summary?.sla_breached || 0 },
]);
const columns = [
  { key: "name", label: "Request ID" },
  { key: "subject", label: "Request" },
  { key: "team", label: "Team" },
  { key: "owner", label: "Agent / Owner" },
  { key: "client", label: "Client" },
  { key: "product", label: "Product" },
  { key: "category", label: "Category" },
  { key: "priority", label: "Priority" },
  { key: "status", label: "Status" },
  { key: "sla_status", label: "SLA" },
  { key: "created", label: "Created" },
  { key: "resolved", label: "Resolved" },
  { key: "updated", label: "Updated" },
];
function load() {
  report.submit({ filters: JSON.stringify(filters) });
}
function format(value: unknown) {
  return value ? String(value) : "—";
}
async function exportCsv() {
  const result = await report.submit({
    filters: JSON.stringify(filters),
    export: 1,
  });
  const csv = [
    columns.map((c) => c.label),
    ...(result.rows || []).map((row) => columns.map((c) => row[c.key] ?? "")),
  ]
    .map((line) =>
      line.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
  const link = document.createElement("a");
  link.href = URL.createObjectURL(
    new Blob([csv], { type: "text/csv;charset=utf-8" })
  );
  link.download = "travelos-operational-report.csv";
  link.click();
  URL.revokeObjectURL(link.href);
}
</script>
