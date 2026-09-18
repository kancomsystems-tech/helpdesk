import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createRequire } from "node:module";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const output = join(tmpdir(), `kancom-working-persona-${process.pid}.cjs`);

await build({
  entryPoints: ["src/kancom/product/personaContext.ts"],
  bundle: true,
  format: "cjs",
  platform: "node",
  outfile: output,
});

try {
  const persona = require(output);
  assert.equal(persona.shouldShowWorkingPersonaSwitcher(["agent"]), false);
  assert.equal(
    persona.shouldShowWorkingPersonaSwitcher(["agent", "team_leader"]),
    true
  );
  assert.equal(
    persona.shouldShowWorkingPersonaSwitcher(
      ["agent", "team_leader", "operations_head"],
      true
    ),
    false
  );
  assert.deepEqual(persona.getWorkingPersonaOptions(["agent", "team_leader"]), [
    { value: "agent", label: "Agent" },
    { value: "team_leader", label: "Team Leader" },
  ]);
  assert.deepEqual(
    persona
      .getWorkingPersonaOptions(["agent", "team_leader", "operations_head"])
      .map((item) => item.label),
    ["Agent", "Team Leader", "Operations Head"]
  );
  assert.deepEqual(persona.getWorkingPersonaLandingRoute(), {
    name: "Dashboard",
  });

  const context = {
    persona: "operations_head",
    working_persona: "agent",
    managed_teams: ["AirOps", "VisaOps"],
    working_managed_teams: [],
  };
  assert.deepEqual(persona.toWorkingProductContext(context), {
    ...context,
    persona: "agent",
    managed_teams: [],
  });

  const switcher = await readFile(
    "src/kancom/shell/WorkingPersonaSwitcher.vue",
    "utf8"
  );
  const desktop = await readFile("src/components/layouts/Sidebar.vue", "utf8");
  const mobile = await readFile(
    "src/components/layouts/MobileSidebar.vue",
    "utf8"
  );
  assert.match(switcher, /Operating as:/);
  assert.doesNotMatch(switcher, /Working as:/);
  assert.match(switcher, /focus-visible:outline/);
  assert.match(switcher, /setWorkingPersona\(persona\)/);
  assert.match(switcher, /route\.name !== "Dashboard"/);
  assert.doesNotMatch(switcher, /logout/);
  assert.match(desktop, /is_platform_administrator[\s\S]*System Admin/);
  assert.match(mobile, /is_platform_administrator[\s\S]*System Admin/);
  const commandBar = await readFile(
    "src/kancom/operations/components/OperationsCommandBar.vue",
    "utf8"
  );
  assert.match(commandBar, /New Request/);
  assert.match(commandBar, /aria-label="Notifications"/);
  assert.match(commandBar, /aria-label="Open account menu"/);
  assert.match(commandBar, /<Dropdown :options="accountOptions"/);
  assert.doesNotMatch(commandBar, /<strong>{{ userName }}<\/strong>/);
  assert.doesNotMatch(commandBar, /<small>{{ profileLabel }}<\/small>/);
  assert.match(commandBar, /setActiveSettingsTab\("Profile"\)/);
  assert.match(commandBar, /is_platform_administrator[\s\S]*System Admin/);
} finally {
  await rm(output, { force: true });
}

console.log("Kancom working persona tests passed");
