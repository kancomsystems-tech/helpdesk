<template>
  <header class="travelos-ops-hero">
    <div>
      <h1>Good day, {{ userName }}</h1>
      <p>Here is the live operational picture for your current scope.</p>
    </div>
    <div class="travelos-period-control">
      <div class="travelos-dashboard-controls">
        <Button
          class="travelos-customize-control"
          label="Customize"
          variant="subtle"
          @click="$emit('customize')"
        >
          <template #prefix>
            <LucideSlidersHorizontal class="size-4" />
          </template>
        </Button>
        <Dropdown :options="periodOptions">
          <template #default="{ open }">
            <button type="button" class="travelos-date-selector">
              <LucideCalendarDays class="size-4" />
              <span>{{ periodContext?.period_label || "Today" }}</span>
              <LucideChevronDown
                class="size-4"
                :class="{ 'rotate-180': open }"
              />
            </button>
          </template>
        </Dropdown>
      </div>
      <small v-if="periodContext">{{ dateRangeLabel }}</small>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { Button, Dropdown } from "frappe-ui";
import { useAuthStore } from "@/stores/auth";
import type {
  OperationsPeriod,
  OperationsSummary,
} from "../data/dashboardData";
import LucideCalendarDays from "~icons/lucide/calendar-days";
import LucideChevronDown from "~icons/lucide/chevron-down";
import LucideSlidersHorizontal from "~icons/lucide/sliders-horizontal";

const props = defineProps<{
  periodContext: OperationsSummary | null;
}>();
const emit = defineEmits<{
  (event: "select-period", period: OperationsPeriod): void;
  (event: "customize"): void;
}>();

const authStore = useAuthStore();
const userName = computed(
  () => authStore.userFirstName || authStore.userName || "there"
);
const periodOptions: Array<{
  label: string;
  onClick: () => void;
}> = [
  ["Today", "today"],
  ["Yesterday", "yesterday"],
  ["Last 7 Days", "last_7_days"],
  ["Last 30 Days", "last_30_days"],
].map(([label, period]) => ({
  label,
  onClick: () => emit("select-period", period as OperationsPeriod),
}));

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value + "T00:00:00"));
}

const dateRangeLabel = computed(() => {
  const context = props.periodContext;
  if (!context) return "";
  if (context.from_date === context.to_date)
    return formatDate(context.from_date);
  return formatDate(context.from_date) + " - " + formatDate(context.to_date);
});
</script>
