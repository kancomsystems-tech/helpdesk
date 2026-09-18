import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

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
for (const fixture of [
  "analyticsKpis",
  "requestTrend",
  "clientPerformance",
  "agentPerformance",
  "slaByTeam",
]) {
  assert.doesNotMatch(data, new RegExp(`export const ${fixture}`));
}
assert.match(navigation, /capability: "analytics",[\s\S]*analytics: true/);
assert.match(
  registration,
  /meta: \{ analytics: true, capability: "analytics" \}/
);
assert.match(router, /to\.meta\.analytics[\s\S]*canAccessAnalytics/);

const require = createRequire(import.meta.url);
const output = join(tmpdir(), `kancom-access-policy-${process.pid}.cjs`);
await build({
  entryPoints: ["src/kancom/product/accessPolicy.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: output,
});
try {
  const { canAccessAnalytics } = require(output);
  assert.equal(canAccessAnalytics("operations_head", false), true);
  assert.equal(canAccessAnalytics("administrator", true), true);
  assert.equal(canAccessAnalytics("team_leader", false), false);
  assert.equal(canAccessAnalytics("agent", false), false);
} finally {
  await rm(output, { force: true });
}
console.log("Kancom Analytics live dashboard and access tests passed");
