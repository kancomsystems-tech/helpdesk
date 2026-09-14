<template>
  <ProductShellPage
    title="Quality Management Dashboard"
    description="Real-time overview of quality performance, coaching needs and customer interaction standards."
    period="28 Apr - 04 May 2025"
  >
    <div class="travelos-kpi-grid travelos-responsive-kpis mt-4">
      <section v-for="kpi in qualityKpis" :key="kpi.label" class="travelos-card travelos-kpi-card">
        <p>{{ kpi.label }}</p>
        <strong>{{ kpi.value }}</strong>
        <span>{{ kpi.helper }}</span>
      </section>
    </div>

    <div class="travelos-dashboard-grid-3 mt-4">
      <section class="travelos-card">
        <div class="travelos-card-heading"><h2>Quality Trend</h2><span>Daily score</span></div>
        <div class="travelos-line-chart travelos-chart-frame" aria-label="Quality trend chart">
          <span v-for="(point, index) in qualityTrend" :key="index" :style="{ height: `${point}%` }" />
        </div>
      </section>
      <section class="travelos-card">
        <div class="travelos-card-heading"><h2>Quality Strengths</h2><span>Top signals</span></div>
        <div class="space-y-3">
          <div v-for="item in strengths" :key="item.label" class="travelos-progress-row">
            <div><span>{{ item.label }}</span><strong>{{ item.score }}%</strong></div>
            <div><span :style="{ width: `${item.score}%` }" /></div>
          </div>
        </div>
      </section>
      <section class="travelos-card">
        <div class="travelos-card-heading"><h2>Coaching Opportunities</h2><span>Focus gaps</span></div>
        <div class="space-y-3">
          <div v-for="item in gaps" :key="item.label" class="travelos-progress-row is-warning">
            <div><span>{{ item.label }}</span><strong>{{ item.score }}%</strong></div>
            <div><span :style="{ width: `${item.score}%` }" /></div>
          </div>
        </div>
      </section>
    </div>

    <div class="travelos-dashboard-grid-2 mt-4">
      <section class="travelos-card travelos-grid-span-2">
        <div class="travelos-card-heading"><h2>Agent Summary</h2><span>Evaluations and trend</span></div>
        <div class="travelos-table-scroll">
          <div class="travelos-table">
            <div class="travelos-table-row is-header"><span>Agent</span><span>Evaluations</span><span>Score</span><span>Trend</span></div>
            <div v-for="agent in agentSummary" :key="agent.agent" class="travelos-table-row">
              <span>{{ agent.agent }}</span><span>{{ agent.evaluations }}</span><span>{{ agent.score }}</span><span>{{ agent.trend }}</span>
            </div>
          </div>
        </div>
      </section>
      <section class="travelos-card">
        <div class="travelos-card-heading"><h2>Evaluation Status</h2><span>Current cycle</span></div>
        <div class="travelos-donut travelos-donut-green"><strong>1,248</strong><span>Evaluations</span></div>
        <ul class="travelos-insight-list mt-4">
          <li>Completed evaluations are pacing ahead of target.</li>
          <li>VisaOps coaching queue needs manager review.</li>
          <li>Calibration score remains above operating threshold.</li>
        </ul>
      </section>
    </div>

    <div class="travelos-quality-lower-band travelos-dashboard-grid-3 mt-4">
      <section class="travelos-card travelos-quality-goals-card">
        <div class="travelos-card-heading"><h2>Quality Goals</h2><span>Cycle targets</span></div>
        <div class="travelos-quality-goal-list">
          <div v-for="goal in qualityGoals" :key="goal.label" class="travelos-quality-goal-row" :class="`is-${goal.tone}`">
            <div>
              <span>{{ goal.label }}</span>
              <strong>{{ goal.current }}</strong>
            </div>
            <div class="travelos-quality-goal-meta">
              <small>Target {{ goal.target }}</small>
              <em>{{ goal.status }}</em>
            </div>
            <div class="travelos-quality-bar"><span :style="{ width: `${goal.progress}%` }" /></div>
          </div>
        </div>
      </section>

      <section class="travelos-card travelos-quality-alerts-card">
        <div class="travelos-card-heading"><h2>Monitoring Alerts</h2><span>{{ qualityAlertSummary.value }} {{ qualityAlertSummary.label }}</span></div>
        <p class="travelos-quality-alert-summary">{{ qualityAlertSummary.helper }}</p>
        <div class="travelos-quality-alert-list">
          <RouterLink v-for="alert in monitoringAlerts" :key="alert.label" :to="alert.route" class="travelos-quality-alert-row" :class="`is-${alert.tone}`">
            <span>{{ alert.severity }}</span>
            <div>
              <strong>{{ alert.label }}</strong>
              <small>{{ alert.description }}</small>
            </div>
            <em>{{ alert.count }}</em>
          </RouterLink>
        </div>
      </section>

      <section class="travelos-card travelos-quality-coaching-card">
        <div class="travelos-card-heading"><h2>Evaluator / Coaching Summary</h2><span>Workflow counts</span></div>
        <div class="travelos-quality-summary-grid">
          <div v-for="item in coachingSummary" :key="item.label" class="travelos-quality-summary-card" :class="`is-${item.tone}`">
            <strong>{{ item.value }}</strong>
            <span>{{ item.label }}</span>
            <small>{{ item.helper }}</small>
          </div>
        </div>
      </section>
    </div>
  </ProductShellPage>
</template>

<script setup lang="ts">
import ProductShellPage from "../../shell/components/ProductShellPage.vue";
import {
  agentSummary,
  coachingSummary,
  gaps,
  monitoringAlerts,
  qualityAlertSummary,
  qualityGoals,
  qualityKpis,
  qualityTrend,
  strengths,
} from "../data/qualityData";
</script>
