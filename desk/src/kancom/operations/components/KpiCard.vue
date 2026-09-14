<template>
  <div class="travelos-v2-kpi" :class="cardClass">
    <div class="travelos-v2-kpi-icon" :class="iconClass">
      <component :is="icon" class="size-7" />
    </div>
    <div>
      <p>{{ label }}</p>
      <strong>{{ value }}</strong>
      <span :class="trendClass">{{ trend }}</span>
      <small>{{ comparison }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { KpiTone } from "../data/dashboardData";
import LucideAlertTriangle from "~icons/lucide/alert-triangle";
import LucideCheckCircle2 from "~icons/lucide/check-circle-2";
import LucideClock3 from "~icons/lucide/clock-3";
import LucideInbox from "~icons/lucide/inbox";
import LucideTimerReset from "~icons/lucide/timer-reset";

const props = withDefaults(
  defineProps<{
    label: string;
    value: string;
    helper: string;
    trend: string;
    comparison: string;
    tone?: KpiTone;
  }>(),
  { tone: "blue" }
);

const visualTone = computed(() => props.tone || "blue");
const cardClass = computed(() => `is-${visualTone.value}`);
const iconClass = computed(() => `is-${visualTone.value}`);
const trendClass = computed(() => ({ "is-negative": props.trend.startsWith("-") }));
const icon = computed(() => {
  if (props.label === "Pending") return LucideClock3;
  if (props.label === "SLA Overdue") return LucideAlertTriangle;
  if (props.label === "Due Soon") return LucideTimerReset;
  if (props.label === "Closed Today") return LucideCheckCircle2;
  return LucideInbox;
});
</script>
