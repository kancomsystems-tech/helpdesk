<template>
  <div class="travelos-v2-kpi" :class="cardClass">
    <div class="travelos-v2-kpi-icon" :class="iconClass">
      <component :is="icon" class="size-7" />
    </div>
    <div>
      <div class="flex items-center gap-2">
        <p>{{ label }}</p>
        <div
          v-if="type === 'preview'"
          class="rounded border border-outline-gray-2 bg-surface-gray-1 px-1.5 py-0.5 text-xs font-medium text-ink-gray-6"
        >
          Preview
        </div>
      </div>
      <strong v-if="type !== 'live_breakdown'">{{ value }}</strong>
      <ul v-else class="mt-2 flex flex-col gap-1" :aria-label="label">
        <li
          v-for="item in items"
          :key="item.key"
          class="flex items-center justify-between gap-3 text-sm text-ink-gray-7"
        >
          <div class="min-w-0 truncate">{{ item.label }}</div>
          <div class="shrink-0 font-medium text-ink-gray-9">
            {{ formatBreakdownValue(item) }}
          </div>
        </li>
        <li v-if="!items.length" class="text-sm text-ink-gray-5">
          No requests
        </li>
      </ul>
      <small>{{ helper }}</small>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { KpiTone, OperationsBreakdownItem } from "../data/dashboardData";
import type {
  OperationsKpiCardId,
  OperationsKpiCardType,
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
    type: OperationsKpiCardType;
    items?: OperationsBreakdownItem[];
    tone?: KpiTone;
  }>(),
  { items: () => [], tone: "blue" }
);

function formatBreakdownValue(item: OperationsBreakdownItem) {
  if (item.percentage !== undefined)
    return item.percentage === null ? "—" : `${item.percentage}%`;
  return (item.count || 0).toLocaleString();
}

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
