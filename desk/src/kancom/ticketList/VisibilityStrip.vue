<template>
  <section
    v-if="metrics.length"
    class="kancom-visibility-strip"
    aria-label="Current loaded travel request visibility"
  >
    <div
      v-for="metric in metrics"
      :key="metric.key"
      class="kancom-visibility-card"
      :class="{ 'is-risk': metric.tone === 'risk' }"
      title="Counts use currently loaded rows"
    >
      <span class="kancom-visibility-label">{{ metric.label }}</span>
      <strong class="kancom-visibility-value">{{ metric.value }}</strong>
    </div>
    <span class="kancom-visibility-scope">Loaded rows</span>
  </section>
</template>

<script setup lang="ts">
import type { WorkbenchVisibilityMetric } from "./visibilityMetrics";

defineProps<{
  metrics: WorkbenchVisibilityMetric[];
}>();
</script>
