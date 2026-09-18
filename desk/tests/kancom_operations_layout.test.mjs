import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const output = join(tmpdir(), `kancom-operations-layout-${process.pid}.cjs`);

await build({
  entryPoints: ["src/kancom/operations/data/dashboardLayout.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: output,
});

try {
  const layout = require(output);
  const library = layout.operationsKpiCardLibrary;
  const allIds = library.map((card) => card.id);
  const liveIds = library
    .filter((card) => card.type !== "preview")
    .map((card) => card.id);
  const breakdownIds = library
    .filter((card) => card.type === "live_breakdown")
    .map((card) => card.id);
  const previewCards = library.filter((card) => card.type === "preview");
  const historicalPreviewIds = [
    "due_soon",
    "vip_priority",
    "escalations",
    "my_queue",
    "sla_performance",
    "client_sla_monitor",
    "agent_availability",
    "today_activity",
  ];

  assert.deepEqual(liveIds, [
    "created_today",
    "open_inventory",
    "sla_breached",
    "closed_today",
    "unassigned",
    "due_soon",
    "vip_priority",
    "my_queue",
    "sla_performance",
    "team_sla_performance",
    "client_sla_monitor",
    "client_wise_open",
    "team_wise_open",
    "product_wise_open",
    "category_wise_open",
    "workload_by_team",
    "actionable_waiting",
    "created_resolved",
    "sla_outcome",
  ]);
  assert.deepEqual(breakdownIds, [
    "team_sla_performance",
    "client_sla_monitor",
    "client_wise_open",
    "team_wise_open",
    "product_wise_open",
    "category_wise_open",
  ]);
  assert.deepEqual(
    historicalPreviewIds.filter((id) => !allIds.includes(id)),
    []
  );
  assert.equal(new Set(allIds).size, allIds.length);
  assert.ok(
    library
      .filter((card) => card.type !== "preview")
      .every((card) => card.sourceField)
  );
  assert.ok(
    previewCards.every((card) => !card.sourceField && !card.defaultVisible)
  );
  assert.ok(previewCards.every((card) => !/\d/.test(card.helper)));

  const defaults = layout.resolveOperationsKpiLayout(null);
  assert.deepEqual(
    layout.getVisibleOperationsKpiIds(defaults),
    layout.defaultVisibleOperationsKpiIds
  );
  assert.ok(
    library
      .filter((card) => !card.defaultVisible)
      .every((card) => defaults.hidden.includes(card.id))
  );

  const legacyIds = [
    "created_today",
    "open_inventory",
    "sla_breached",
    "closed_today",
    "unassigned",
  ];
  const legacyPreference = {
    order: ["closed_today", ...legacyIds.filter((id) => id !== "closed_today")],
    hidden: ["unassigned"],
  };
  const resolvedLegacy = layout.resolveOperationsKpiLayout(legacyPreference);
  assert.equal(resolvedLegacy.order[0], "closed_today");
  assert.ok(resolvedLegacy.hidden.includes("unassigned"));
  assert.ok(
    library
      .filter((card) => !card.defaultVisible)
      .every((card) => resolvedLegacy.hidden.includes(card.id))
  );
  assert.equal(
    layout.getVisibleOperationsKpiIds(resolvedLegacy).includes("due_soon"),
    false
  );

  assert.deepEqual(
    layout
      .resolveOperationsKpiLayout({
        order: ["unknown", "unassigned"],
        hidden: ["unknown"],
      })
      .order.includes("unknown"),
    false
  );
  assert.deepEqual(layout.resolveOperationsKpiLayout("malformed"), defaults);
  assert.deepEqual(layout.resolveOperationsKpiLayout({}), defaults);

  const agentIds = layout.getAvailableOperationsKpiIds("agent", true);
  assert.ok(agentIds.includes("due_soon"));
  assert.ok(agentIds.includes("my_queue"));
  assert.equal(agentIds.includes("agent_availability"), false);
  assert.equal(agentIds.includes("client_sla_monitor"), false);
  assert.deepEqual(
    layout.getAvailableOperationsKpiIds("team_leader", false),
    []
  );
  assert.deepEqual(layout.getAvailableOperationsKpiIds(null, true), []);

  assert.equal(
    layout.parseOperationsKpiPreference(
      JSON.stringify({ kpi_layout: legacyPreference })
    ).order[0],
    "closed_today"
  );
  assert.equal(layout.parseOperationsKpiPreference("{"), null);

  const dashboard = await readFile(
    "src/kancom/operations/pages/OperationsDashboard.vue",
    "utf8"
  );
  const kpiCard = await readFile(
    "src/kancom/operations/components/KpiCard.vue",
    "utf8"
  );
  const topBar = await readFile(
    "src/kancom/operations/components/OperationsTopBar.vue",
    "utf8"
  );
  assert.match(dashboard, /value: "—"/);
  assert.match(kpiCard, /type === 'preview'/);
  assert.match(kpiCard, /type !== 'live_breakdown'/);
  assert.doesNotMatch(kpiCard, /<span/);
  assert.match(kpiCard, />\s*Preview\s*</);
  assert.match(
    topBar,
    /travelos-dashboard-controls[\s\S]*label="Customize"[\s\S]*<Dropdown/
  );
} finally {
  await rm(output, { force: true });
}

console.log("Kancom Operations KPI layout tests passed");
