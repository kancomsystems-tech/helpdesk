import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const page = await readFile(
  "src/kancom/analytics/pages/AnalyticsDashboard.vue",
  "utf8"
);
const data = await readFile(
  "src/kancom/analytics/data/analyticsData.ts",
  "utf8"
);
const shell = await readFile(
  "src/kancom/shell/components/ProductShellPage.vue",
  "utf8"
);
const navigation = await readFile("src/kancom/shell/navigation.ts", "utf8");
const registration = await readFile("src/kancom/registerExtension.ts", "utf8");
const router = await readFile("src/router/index.ts", "utf8");

for (const demoValue of [
  "1,286",
  "842",
  "214",
  "07m 28s",
  "4h 32m",
  "Air Agent",
  "Hotel Agent",
  "Demo MICE Client",
]) {
  assert.equal((page + data).includes(demoValue), false);
}

assert.match(page, /kancom_custom\.api\.analytics_dashboard\.get_summary/);
assert.match(page, /Current Open Inventory/);
assert.match(page, /Current SLA Breaches/);
assert.match(page, /Fulfilled \/ evaluated/);
assert.match(page, /candidate\.agent_performance\?\.state === "preview"/);
assert.match(page, /Filters · Preview/);
assert.match(page, /Export · Preview/);
assert.match(page, /v-if="hasTrendData"/);
assert.match(page, /if \(!count \|\| !maximumTrendCount\.value\) return "0%"/);
assert.match(page, /No evaluated SLA outcomes in this period/);
assert.match(page, /No client requests in this period/);
assert.match(shell, /<slot name="actions">/);
assert.doesNotMatch(data, /export const analyticsKpis/);
assert.doesNotMatch(data, /export const requestTrend/);
assert.doesNotMatch(data, /export const clientPerformance/);
assert.doesNotMatch(data, /export const agentPerformance/);
assert.doesNotMatch(data, /export const slaByTeam/);

console.log("Kancom Analytics live dashboard tests passed");

assert.match(navigation, /capability: "analytics",[\s\S]*admin: true/);
assert.match(registration, /meta: \{ admin: true, capability: "analytics" \}/);
assert.match(router, /to\.meta\.admin && !authStore\.isAdmin/);
