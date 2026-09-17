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
        <KpiCard v-for="item in visibleKpis" :key="item.id" v-bind="item" />
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
  type OperationsKpiCardState,
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
  state: OperationsKpiCardState;
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
        state: "live",
        tone: "blue" as const,
      },
      open_inventory: {
        id: "open_inventory",
        label: "Open Inventory",
        value: formatCount(summary.kpis.pending),
        helper: "Current open inventory",
        state: "live",
        tone: "warning" as const,
      },
      sla_breached: {
        id: "sla_breached",
        label: "SLA Breached",
        value: formatCount(summary.kpis.sla_overdue),
        helper: "Current open requests with failed SLA",
        state: "live",
        tone: "danger" as const,
      },
      closed_today: {
        id: "closed_today",
        label: isToday ? "Closed Today" : "Requests Resolved",
        value: formatCount(summary.kpis.closed_today),
        helper: isToday ? "Resolved today" : "Resolved in " + periodHelper,
        state: "live",
        tone: "success" as const,
      },
      unassigned: {
        id: "unassigned",
        label: "Unassigned",
        value: formatCount(summary.kpis.unassigned),
        helper: "Current open requests without an owner",
        state: "live",
        tone: "blue" as const,
      },
      ...Object.fromEntries(
        operationsKpiCardLibrary
          .filter((card) => card.state === "preview")
          .map((card) => [
            card.id,
            {
              id: card.id,
              label: card.label,
              value: "—",
              helper: card.helper,
              state: card.state,
              tone: "default" as const,
            },
          ])
      ),
    };
  }
);

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
