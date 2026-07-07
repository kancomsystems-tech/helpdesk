<template>
  <div class="kancom-travel-requests-workbench kancom-workbench-header">
    <div class="kancom-workbench-titlebar">
      <div class="min-w-0">
        <p class="kancom-workbench-eyebrow">CONTROL DESK</p>
        <h1 class="kancom-workbench-title">Travel Requests Workbench</h1>
        <p class="kancom-workbench-subtitle">
          Control ownership, SLA risk and closure across client requests
        </p>
      </div>
      <div class="kancom-workbench-actions">
        <WorkbenchViews
          v-if="viewOptions?.length"
          :options="viewOptions"
          :dropdown-actions="viewActions"
          :current-view="currentView"
        />
        <RouterLink :to="createRoute" class="kancom-new-request-link">
          <Button label="New Request" theme="gray" variant="solid">
            <template #prefix>
              <LucidePlus class="h-3.5 w-3.5" />
            </template>
          </Button>
        </RouterLink>
      </div>
    </div>

    <VisibilityStrip :metrics="metrics" />

    <div class="kancom-workbench-chips" aria-label="Travel request work views">
      <button
        v-for="chip in chips"
        :key="chip.key"
        class="kancom-workbench-chip"
        :class="{
          'is-active': activeChip === chip.key,
          'is-disabled': !chip.enabled,
        }"
        :disabled="!chip.enabled"
        :title="chip.reason"
        type="button"
        @click="$emit('chipClick', chip)"
      >
        {{ chip.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import LucidePlus from "~icons/lucide/plus";
import VisibilityStrip from "./VisibilityStrip.vue";
import WorkbenchViews from "./WorkbenchViews.vue";
import type { WorkbenchVisibilityMetric } from "./visibilityMetrics";
import type { WorkbenchChip } from "./workbenchFilters";

defineProps<{
  createRoute: Record<string, string>;
  chips: WorkbenchChip[];
  activeChip?: string;
  metrics: WorkbenchVisibilityMetric[];
  viewOptions: Array<Record<string, any>>;
  viewActions: (view: Record<string, any>) => Array<Record<string, any>>;
  currentView: {
    label?: string;
    icon?: any;
  };
}>();

defineEmits<{
  chipClick: [chip: WorkbenchChip];
}>();
</script>
