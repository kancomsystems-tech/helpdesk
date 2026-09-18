<template>
  <div
    class="travelos-page travelos-operations-dashboard-v2 min-h-full overflow-y-auto p-4 lg:p-5"
    :aria-busy="isRefreshing"
  >
    <OperationsCommandBar />
    <OperationsTopBar
      :period-context="liveSummary"
      @select-period="selectPeriod"
      @customize="showLayoutDialog = true"
    />

    <p v-if="refreshError" class="mb-3 text-sm text-red-600" role="status">
      {{ refreshError }}
    </p>
    <p v-if="layoutError" class="mb-3 text-sm text-red-600" role="status">
      {{ layoutError }}
    </p>

    <template v-if="liveSummary">
      <div class="travelos-v2-kpi-strip">
        <template v-for="item in visibleKpis" :key="item.id">
          <OperationsVisualCard
            v-if="item.type === 'live_visual'"
            :id="item.id"
            :label="item.label"
            :helper="item.helper"
            :summary="liveSummary"
          />
          <KpiCard v-else v-bind="item" />
        </template>
      </div>

      <main class="travelos-v2-main-column">
        <AttentionList :items="liveAttentionItems" />
        <DepartmentQueues :queues="liveDepartmentQueues" />
      </main>
    </template>
    <KpiLayoutDialog
      v-model="showLayoutDialog"
      :cards="availableKpiCards"
      :preference="effectiveKpiLayout"
      :saving="isSavingLayout"
      @save="saveKpiLayout"
      @reset="resetKpiLayout"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { call, createResource, toast } from "frappe-ui";
import { useProductContextStore } from "@/kancom/product/store";
import AttentionList from "../components/AttentionList.vue";
import DepartmentQueues from "../components/DepartmentQueues.vue";
import KpiCard from "../components/KpiCard.vue";
import KpiLayoutDialog from "../components/KpiLayoutDialog.vue";
import OperationsCommandBar from "../components/OperationsCommandBar.vue";
import OperationsTopBar from "../components/OperationsTopBar.vue";
import OperationsVisualCard from "../components/OperationsVisualCard.vue";
import {
  attentionDefinitions,
  type OperationsPeriod,
  type OperationsSummary,
} from "../data/dashboardData";
import {
  getAvailableOperationsKpiIds,
  getVisibleOperationsKpiIds,
  operationsKpiCardLibrary,
  parseOperationsKpiPreference,
  resolveOperationsKpiLayout,
  type OperationsKpiCardId,
  type OperationsKpiCardType,
  type OperationsKpiLayoutPreference,
} from "../data/dashboardLayout";

const userSettingsKey = "Kancom Operations Dashboard";
const productContextStore = useProductContextStore();

const selectedPeriod = ref<OperationsPeriod>("today");
const displayedSummary = ref<OperationsSummary | null>(null);
const isRefreshing = ref(false);
const refreshError = ref("");
const layoutError = ref("");
const showLayoutDialog = ref(false);
const isSavingLayout = ref(false);
const kpiLayout = ref<OperationsKpiLayoutPreference>(
  resolveOperationsKpiLayout(null)
);
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
      summary.sla_performance &&
      summary.breakdowns &&
      summary.visuals &&
      Array.isArray(summary.breakdowns.clients) &&
      Array.isArray(summary.breakdowns.teams) &&
      Array.isArray(summary.breakdowns.products) &&
      Array.isArray(summary.breakdowns.categories) &&
      Array.isArray(summary.breakdowns.client_sla_breaches) &&
      Array.isArray(summary.breakdowns.team_sla_performance) &&
      Array.isArray(summary.department_load)
  );
}

function formatCount(value: number) {
  return value.toLocaleString();
}

const availableKpiIds = computed<OperationsKpiCardId[]>(() =>
  getAvailableOperationsKpiIds(
    productContextStore.context?.persona,
    productContextStore.hasCapability("operations")
  )
);
const availableKpiCards = computed(() =>
  operationsKpiCardLibrary.filter((card) =>
    availableKpiIds.value.includes(card.id)
  )
);

