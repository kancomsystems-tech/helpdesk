<template>
  <div class="travelos-v2-lower-grid">
    <section class="travelos-v2-lower-card">
      <h2>Client SLA Monitor</h2>
      <div class="travelos-v2-client-list">
        <RouterLink v-for="client in clients" :key="client.client" to="/customers" :class="`is-${client.tone}`">
          <div><strong>{{ client.client }}</strong><span>{{ client.detail }}</span></div>
          <p>{{ client.status }}</p>
        </RouterLink>
      </div>
    </section>

    <section class="travelos-v2-lower-card">
      <h2>Agent Availability</h2>
      <div class="travelos-v2-availability">
        <div class="travelos-v2-donut"><strong>{{ totalAgents }}</strong><span>Agents</span></div>
        <div class="travelos-v2-legend">
          <div v-for="item in agents" :key="item.label" :class="`is-${item.tone}`">
            <span />
            <p>{{ item.label }}</p>
            <strong>{{ item.value }}</strong>
          </div>
        </div>
      </div>
    </section>

    <section class="travelos-v2-lower-card travelos-v2-activity-card">
      <div class="travelos-v2-rail-heading">
        <h2>Today’s Activity</h2>
        <RouterLink to="/tickets">View All Activity</RouterLink>
      </div>
      <div class="travelos-v2-activity-list">
        <RouterLink v-for="item in activity" :key="`${item.time}-${item.label}`" to="/tickets" :class="`is-${item.tone}`">
          <time>{{ item.time }}</time>
          <div><strong>{{ item.label }}</strong><span>{{ item.detail }}</span></div>
        </RouterLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import type { ActivityItem, AgentAvailabilitySlice, ClientSlaRow } from "../data/dashboardData";

const props = defineProps<{
  activity: ActivityItem[];
  clients: ClientSlaRow[];
  agents: AgentAvailabilitySlice[];
}>();

const totalAgents = computed(() => props.agents.reduce((total, item) => total + item.value, 0));
</script>
