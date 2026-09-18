import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const root = new URL("../", import.meta.url);
const layout = readFileSync(
  new URL("src/components/layouts/layoutSettings.ts", root),
  "utf8"
);
const routes = readFileSync(
  new URL("src/kancom/registerExtension.ts", root),
  "utf8"
);
const page = readFileSync(
  new URL("src/kancom/reports/pages/OperationalReports.vue", root),
  "utf8"
);
const setup = readFileSync(
  new URL("src/components/Settings/SetupSummary.vue", root),
  "utf8"
);

assert.doesNotMatch(layout, /\/app\/hd-ticket\/view\/report/);
assert.match(layout, /to: "OperationalReports"/);
assert.match(routes, /path: "\/reports"[\s\S]*capability: "basic_reports"/);
assert.match(page, /kancom_custom\.api\.operational_reports\.get_report/);
for (const label of [
  "From date",
  "Team",
  "Agent / Owner",
  "Client",
  "Product",
  "Category",
  "Priority",
  "Status",
  "SLA status",
  "Total Requests",
  "Resolved",
  "Current Open / unresolved",
  "SLA Breached",
  "Export CSV",
])
  assert.match(page, new RegExp(label));
assert.match(setup, /Operating scope/);
assert.match(setup, /Enabled capabilities/);
console.log("Kancom operational reports boundary tests passed");
