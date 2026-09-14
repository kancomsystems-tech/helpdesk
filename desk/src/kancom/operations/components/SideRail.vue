<template>
  <aside class="travelos-v2-side-rail">
    <section class="travelos-v2-rail-card">
      <h2>My Queue</h2>
      <div class="travelos-v2-queue-states">
        <RouterLink v-for="item in myQueueStates" :key="item.label" to="/tickets" :class="`is-${item.tone}`">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
        </RouterLink>
      </div>
    </section>

    <section class="travelos-v2-rail-card">
      <div class="travelos-v2-rail-heading">
        <h2>SLA Status</h2>
        <RouterLink to="/tickets">View All</RouterLink>
      </div>
      <div class="travelos-v2-sla-list">
        <div v-for="row in slaStatusRows" :key="row.label" :class="`is-${row.tone}`">
          <div><span>{{ row.label }}</span><strong>{{ row.value }}%</strong></div>
          <div><span :style="{ width: `${row.value}%` }" /></div>
        </div>
      </div>
    </section>

    <section class="travelos-v2-rail-card">
      <h2>Quick Actions</h2>
      <div class="travelos-v2-action-grid">
        <RouterLink to="/tickets/new"><span><LucidePlus class="size-5" /></span>New Request</RouterLink>
        <RouterLink to="/tickets"><span><LucideSearch class="size-5" /></span>Search</RouterLink>
        <RouterLink to="/tickets"><span><LucideAlertTriangle class="size-5" /></span>SLA Breaches</RouterLink>
        <RouterLink to="/kb"><span><LucideBookOpen class="size-5" /></span>Playbook</RouterLink>
      </div>
    </section>
  </aside>
</template>

<script setup lang="ts">
import LucideAlertTriangle from "~icons/lucide/alert-triangle";
import LucideBookOpen from "~icons/lucide/book-open";
import LucidePlus from "~icons/lucide/plus";
import LucideSearch from "~icons/lucide/search";
import { myQueueStates, slaStatusRows } from "../data/dashboardData";
</script>
