<template>
  <div class="travelos-page travelos-operations-dashboard-v2 min-h-full overflow-y-auto p-4 lg:p-5">
    <OperationsCommandBar />
    <OperationsTopBar />

    <div class="travelos-v2-kpi-strip">
      <KpiCard v-for="item in kpis" :key="item.label" v-bind="item" />
    </div>

    <div class="travelos-v2-main-grid">
      <main class="travelos-v2-main-column">
        <AttentionList :items="liveAttentionItems" />
        <DepartmentQueues :queues="liveDepartmentQueues" />
        <InfoPanels :activity="recentActivity" :clients="clientSlaMonitor" :agents="agentAvailability" />
      </main>
      <SideRail />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from "vue";
import { createResource } from "frappe-ui";
import AttentionList from "../components/AttentionList.vue";
import DepartmentQueues from "../components/DepartmentQueues.vue";
import InfoPanels from "../components/InfoPanels.vue";
import KpiCard from "../components/KpiCard.vue";
import OperationsCommandBar from "../components/OperationsCommandBar.vue";
import OperationsTopBar from "../components/OperationsTopBar.vue";
import SideRail from "../components/SideRail.vue";
import {
  agentAvailability,
  attentionItems,
  clientSlaMonitor,
  departmentQueues,
  fallbackKpis,
  recentActivity,
  type OperationsSummary,
} from "../data/dashboardData";

const operationsSummary = createResource({
  url: "kancom_custom.api.operations_dashboard.get_summary",
  auto: true,
});

const liveSummary = computed<OperationsSummary | null>(() => {
  return (operationsSummary.data as OperationsSummary | undefined) ?? null;
});

function formatCount(value: number | undefined, fallback: string) {
  return typeof value === "number" ? value.toLocaleString() : fallback;
}

const kpis = computed(() => {
  const summary = liveSummary.value;
  if (!summary) return fallbackKpis;

  // Phase 1 live fields: four top-line ticket aggregates. Trend copy remains demo-safe.
  return [
    {
      ...fallbackKpis[0],
      value: formatCount(summary.kpis.total_requests_today, fallbackKpis[0].value),
      helper: "Live requests created today",
    },
    {
      ...fallbackKpis[1],
      value: formatCount(summary.kpis.pending, fallbackKpis[1].value),
      helper: "Live open request inventory",
    },
    {
      ...fallbackKpis[2],
      value: formatCount(summary.kpis.sla_overdue, fallbackKpis[2].value),
      helper: "Live open breached SLA clocks",
    },
    fallbackKpis[3],
    {
      ...fallbackKpis[4],
      value: formatCount(summary.kpis.closed_today, fallbackKpis[4].value),
      helper: "Live requests resolved today",
    },
  ];
});

const liveAttentionItems = computed(() => {
  const summary = liveSummary.value;
  if (!summary) return attentionItems;

  // Phase 1 live fields: SLA Overdue and Unassigned. Other attention cards remain demo-safe.
  return attentionItems.map((item) => {
    if (item.label === "SLA Overdue") {
      return { ...item, count: summary.kpis.sla_overdue };
    }
    if (item.label === "Unassigned") {
      return { ...item, count: summary.kpis.unassigned };
    }
    return item;
  });
});

const liveDepartmentQueues = computed(() => {
  const summary = liveSummary.value;
  if (!summary) return departmentQueues;

  const liveLoads = new Map(
    summary.department_load.map((item) => [item.team, item.load])
  );

  // Phase 1 live field: active open load by exact HD Team name. Other queue fields remain demo-safe.
  return departmentQueues.map((queue) => ({
    ...queue,
    load: liveLoads.get(queue.team) ?? queue.load,
  }));
});

const unmatchedDepartmentTeams = computed(() => {
  const summary = liveSummary.value;
  if (!summary) return [];

  const knownTeams = new Set(departmentQueues.map((queue) => queue.team));
  return summary.department_load
    .map((item) => item.team)
    .filter((team) => !knownTeams.has(team));
});

watchEffect(() => {
  if (unmatchedDepartmentTeams.value.length) {
    console.warn(
      "[TravelOS] Operations live department load includes unmapped HD Teams:",
      unmatchedDepartmentTeams.value
    );
  }
});
</script>
