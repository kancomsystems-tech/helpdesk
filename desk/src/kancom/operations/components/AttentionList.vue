<template>
  <section class="travelos-v2-attention">
    <div class="travelos-v2-section-heading">
      <div>
        <h2>Needs Immediate Attention</h2>
        <p>
          Operational items that should be reviewed before the next service
          window.
        </p>
      </div>
    </div>
    <div class="travelos-v2-attention-grid">
      <div
        v-for="item in items"
        :key="item.label"
        class="travelos-v2-attention-card"
        :class="toneClass(item.tone)"
      >
        <div class="travelos-v2-attention-icon" :class="toneClass(item.tone)">
          <component :is="iconFor(item.label)" class="size-6" />
        </div>
        <div>
          <strong>{{ item.count }}</strong>
          <p>{{ item.label }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import LucideAlertTriangle from "~icons/lucide/alert-triangle";
import LucideClipboardCheck from "~icons/lucide/clipboard-check";
import type { AttentionItem, KpiTone } from "../data/dashboardData";

defineProps<{ items: AttentionItem[] }>();

function toneClass(tone: KpiTone) {
  return `is-${tone}`;
}

function iconFor(label: string) {
  if (label.includes("Unassigned")) return LucideClipboardCheck;
  return LucideAlertTriangle;
}
</script>
