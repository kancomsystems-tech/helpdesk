<template>
  <div class="travelos-v2-kpi" :class="cardClass">
    <div class="travelos-v2-kpi-icon" :class="iconClass">
      <component :is="icon" class="size-7" />
    </div>
    <div>
      <div class="flex items-center gap-2">
        <p>{{ label }}</p>
        <span
          v-if="state === 'preview'"
          class="rounded border border-outline-gray-2 bg-surface-gray-1 px-1.5 py-0.5 text-xs font-medium text-ink-gray-6"
        >
          Preview
        </span>
      </div>
      <strong>{{ value }}</strong>
      <small>{{ helper }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { KpiTone } from "../data/dashboardData";
import type {
  OperationsKpiCardId,
  OperationsKpiCardState,
} from "../data/dashboardLayout";
import LucideAlertTriangle from "~icons/lucide/alert-triangle";
import LucideCheckCircle2 from "~icons/lucide/check-circle-2";
import LucideClock3 from "~icons/lucide/clock-3";
import LucideInbox from "~icons/lucide/inbox";

const props = withDefaults(
  defineProps<{
    id: OperationsKpiCardId;
    label: string;
    value: string;
    helper: string;
    state: OperationsKpiCardState;
    tone?: KpiTone;
  }>(),
  { tone: "blue" }
);

const visualTone = computed(() => props.tone || "blue");
const cardClass = computed(() => `is-${visualTone.value}`);
const iconClass = computed(() => `is-${visualTone.value}`);
const icon = computed(() => {
  if (props.id === "open_inventory") return LucideClock3;
  if (props.id === "sla_breached") return LucideAlertTriangle;
  if (props.id === "closed_today") return LucideCheckCircle2;
  return LucideInbox;
});
</script>
