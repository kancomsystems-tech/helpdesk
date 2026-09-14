<template>
  <section class="travelos-v2-attention">
    <div class="travelos-v2-section-heading">
      <div>
        <h2>Needs Immediate Attention</h2>
        <p>Operational items that should be reviewed before the next service window.</p>
      </div>
    </div>
    <div class="travelos-v2-attention-grid">
      <RouterLink v-for="item in items" :key="item.label" :to="item.route" class="travelos-v2-attention-card" :class="toneClass(item.tone)">
        <div class="travelos-v2-attention-icon" :class="toneClass(item.tone)">
          <component :is="iconFor(item.label)" class="size-6" />
        </div>
        <div>
          <strong>{{ item.count }}</strong>
          <p>{{ item.label }}</p>
          <span>View all</span>
        </div>
      </RouterLink>
    </div>
  </section>
</template>

<script setup lang="ts">
import LucideAlarmClock from "~icons/lucide/alarm-clock";
import LucideAlertTriangle from "~icons/lucide/alert-triangle";
import LucideCircleGauge from "~icons/lucide/gauge-circle";
import LucideClipboardCheck from "~icons/lucide/clipboard-check";
import LucideStar from "~icons/lucide/star";
import type { AttentionItem, KpiTone } from "../data/dashboardData";

defineProps<{ items: AttentionItem[] }>();

function toneClass(tone: KpiTone) {
  return `is-${tone}`;
}

function iconFor(label: string) {
  if (label.includes("Expiring")) return LucideAlarmClock;
  if (label.includes("VIP")) return LucideStar;
  if (label.includes("Escalation")) return LucideCircleGauge;
  if (label.includes("Unassigned")) return LucideClipboardCheck;
  return LucideAlertTriangle;
}
</script>
