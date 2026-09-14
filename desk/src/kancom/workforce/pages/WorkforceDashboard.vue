<template>
  <ProductShellPage
    title="Workforce Dashboard"
    description="Plan, forecast, schedule and monitor travel operations staffing against queue demand."
    period="Last 13 weeks"
  >
    <div class="travelos-kpi-grid mt-4">
      <section v-for="kpi in workforceKpis" :key="kpi.label" class="travelos-card travelos-kpi-card">
        <p>{{ kpi.label }}</p>
        <strong>{{ kpi.value }}</strong>
        <span>{{ kpi.helper }}</span>
      </section>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-[1.4fr_1fr]">
      <section class="travelos-card">
        <div class="travelos-card-heading">
          <h2>Demand Forecast</h2>
          <span>Volume vs capacity</span>
        </div>
        <TravelosWorkforceDemandChart :data="demandForecast" />
      </section>

      <section class="travelos-card">
        <div class="travelos-card-heading">
          <h2>Team Load Distribution</h2>
          <span>Today</span>
        </div>
        <div class="space-y-3">
          <div v-for="team in teamLoad" :key="team.team" class="travelos-progress-row">
            <div><span>{{ team.team }}</span><strong>{{ team.load }}/{{ team.capacity }}</strong></div>
            <div><span :style="{ width: `${Math.min((team.load / team.capacity) * 100, 100)}%` }" /></div>
            <small>{{ team.state }}</small>
          </div>
        </div>
      </section>
    </div>

    <div class="mt-4 grid gap-4 xl:grid-cols-3">
      <section class="travelos-card">
        <div class="travelos-card-heading"><h2>Forecasting</h2><span>AI-assisted planning</span></div>
        <p class="travelos-card-copy">Forecast queue arrivals from historical request patterns, events and seasonal travel windows.</p>
        <button class="travelos-primary-action" type="button">Run Forecast</button>
      </section>
      <section class="travelos-card">
        <div class="travelos-card-heading"><h2>Scheduling</h2><span>Coverage plan</span></div>
        <p class="travelos-card-copy">Generate team coverage across AirOps, HotelOps, VisaOps and ETS against service-level targets.</p>
        <button class="travelos-primary-action" type="button">Generate Schedule</button>
      </section>
      <section class="travelos-card">
        <div class="travelos-card-heading"><h2>Roster Overview</h2><span>Manager review</span></div>
        <ul class="travelos-insight-list">
          <li v-for="action in rosterActions" :key="action">{{ action }}</li>
        </ul>
      </section>
    </div>
  </ProductShellPage>
</template>

<script setup lang="ts">
import ProductShellPage from "../../shell/components/ProductShellPage.vue";
import TravelosWorkforceDemandChart from "../components/TravelosWorkforceDemandChart.vue";
import {
  demandForecast,
  rosterActions,
  teamLoad,
  workforceKpis,
} from "../data/workforceData";
</script>
