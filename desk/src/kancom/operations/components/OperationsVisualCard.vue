<template>
  <section class="travelos-v2-visual-card">
    <header>
      <div>
        <h3>{{ label }}</h3>
        <p>{{ helper }}</p>
      </div>
      <span>{{ periodLabel }}</span>
    </header>

    <div v-if="id === 'workload_by_team'" class="travelos-v2-visual-list">
      <div v-for="team in summary.visuals.workload_by_team" :key="team.team">
        <div>
          <span>{{ team.team }}</span
          ><b>{{ team.load }}</b>
        </div>
        <div class="travelos-v2-visual-track">
          <span :style="{ width: percent(team.load, maxTeamLoad) }" />
        </div>
      </div>
      <p
        v-if="!summary.visuals.workload_by_team.length"
        class="travelos-v2-empty"
      >
        No unresolved requests
      </p>
    </div>

    <div
      v-else-if="id === 'actionable_waiting'"
      class="travelos-v2-composition"
    >
      <div
        v-if="summary.visuals.actionable_waiting.total"
        class="travelos-v2-stacked-bar"
      >
        <span
          :style="{
            width: percent(
              summary.visuals.actionable_waiting.actionable,
              summary.visuals.actionable_waiting.total
            ),
          }"
        />
        <span
          :style="{
            width: percent(
              summary.visuals.actionable_waiting.waiting,
              summary.visuals.actionable_waiting.total
            ),
          }"
        />
      </div>
      <div class="travelos-v2-visual-values">
        <div>
          <span>Actionable</span
          ><b>{{ summary.visuals.actionable_waiting.actionable }}</b>
        </div>
        <div>
          <span>Waiting</span
          ><b>{{ summary.visuals.actionable_waiting.waiting }}</b>
        </div>
      </div>
      <p
        v-if="!summary.visuals.actionable_waiting.total"
        class="travelos-v2-empty"
      >
        No unresolved requests
      </p>
    </div>

    <div v-else-if="id === 'created_resolved'" class="travelos-v2-visual-list">
      <div v-for="item in createdResolved" :key="item.label">
        <div>
          <span>{{ item.label }}</span
          ><b>{{ item.value }}</b>
        </div>
        <div class="travelos-v2-visual-track">
          <span :style="{ width: percent(item.value, maxCreatedResolved) }" />
        </div>
      </div>
    </div>

    <div v-else class="travelos-v2-composition">
      <div
        v-if="summary.sla_performance.evaluated"
        class="travelos-v2-stacked-bar"
      >
        <span
          :style="{
            width: percent(
              summary.sla_performance.met,
              summary.sla_performance.evaluated
            ),
          }"
        />
        <span
          class="is-breached"
          :style="{
            width: percent(
              summary.sla_performance.breached,
              summary.sla_performance.evaluated
            ),
          }"
        />
      </div>
      <div class="travelos-v2-visual-values">
        <div>
          <span>Met</span><b>{{ summary.sla_performance.met }}</b>
        </div>
        <div>
          <span>Breached</span><b>{{ summary.sla_performance.breached }}</b>
        </div>
      </div>
      <p v-if="summary.sla_performance.evaluated" class="travelos-v2-sample">
        {{ summary.sla_performance.evaluated }} evaluated
      </p>
      <p v-else class="travelos-v2-empty">No evaluated SLA outcomes</p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { OperationsSummary } from "../data/dashboardData";
import type { OperationsKpiCardId } from "../data/dashboardLayout";

const props = defineProps<{
  id: OperationsKpiCardId;
  label: string;
  helper: string;
  summary: OperationsSummary;
}>();

const periodLabel = computed(() =>
  props.id === "created_resolved"
    ? props.summary.period_label
    : "Current snapshot"
);
const maxTeamLoad = computed(() =>
  Math.max(
    ...props.summary.visuals.workload_by_team.map((team) => team.load),
    0
  )
);
const createdResolved = computed(() => [
  { label: "Created", value: props.summary.visuals.created_resolved.created },
  { label: "Resolved", value: props.summary.visuals.created_resolved.resolved },
]);
const maxCreatedResolved = computed(() =>
  Math.max(...createdResolved.value.map((item) => item.value), 0)
);

function percent(value: number, total: number) {
  return total > 0 ? `${(value / total) * 100}%` : "0%";
}
</script>
