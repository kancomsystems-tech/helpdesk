<template>
  <div
    class="travelos-page travelos-operations-dashboard-v2 min-h-full overflow-y-auto p-4 lg:p-5"
  >
    <OperationsCommandBar />
    <OperationsTopBar />

    <template v-if="liveSummary">
      <div class="travelos-v2-kpi-strip">
        <KpiCard v-for="item in kpis" :key="item.label" v-bind="item" />
      </div>

      <main class="travelos-v2-main-column">
        <AttentionList :items="liveAttentionItems" />
        <DepartmentQueues :queues="liveDepartmentQueues" />
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { createResource } from "frappe-ui";
import AttentionList from "../components/AttentionList.vue";
import DepartmentQueues from "../components/DepartmentQueues.vue";
import KpiCard from "../components/KpiCard.vue";
import OperationsCommandBar from "../components/OperationsCommandBar.vue";
import OperationsTopBar from "../components/OperationsTopBar.vue";
import {
  attentionDefinitions,
  kpiDefinitions,
  type OperationsSummary,
} from "../data/dashboardData";

const operationsSummary = createResource({
  url: "kancom_custom.api.operations_dashboard.get_summary",
  auto: true,
});

const liveSummary = computed<OperationsSummary | null>(() => {
  return (operationsSummary.data as OperationsSummary | undefined) ?? null;
});

function formatCount(value: number) {
  return value.toLocaleString();
}

const kpis = computed(() => {
  const summary = liveSummary.value;
  if (!summary) return [];

  const values = [
    summary.kpis.total_requests_today,
    summary.kpis.pending,
    summary.kpis.sla_overdue,
    summary.kpis.closed_today,
    summary.kpis.unassigned,
  ];

  return kpiDefinitions.map((definition, index) => ({
    ...definition,
    value: formatCount(values[index]),
  }));
});

const liveAttentionItems = computed(() => {
  const summary = liveSummary.value;
  if (!summary) return [];

  return attentionDefinitions.map((definition) => ({
    ...definition,
    count:
      definition.label === "SLA Overdue"
        ? summary.kpis.sla_overdue
        : summary.kpis.unassigned,
  }));
});

const liveDepartmentQueues = computed(() => {
  const summary = liveSummary.value;
  if (!summary) return [];

  return summary.department_load.map((queue) => ({
    ...queue,
    tone: "neutral" as const,
    route: "/tickets?scope=team&team=" + encodeURIComponent(queue.team),
  }));
});
</script>
