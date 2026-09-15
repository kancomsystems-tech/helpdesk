<template>
  <div
    class="travelos-page travelos-operations-dashboard-v2 min-h-full overflow-y-auto p-4 lg:p-5"
  >
    <OperationsCommandBar />
    <OperationsTopBar
      :period-context="liveSummary"
      @select-period="selectPeriod"
    />

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
import { computed, ref } from "vue";
import { createResource } from "frappe-ui";
import AttentionList from "../components/AttentionList.vue";
import DepartmentQueues from "../components/DepartmentQueues.vue";
import KpiCard from "../components/KpiCard.vue";
import OperationsCommandBar from "../components/OperationsCommandBar.vue";
import OperationsTopBar from "../components/OperationsTopBar.vue";
import {
  attentionDefinitions,
  type OperationsPeriod,
  type OperationsSummary,
} from "../data/dashboardData";

const selectedPeriod = ref<OperationsPeriod>("today");
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

  const isToday = summary.period === "today";
  const periodHelper = summary.period_label.toLowerCase();

  return [
    {
      label: isToday ? "Total Requests Today" : "Requests Created",
      value: formatCount(summary.kpis.total_requests_today),
      helper: isToday ? "Created today" : "Created in " + periodHelper,
      tone: "blue" as const,
    },
    {
      label: "Pending",
      value: formatCount(summary.kpis.pending),
      helper: "Current open inventory",
      tone: "warning" as const,
    },
    {
      label: "SLA Overdue",
      value: formatCount(summary.kpis.sla_overdue),
      helper: "Current open requests with failed SLA",
      tone: "danger" as const,
    },
    {
      label: isToday ? "Closed Today" : "Requests Resolved",
      value: formatCount(summary.kpis.closed_today),
      helper: isToday ? "Resolved today" : "Resolved in " + periodHelper,
      tone: "success" as const,
    },
    {
      label: "Unassigned",
      value: formatCount(summary.kpis.unassigned),
      helper: "Current open requests without an owner",
      tone: "blue" as const,
    },
  ];
});

async function selectPeriod(period: OperationsPeriod) {
  if (period === selectedPeriod.value) return;
  await operationsSummary.submit({ period });
  selectedPeriod.value = period;
}

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
