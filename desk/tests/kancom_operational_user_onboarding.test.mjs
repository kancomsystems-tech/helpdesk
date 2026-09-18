import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const form = await readFile(
  "src/kancom/product/AddOperationalUser.vue",
  "utf8"
);
const settings = await readFile(
  "src/components/Settings/settingsModal.ts",
  "utf8"
);
const policy = await readFile(
  "src/kancom/product/productAdministration.ts",
  "utf8"
);
const teamMembers = await readFile(
  "src/components/Settings/TeamMembers.vue",
  "utf8"
);
const agents = await readFile("src/components/Settings/Agents.vue", "utf8");

assert.match(settings, /label: __\("Add User"\)/);
assert.match(settings, /AddOperationalUser/);
assert.match(
  policy,
  /operations_head_managed: \["Add User", "Agents", "Teams"\]/
);
assert.doesNotMatch(policy, /team_leader: \[[^\]]*"Add User"/s);
assert.doesNotMatch(policy, /agent: \[[^\]]*"Add User"/s);
assert.match(form, /Operational Role/);
assert.match(form, /v-if="form\.worksTickets"[\s\S]*Worker Teams/);
assert.match(form, /v-if="isTeamLeader"[\s\S]*Managed Teams/);
assert.match(form, /:disabled="isAgent"/);
assert.match(form, /send_invite: form\.sendInvite/);
assert.match(form, /operational_role: form\.operationalRole/);
assert.match(form, /worker_teams: selectedValues/);
assert.match(form, /managed_teams: selectedValues/);
assert.doesNotMatch(form, /System Manager|Agent Manager|password\s*:/);
assert.match(form, /kancom:operational-user-added/);
assert.match(teamMembers, /kancom:operational-user-added/);
assert.match(agents, /kancom:operational-user-added/);
assert.doesNotMatch(agents, /setActiveSettingsTab\(.[Ii]nvite Agents/);
assert.match(agents, /setActiveSettingsTab\(.[Aa]dd User/);
assert.match(form, /safeError/);

console.log("Kancom operational user onboarding frontend tests passed");
