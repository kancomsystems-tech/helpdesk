<template>
  <ProductShellPage
    title="Analytics Dashboard"
    description="Performance visibility across request volume, SLA posture, client patterns and agent throughput."
    :period="summary?.period_label || 'Last 30 days'"
  >
    <template #actions>
      <select
        v-model.number="selectedDays"
        class="rounded border border-outline-gray-2 bg-surface-white px-3 text-sm text-ink-gray-8"
        aria-label="Analytics date range"
        :disabled="loading"
        @change="loadSelectedPeriod"
      >
        <option
          v-for="option in analyticsPeriodOptions"
          :key="option.days"
          :value="option.days"
        >
          {{ option.label }}
        </option>
      </select>
      <span class="self-center text-xs text-ink-gray-6">
        {{ summary?.period_label || "Loading date range…" }}
      </span>
      <button
        type="button"
        disabled
        title="Analytics filters are not yet available"
      >
        Filters · Preview
      </button>
      <button
        type="button"
        disabled
        title="Analytics export is not yet available"
      >
        Export · Preview
      </button>
    </template>

    <p v-if="error" class="mt-4 text-sm text-ink-gray-7" role="status">
      {{ error }}
    </p>

    <template v-if="summary">
      <div class="travelos-kpi-grid mt-4">
        <section
          v-for="kpi in analyticsKpis"
          :key="kpi.label"
          class="travelos-card travelos-kpi-card"
        >
          <p>{{ kpi.label }}</p>
          <strong>{{ kpi.value }}</strong>
          <span>{{ kpi.helper }}</span>
        </section>
      </div>

      <div class="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
        <section class="travelos-card xl:col-span-1">
          <div class="travelos-card-heading">
            <h2>Request Trends</h2>
            <span>Created by local calendar day</span>
          </div>
          <div
            v-if="hasTrendData"
            class="travelos-line-chart"
            aria-label="Daily request volume"
          >
            <span
              v-for="point in summary.request_trend"
              :key="point.date"
              :style="{ height: trendHeight(point.count) }"
              :title="point.date + ': ' + point.count + ' requests'"
            />
          </div>
          <p v-else class="travelos-card-copy">No requests in this period.</p>
        </section>

        <section class="travelos-card">
          <div class="travelos-card-heading">
            <h2>SLA Performance</h2>
            <span>Fulfilled / evaluated</span>
          </div>
          <div v-if="summary.sla_by_team.length" class="space-y-3">
            <div
              v-for="team in summary.sla_by_team"
              :key="team.team"
              class="travelos-progress-row"
            >
              <div>
                <span>{{ team.team }}</span>
                <strong>{{ formatPercent(team.sla_percent) }}</strong>
              </div>
              <div>
                <span :style="{ width: String(team.sla_percent || 0) + '%' }" />
              </div>
              <small>{{ team.evaluated_count }} evaluated tickets</small>
            </div>
          </div>
          <p v-else class="travelos-card-copy">
            No evaluated SLA outcomes in this period.
          </p>
        </section>

        <section class="travelos-card">
          <div class="travelos-card-heading">
            <h2>Resolution Mix</h2>
            <span>Requests created in period</span>
          </div>
          <div
            class="travelos-donut border-8 border-outline-gray-2 bg-surface-white"
          >
            <strong>{{ resolutionTotal.toLocaleString() }}</strong>
            <span>Requests</span>
          </div>
          <div
            v-if="summary.resolution_mix.length"
            class="mt-4 grid grid-cols-2 gap-2 text-sm text-ink-gray-6"
          >
            <span v-for="item in summary.resolution_mix" :key="item.category">
              {{ item.category }} {{ item.count.toLocaleString() }}
            </span>
          </div>
          <p v-else class="travelos-card-copy">No requests in this period.</p>
        </section>
      </div>

      <div class="mt-4 grid gap-4 xl:grid-cols-2">
        <section class="travelos-card">
          <div class="travelos-card-heading">
            <h2>Client Performance</h2>
            <span>Created requests and evaluated SLA</span>
          </div>
          <div v-if="summary.clients.length" class="travelos-table">
            <div class="travelos-table-row is-header">
              <span>Client</span><span>Requests</span><span>SLA</span
              ><span>Trend</span>
            </div>
            <div
              v-for="client in summary.clients"
              :key="client.client"
              class="travelos-table-row"
            >
              <span>{{ client.client }}</span>
              <span>{{ client.requests.toLocaleString() }}</span>
              <span
                :title="String(client.evaluated_count) + ' evaluated tickets'"
              >
                {{ formatPercent(client.sla_percent) }}
              </span>
              <span>{{ formatTrend(client) }}</span>
            </div>
          </div>
          <p v-else class="travelos-card-copy">
            No client requests in this period.
          </p>
        </section>

        <section class="travelos-card">
          <div class="travelos-card-heading">
            <h2>Agent Performance</h2>
            <span class="rounded border border-outline-gray-2 px-1.5 py-0.5">
              Preview
            </span>
          </div>
          <p class="travelos-card-copy">
            {{ summary.agent_performance.reason }}
          </p>
          <div
            class="travelos-table mt-4"
            aria-label="Agent performance preview"
          >
            <div class="travelos-table-row is-header">
              <span>Agent</span><span>Resolved</span><span>Response</span
              ><span>SLA</span>
            </div>
            <div class="travelos-table-row text-ink-gray-5">
              <span>—</span><span>—</span><span>—</span><span>—</span>
            </div>
          </div>
        </section>
      </div>
    </template>
  </ProductShellPage>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { createResource } from "frappe-ui";