interface DisplayKpiCard {
  id: OperationsKpiCardId;
  label: string;
  value: string;
  helper: string;
  type: OperationsKpiCardType;
  items?: OperationsSummary["breakdowns"]["clients"];
  tone: "blue" | "warning" | "danger" | "success" | "default";
}

const kpis = computed<Partial<Record<OperationsKpiCardId, DisplayKpiCard>>>(
  () => {
    const summary = liveSummary.value;
    if (!summary) return {};

    const isToday = summary.period === "today";
    const periodHelper = summary.period_label.toLowerCase();

    return {
      created_today: {
        id: "created_today",
        label: isToday ? "Total Requests Today" : "Requests Created",
        value: formatCount(summary.kpis.total_requests_today),
        helper: isToday ? "Created today" : "Created in " + periodHelper,
        type: "live_scalar",
        tone: "blue" as const,
      },
      open_inventory: {
        id: "open_inventory",
        label: "Open Inventory",
        value: formatCount(summary.kpis.pending),
        helper: "Current open and paused request inventory",
        type: "live_scalar",
        tone: "warning" as const,
      },
      sla_breached: {
        id: "sla_breached",
        label: "SLA Breached",
        value: formatCount(summary.kpis.sla_overdue),
        helper: "Current open requests with failed SLA",
        type: "live_scalar",
        tone: "danger" as const,
      },
      closed_today: {
        id: "closed_today",
        label: isToday ? "Closed Today" : "Requests Resolved",
        value: formatCount(summary.kpis.closed_today),
        helper: isToday ? "Resolved today" : "Resolved in " + periodHelper,
        type: "live_scalar",
        tone: "success" as const,
      },
      unassigned: {
        id: "unassigned",
        label: "Unassigned",
        value: formatCount(summary.kpis.unassigned),
        helper: "Current open requests without an owner",
        type: "live_scalar",
        tone: "blue" as const,
      },
      due_soon: {
        id: "due_soon",
        label: "Due Soon",
        value: formatCount(summary.kpis.due_soon),
        helper: "Active SLA deadline due within 60 minutes",
        type: "live_scalar",
        tone: "warning" as const,
      },
      vip_priority: {
        id: "vip_priority",
        label: "High Priority Requests",
        value: formatCount(summary.kpis.high_priority),
        helper: "Open or paused requests with High or Urgent priority",
        type: "live_scalar",
        tone: "warning" as const,
      },
      sla_performance: {
        id: "sla_performance",
        label: "SLA Performance",
        value:
          summary.sla_performance.percentage === null
            ? "—"
            : `${summary.sla_performance.percentage}%`,
        helper: `SLA met across ${formatCount(
          summary.sla_performance.evaluated
        )} evaluated requests`,
        type: "live_scalar",
        tone: "success" as const,
      },
      my_queue: {
        id: "my_queue",
        label: "My Assigned",
        value: formatCount(summary.kpis.my_assigned),
        helper: "Open or paused requests assigned directly to you",
        type: "live_scalar",
        tone: "blue" as const,
      },
      team_sla_performance: breakdownCard(
        "team_sla_performance",
        "Team SLA Performance",
        "SLA met by team across evaluated requests",
        summary.breakdowns.team_sla_performance
      ),
      client_sla_monitor: breakdownCard(
        "client_sla_monitor",
        "Client SLA Breaches",
        "Top clients by current open SLA breaches",
        summary.breakdowns.client_sla_breaches,
        "danger"
      ),
      client_wise_open: breakdownCard(
        "client_wise_open",
        "Client-wise Open",
        "Top clients by open and paused requests",
        summary.breakdowns.clients
      ),
      team_wise_open: breakdownCard(
        "team_wise_open",
        "Team-wise Open",
        "Top teams by open and paused requests",
        summary.breakdowns.teams
      ),
      product_wise_open: breakdownCard(
        "product_wise_open",
        "Product-wise Open",
        "Top products by open and paused requests",
        summary.breakdowns.products
      ),
      category_wise_open: breakdownCard(
        "category_wise_open",
        "Category-wise Open",
        "Top categories by open and paused requests",
        summary.breakdowns.categories
      ),
      workload_by_team: visualCard(
        "workload_by_team",
        "Workload by Team",
        "Relative unresolved workload by team; counts show actual workload"
      ),
      actionable_waiting: visualCard(
        "actionable_waiting",
        "Actionable vs Waiting",
        "Current open and paused workload composition"
      ),
      created_resolved: visualCard(
        "created_resolved",
        "Created vs Resolved",
        `Requests created and resolved in ${periodHelper}`
      ),
      sla_outcome: visualCard(
        "sla_outcome",
        "SLA Outcome",
        "Met and breached outcomes across evaluated requests"
      ),
      ...Object.fromEntries(
        operationsKpiCardLibrary
          .filter((card) => card.type === "preview")
          .map((card) => [
            card.id,
            {
              id: card.id,
              label: card.label,
              value: "—",
              helper: card.helper,
              type: card.type,
              tone: "default" as const,
            },
          ])
      ),
    };
  }
);

