<template>
  <ProductShellPage
    title="Analytics Dashboard"
    description="Performance visibility across request volume, SLA posture, client patterns and agent throughput."
    period="01 May 2025 - 31 May 2025"
  >
    <div class="travelos-kpi-grid mt-4">
      <section v-for="kpi in analyticsKpis" :key="kpi.label" class="travelos-card travelos-kpi-card">
        <p>{{ kpi.label }}</p>
        <strong>{{ kpi.value }}</strong>
        <span>{{ kpi.trend }}</span>
      </section>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-[1.35fr_1fr_1fr]">
      <section class="travelos-card xl:col-span-1">
        <div class="travelos-card-heading">
          <h2>Request Trends</h2>
          <span>Daily volume</span>
        </div>
        <div class="travelos-line-chart" aria-label="Request trend chart">
          <span v-for="(point, index) in requestTrend" :key="index" :style="{ height: `${point}%` }" />
        </div>
      </section>

      <section class="travelos-card">
        <div class="travelos-card-heading">
          <h2>SLA Performance</h2>
          <span>By team</span>
        </div>
        <div class="space-y-3">
          <div v-for="team in slaByTeam" :key="team.team" class="travelos-progress-row">
            <div><span>{{ team.team }}</span><strong>{{ team.score }}%</strong></div>
            <div><span :style="{ width: `${team.score}%` }" /></div>
          </div>
        </div>
      </section>

      <section class="travelos-card">
        <div class="travelos-card-heading">
          <h2>Resolution Mix</h2>
          <span>Current cycle</span>
        </div>
        <div class="travelos-donut travelos-donut-blue">
          <strong>842</strong>
          <span>Resolved</span>
        </div>
        <div class="mt-4 grid grid-cols-2 gap-2 text-sm text-ink-gray-6">
          <span>Pending 214</span>
          <span>Breached 7</span>
          <span>Follow-up 18</span>
          <span>Closed 842</span>
        </div>
      </section>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-2">
      <section class="travelos-card">
        <div class="travelos-card-heading">
          <h2>Client Performance</h2>
          <span>Request load and SLA</span>
        </div>
        <div class="travelos-table">
          <div class="travelos-table-row is-header"><span>Client</span><span>Requests</span><span>SLA</span><span>Trend</span></div>
          <div v-for="client in clientPerformance" :key="client.name" class="travelos-table-row">
            <span>{{ client.name }}</span><span>{{ client.requests }}</span><span>{{ client.sla }}</span><span>{{ client.trend }}</span>
          </div>
        </div>
      </section>

      <section class="travelos-card">
        <div class="travelos-card-heading">
          <h2>Agent Performance</h2>
          <span>Throughput and response</span>
        </div>
        <div class="travelos-table">
          <div class="travelos-table-row is-header"><span>Agent</span><span>Resolved</span><span>Response</span><span>SLA</span></div>
          <div v-for="agent in agentPerformance" :key="agent.agent" class="travelos-table-row">
            <span>{{ agent.agent }}</span><span>{{ agent.resolved }}</span><span>{{ agent.response }}</span><span>{{ agent.sla }}</span>
          </div>
        </div>
      </section>
    </div>
  </ProductShellPage>
</template>

<script setup lang="ts">
import ProductShellPage from "../../shell/components/ProductShellPage.vue";
import {
  agentPerformance,
  analyticsKpis,
  clientPerformance,
  requestTrend,
  slaByTeam,
} from "../data/analyticsData";
</script>
