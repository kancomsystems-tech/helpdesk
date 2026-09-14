<template>
  <div
    class="travelos-workforce-demand-chart"
    aria-label="Demand versus available capacity forecast by week"
  >
    <p>
      Forecast request demand is shown against available team capacity for the
      next four planning weeks.
    </p>
    <AxisChart class="travelos-workforce-axis-chart" :config="chartConfig" />
  </div>
</template>

<script setup lang="ts">
import { AxisChart } from "frappe-ui";
import { computed } from "vue";

import type { WorkforceDemandPoint } from "../data/workforceData";

const props = defineProps<{
  data: WorkforceDemandPoint[];
}>();

const chartRows = computed(() =>
  props.data.map((point) => ({
    week: point.week,
    "Demand / Volume": point.volume,
    Capacity: point.capacity,
  }))
);

const chartConfig = computed(() => ({
  data: chartRows.value,
  title: "",
  colors: ["#2563eb", "#16a34a"],
  xAxis: {
    key: "week",
    type: "category" as const,
    title: "Week",
  },
  yAxis: {
    title: "Requests",
  },
  series: [
    {
      name: "Demand / Volume",
      type: "bar" as const,
      showDataLabels: true,
      echartOptions: {
        barMaxWidth: 38,
      },
    },
    {
      name: "Capacity",
      type: "line" as const,
      showDataLabels: true,
      showDataPoints: true,
      lineWidth: 3,
    },
  ],
  echartOptions: {
    grid: {
      left: "1%",
      right: "2%",
      top: 20,
      bottom: 42,
      containLabel: true,
    },
    tooltip: {
      trigger: "axis",
      confine: true,
    },
  },
}));
</script>
