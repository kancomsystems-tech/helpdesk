import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
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
  const defaults = layout.defaultOperationsKpiOrder;

  assert.deepEqual(layout.resolveOperationsKpiLayout(null).order, defaults);
  assert.deepEqual(
    layout.getVisibleOperationsKpiIds({
      order: defaults,
      hidden: ["unassigned"],
    }),
    defaults.filter((id) => id !== "unassigned")
  );
  assert.deepEqual(
    layout
      .resolveOperationsKpiLayout({
        order: ["closed_today", "created_today"],
        hidden: [],
      })
      .order.slice(0, 2),
    ["closed_today", "created_today"]
  );
  assert.deepEqual(
    layout.resolveOperationsKpiLayout("malformed").order,
    defaults
  );
  assert.equal(
    layout
      .resolveOperationsKpiLayout({
        order: ["unknown", "unassigned"],
        hidden: ["unknown"],
      })
      .order.includes("unknown"),
    false
  );

  const authorized = ["created_today", "open_inventory"];
  assert.deepEqual(
    layout.resolveOperationsKpiLayout(
      {
        order: ["sla_breached", "created_today"],
        hidden: [],
      },
      authorized
    ).order,
    authorized
  );
  assert.equal(
    layout.parseOperationsKpiPreference(
      JSON.stringify({ kpi_layout: { order: authorized, hidden: [] } })
    ).order[0],
    "created_today"
  );
  assert.equal(layout.parseOperationsKpiPreference("{"), null);
  assert.deepEqual(
    layout.getAvailableOperationsKpiIds("agent", true),
    defaults
  );
  assert.deepEqual(
    layout.getAvailableOperationsKpiIds("team_leader", false),
    []
  );
  assert.deepEqual(layout.getAvailableOperationsKpiIds(null, true), []);
} finally {
  await rm(output, { force: true });
}

console.log("Kancom Operations KPI layout tests passed");