import ProductShellPage from "../../shell/components/ProductShellPage.vue";
import {
  analyticsPeriodOptions,
  type AnalyticsClientPerformance,
  type AnalyticsSummary,
} from "../data/analyticsData";

const selectedDays = ref(30);
const summary = ref<AnalyticsSummary | null>(null);
const error = ref("");

const analytics = createResource({
  url: "kancom_custom.api.analytics_dashboard.get_summary",
  auto: true,
  onSuccess(data: unknown) {
    if (isAnalyticsSummary(data)) {
      summary.value = data;
      error.value = "";
      return;
    }
    error.value = "Analytics data could not be loaded.";
  },
  onError() {
    error.value = "Analytics data could not be loaded.";
  },
});

const loading = computed(() => analytics.loading);
const analyticsKpis = computed(() => {
  if (!summary.value) return [];
  const kpis = summary.value.kpis;
  return [
    {
      label: "Total Requests",
      value: kpis.total_requests.toLocaleString(),
      helper: "Created in selected period",
    },
    {
      label: "Resolved",
      value: kpis.resolved.toLocaleString(),
      helper: "Resolved in selected period",
    },
    {
      label: "Current Open Inventory",
      value: kpis.open_inventory.toLocaleString(),
      helper: "Current open and paused requests",
    },
    {
      label: "Current SLA Breaches",
      value: kpis.sla_breached_current.toLocaleString(),
      helper: "Current open requests with failed SLA",
    },
    {
      label: "Avg Response",
      value: formatDuration(kpis.avg_response_seconds),
      helper: "Responded requests created in period",
    },
    {
      label: "Avg Resolution",
      value: formatDuration(kpis.avg_resolution_seconds),
      helper: "Requests resolved in selected period",
    },
  ];
});
const maximumTrendCount = computed(() =>
  Math.max(
    0,
    ...(summary.value?.request_trend.map((point) => point.count) || [])
  )
);
const hasTrendData = computed(() =>
  Boolean(summary.value?.request_trend.some((point) => point.count > 0))
);
const resolutionTotal = computed(() =>
  (summary.value?.resolution_mix || []).reduce(
    (total, item) => total + item.count,
    0
  )
);

function isAnalyticsSummary(value: unknown): value is AnalyticsSummary {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AnalyticsSummary>;
  return Boolean(
    candidate.from_date &&
      candidate.to_date &&
      candidate.period_label &&
      candidate.kpis &&
      Array.isArray(candidate.request_trend) &&
      Array.isArray(candidate.sla_by_team) &&
      Array.isArray(candidate.resolution_mix) &&
      Array.isArray(candidate.clients) &&
      candidate.agent_performance?.state === "preview"
  );
}

function loadSelectedPeriod() {
  const anchor =
    summary.value?.to_date || new Date().toISOString().slice(0, 10);
  const toDate = new Date(anchor + "T00:00:00Z");
  const fromDate = new Date(toDate);
  fromDate.setUTCDate(fromDate.getUTCDate() - selectedDays.value + 1);
  analytics.fetch({
    from_date: fromDate.toISOString().slice(0, 10),
    to_date: anchor,
  });
}

function trendHeight(count: number) {
  if (!count || !maximumTrendCount.value) return "0%";
  return String(Math.max(4, (count / maximumTrendCount.value) * 100)) + "%";
}

function formatDuration(seconds: number | null) {
  if (seconds === null) return "—";
  const rounded = Math.round(seconds);
  const hours = Math.floor(rounded / 3600);
  const minutes = Math.floor((rounded % 3600) / 60);
  const remainder = rounded % 60;
  if (hours) return String(hours) + "h " + String(minutes) + "m";
  if (minutes) return String(minutes) + "m " + String(remainder) + "s";
  return String(remainder) + "s";
}

function formatPercent(value: number | null) {
  return value === null ? "—" : value.toFixed(1) + "%";
}

function formatTrend(client: AnalyticsClientPerformance) {
  if (client.trend_percent === null) {
    return client.previous_requests === 0 && client.requests > 0 ? "New" : "—";
  }
  const prefix = client.trend_percent > 0 ? "+" : "";
  return prefix + client.trend_percent.toFixed(1) + "%";
}
</script>
