// Focused assertions are run through the existing esbuild dependency because
// this frontend package does not currently define a unit-test runner.
import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const output = join(tmpdir(), `kancom-workbench-scopes-${process.pid}.cjs`);

await build({
  entryPoints: ["src/kancom/ticketList/workbenchFilters.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: output,
});

try {
  const scopes = require(output);
  const context = {
    persona: "team_leader",
    managed_teams: ["AirOps", "VisaOps"],
    effective_permissions: [
      "view_unassigned",
      "view_team_queues",
      "view_team_workload",
    ],
  };
  const chips = Object.fromEntries(
    scopes.workbenchChips.map((chip) => [chip.key, chip.enabled])
  );

  assert.equal(chips.sla_risk, true);
  assert.equal(chips.unassigned, true);
  assert.equal(chips.closed, true);
  assert.equal(chips.client_replied, false);

  const resolve = (scope) =>
    scopes.resolvePrimaryWorkbenchState({ scope }, "tl@example.com", context);
  assert.deepEqual(resolve("sla_breached").filters, {
    agreement_status: "Failed",
  });
  assert.deepEqual(resolve("unassigned").filters, {
    _assign: ["is", "not set"],
  });
  assert.deepEqual(resolve("closed").filters, {
    status_category: "Resolved",
  });
  assert.deepEqual(resolve("queues").filters, {
    agent_group: ["in", ["AirOps", "VisaOps"]],
  });

  const agentContext = {
    persona: "agent",
    teams: ["AirOps"],
    effective_permissions: ["view_reports"],
  };
  const visibleAgentChips = scopes
    .getVisibleWorkbenchChips(agentContext)
    .map((chip) => chip.key);
  assert.equal(visibleAgentChips.includes("control_view"), false);
  assert.equal(visibleAgentChips.includes("unassigned"), false);
  assert.equal(visibleAgentChips.includes("triage"), false);
  assert.equal(
    scopes.resolvePrimaryWorkbenchState(
      { scope: "control" },
      "agent@example.com",
      agentContext
    ).scope,
    "queues"
  );
  assert.equal(
    scopes.resolvePrimaryWorkbenchState(
      { scope: "unassigned" },
      "agent@example.com",
      agentContext
    ).scope,
    "queues"
  );

  const headContext = {
    persona: "operations_head",
    managed_teams: ["AirOps"],
    effective_permissions: ["view_control", "view_unassigned"],
  };
  assert.equal(
    scopes.resolvePrimaryWorkbenchState({}, "head@example.com", headContext)
      .scope,
    "control"
  );

  assert.deepEqual(
    scopes.replacePrimaryWorkbenchFilters(
      {
        agent_group: "AirOps",
        _assign: ["LIKE", "%old%"],
        agreement_status: "Failed",
        status_category: "Resolved",
        priority: "High",
      },
      { _assign: ["is", "not set"] }
    ),
    { priority: "High", _assign: ["is", "not set"] }
  );
} finally {
  await rm(output, { force: true });
}

console.log("Kancom workbench scope tests passed");