function visualCard(
  id: OperationsKpiCardId,
  label: string,
  helper: string
): DisplayKpiCard {
  return { id, label, helper, value: "", type: "live_visual", tone: "default" };
}

function breakdownCard(
  id: OperationsKpiCardId,
  label: string,
  helper: string,
  items: OperationsSummary["breakdowns"][keyof OperationsSummary["breakdowns"]],
  tone: DisplayKpiCard["tone"] = "default"
): DisplayKpiCard {
  return {
    id,
    label,
    value: formatCount(
      items.reduce((sum, item) => sum + (item.count || item.evaluated || 0), 0)
    ),
    helper,
    type: "live_breakdown",
    items,
    tone,
  };
}

const visibleKpis = computed(() =>
  getVisibleOperationsKpiIds(effectiveKpiLayout.value, availableKpiIds.value)
    .map((id) => kpis.value[id])
    .filter(Boolean)
);
const effectiveKpiLayout = computed(() =>
  resolveOperationsKpiLayout(kpiLayout.value, availableKpiIds.value)
);

onMounted(loadKpiLayout);

async function loadKpiLayout() {
  layoutError.value = "";
  try {
    const settings = await call("frappe.model.utils.user_settings.get", {
      doctype: userSettingsKey,
    });
    kpiLayout.value = resolveOperationsKpiLayout(
      parseOperationsKpiPreference(settings),
      availableKpiIds.value
    );
  } catch {
    kpiLayout.value = resolveOperationsKpiLayout(null, availableKpiIds.value);
    layoutError.value =
      "Dashboard preferences could not be loaded. Showing the default layout.";
  }
}

async function saveKpiLayout(preference: OperationsKpiLayoutPreference) {
  const next = resolveOperationsKpiLayout(preference, availableKpiIds.value);
  kpiLayout.value = next;
  isSavingLayout.value = true;
  layoutError.value = "";
  try {
    await call("frappe.model.utils.user_settings.save", {
      doctype: userSettingsKey,
      user_settings: JSON.stringify({ kpi_layout: next }),
    });
    showLayoutDialog.value = false;
    toast.success("Dashboard layout saved");
  } catch {
    layoutError.value =
      "Dashboard preferences could not be saved. Your current layout is still shown.";
  } finally {
    isSavingLayout.value = false;
  }
}

async function resetKpiLayout() {
  const defaults = resolveOperationsKpiLayout(null, availableKpiIds.value);
  kpiLayout.value = defaults;
  isSavingLayout.value = true;
  layoutError.value = "";
  try {
    await call("frappe.model.utils.user_settings.save", {
      doctype: userSettingsKey,
      user_settings: JSON.stringify({ kpi_layout: null }),
    });
    showLayoutDialog.value = false;
    toast.success("Dashboard layout reset");
  } catch {
    layoutError.value =
      "The default layout is shown, but the reset could not be saved.";
  } finally {
    isSavingLayout.value = false;
  }
}

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
