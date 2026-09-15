<template>
  <div
    class="travelos-page travelos-operations-dashboard-v2 min-h-full overflow-y-auto p-4 lg:p-5"
    :aria-busy="isRefreshing"
  >
    <OperationsCommandBar />
    <OperationsTopBar
      :period-context="liveSummary"
      @select-period="selectPeriod"
    />

    <p v-if="refreshError" class="mb-3 text-sm text-red-600" role="status">
      {{ refreshError }}
    </p>

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
import { call, createResource } from "frappe-ui";
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
const displayedSummary = ref<OperationsSummary | null>(null);
const isRefreshing = ref(false);
const refreshError = ref("");
let requestSequence = 0;

createResource({
  url: "kancom_custom.api.operations_dashboard.get_summary",
  auto: true,
  onSuccess(data: unknown) {
    if (isOperationsSummary(data)) {
      displayedSummary.value = data;
      return;
    }
    refreshError.value =
      "Operations data could not be loaded. Please try again.";
  },
  onError() {
    refreshError.value =
      "Operations data could not be loaded. Please try again.";
  },
});

const liveSummary = computed<OperationsSummary | null>(
  () => displayedSummary.value
);

function isOperationsSummary(value: unknown): value is OperationsSummary {
  if (!value || typeof value !== "object") return false;
  const summary = value as Partial<OperationsSummary>;
  return Boolean(
    summary.period &&
      summary.period_label &&
      summary.from_date &&
      summary.to_date &&
      summary.kpis &&
      Array.isArray(summary.department_load)
  );
}

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
  selectedPeriod.value = period;
  const sequence = ++requestSequence;
  isRefreshing.value = true;
  refreshError.value = "";

  try {
    const summary = await call(
      "kancom_custom.api.operations_dashboard.get_summary",
      { period }
    );
    if (sequence !== requestSequence) return;
    if (!isOperationsSummary(summary))
      throw new Error("Invalid summary response");
    displayedSummary.value = summary;
  } catch {
    if (sequence === requestSequence) {
      refreshError.value =
        "Operations data could not be refreshed. Showing the previous period.";
    }
  } finally {
    if (sequence === requestSequence) isRefreshing.value = false;
  }
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
